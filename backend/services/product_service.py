from core.config import supabase
from schemas.product import ProductCreate
from core.exceptions import ProductAlreadyExistsError, ServiceError

class ProductService:
    @staticmethod
    def list_products(order_by: str = "id", direction: str = "asc"):
        if not supabase:
            raise ServiceError("Supabase não configurado")
        
        # Mapeamento de campos seguros para evitar SQL Injection (mesmo que supabase proteja)
        allowed_columns = {"id": "id", "name": "nome", "price": "preco", "stock": "estoque"}
        column = allowed_columns.get(order_by, "id")
        
        try:
            # desc=True se direction for "desc"
            is_desc = (direction.lower() == "desc")
            response = supabase.table("produtos").select("*").order(column, desc=is_desc).execute()
            return response.data
        except Exception as e:
            raise ServiceError(f"Erro ao listar produtos: {str(e)}")

    @staticmethod
    def create_product(product: ProductCreate):
        if not supabase:
            raise ServiceError("Supabase não configurado")
        
        try:
            # Verificar duplicidade
            existing = supabase.table("produtos").select("id").eq("nome", product.nome).execute()
            if existing.data:
                raise ProductAlreadyExistsError(f"Já existe um produto com o nome '{product.nome}'. Escolha outro nome.")
                
            data = product.model_dump(exclude_unset=True)
            
            response = supabase.table("produtos").insert(data).execute()
            return response.data
        except ProductAlreadyExistsError:
            raise
        except Exception as e:
            raise ServiceError(f"Erro ao criar produto: {str(e)}")

    @staticmethod
    def update_product(product_id: int, product: ProductCreate):
        if not supabase:
            raise ServiceError("Supabase não configurado")
        
        try:
            # Verificar duplicidade se nome mudou
            existing = supabase.table("produtos").select("id").eq("nome", product.nome).neq("id", product_id).execute()
            if existing.data:
                raise ProductAlreadyExistsError(f"Já existe outro produto com o nome '{product.nome}'.")

            data = product.model_dump(exclude_unset=True)
            response = supabase.table("produtos").update(data).eq("id", product_id).execute()
            
            if not response.data:
                raise ResourceNotFoundError(f"Produto {product_id} não encontrado.")
                
            return response.data
        except (ProductAlreadyExistsError, ResourceNotFoundError):
            raise
        except Exception as e:
            raise ServiceError(f"Erro ao atualizar produto: {str(e)}")

    @staticmethod
    def delete_product(product_id: int):
        if not supabase:
            raise ServiceError("Supabase não configurado")
            
        try:
            response = supabase.table("produtos").delete().eq("id", product_id).execute()
            if not response.data:
                raise ResourceNotFoundError(f"Produto {product_id} não encontrado.")
            return True
        except ResourceNotFoundError:
            raise
        except Exception as e:
            raise ServiceError(f"Erro ao deletar produto: {str(e)}")

    @staticmethod
    def bulk_import(file_content: bytes):
        if not supabase:
            raise ServiceError("Supabase não configurado")
        
        import csv
        import io

        try:
            # Decodificar bytes para string (suporte a BOM do Excel)
            decoded = file_content.decode('utf-8-sig')
            
            # Detecção inteligente de delimitador
            try:
                # Ler a primeira linha para estimar
                first_line = decoded.splitlines()[0]
                dialect = csv.Sniffer().sniff(first_line, delimiters=';,')
                delimiter = dialect.delimiter
            except:
                # Fallback se o Sniffer falhar
                delimiter = ';' if ';' in decoded.splitlines()[0] else ','

            csv_reader = csv.DictReader(io.StringIO(decoded), delimiter=delimiter)

            # Validação Estrita de Colunas
            headers = [h.strip().lower() for h in csv_reader.fieldnames or []]
            headers_set = set(headers)
            
            required_cols = {'nome', 'categoria', 'descricao', 'tags', 'preco', 'estoque'}
            missing = required_cols - headers_set
            
            # Se faltar colunas, pode ser que o delimitador detectado esteja errado (ex: ; vs ,)
            # Tentar forçar o outro se falhar muito feio (nenhuma coluna encontrada)
            if missing and len(headers) <= 1:
                # Provavelmente leu tudo como uma coluna só. Tentar o outro.
                alt_delimiter = ',' if delimiter == ';' else ';'
                csv_reader = csv.DictReader(io.StringIO(decoded), delimiter=alt_delimiter)
                headers = [h.strip().lower() for h in csv_reader.fieldnames or []]
                headers_set = set(headers)
                missing = required_cols - headers_set

            if missing:
                raise ServiceError(f"Arquivo inválido. Faltam as colunas: {', '.join(missing)}")

            stats = {"created": 0, "updated": 0, "errors": 0}
            
            for i, row_raw in enumerate(csv_reader):
                try:
                    # Normalizar chaves para acesso seguro
                    row = {k.strip().lower(): v.strip() for k, v in row_raw.items() if k}
                    
                    nome = row.get('nome')
                    categoria = row.get('categoria')
                    preco_str = row.get('preco')
                    estoque_str = row.get('estoque')
                    
                    # Validação de Campos Obrigatórios (apenas dados, não headers)
                    missing_fields = []
                    if not nome: missing_fields.append('nome')
                    if not categoria: missing_fields.append('categoria')
                    if not preco_str: missing_fields.append('preco')
                    if not estoque_str: missing_fields.append('estoque')
                    
                    if missing_fields:
                        raise ValueError(f"Campos obrigatórios vazios: {', '.join(missing_fields)}")

                    # Conversão de Tipos
                    try:
                        preco = float(preco_str.replace(',', '.'))
                        if preco < 0: raise ValueError
                    except:
                        raise ValueError(f"Preço inválido: {preco_str}")

                    try:
                        estoque = int(float(estoque_str))
                        if estoque < 0: raise ValueError
                    except:
                        raise ValueError(f"Estoque inválido: {estoque_str}")

                    # Campos Opcionais
                    descricao = row.get('descricao') or ""
                    tags_str = row.get('tags') or ""
                    tags = [t.strip() for t in tags_str.split(',') if t.strip()]

                    # Upsert Logic
                    existing = supabase.table("produtos").select("id").eq("nome", nome).execute()
                    
                    payload = {
                        "nome": nome,
                        "preco": preco,
                        "estoque": estoque,
                        "categoria": categoria,
                        "descricao": descricao,
                        "tags": tags
                    }

                    if existing.data:
                        # Update
                        pid = existing.data[0]['id']
                        supabase.table("produtos").update(payload).eq("id", pid).execute()
                        stats["updated"] += 1
                    else:
                        # Create
                        supabase.table("produtos").insert(payload).execute()
                        stats["created"] += 1
                        
                except Exception as e:
                    # Capturamos o ValueError lançado pela validação acima
                    print(f"Erro na linha {i+1} ({row.get('nome', 'SemNome')}): {e}")
                    stats["errors"] += 1
            
            return stats

        except Exception as e:
            raise ServiceError(f"Erro ao processar arquivo: {str(e)}")
