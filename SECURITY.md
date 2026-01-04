# 🛡️ Guia de Segurança e Implementação

Este documento detalha a arquitetura de segurança do projeto, com foco principal na implementação de **Row Level Security (RLS)** no Supabase, garantindo que este sistema possa ser replicado com segurança em outros negócios.

## 🔐 1. Banco de Dados (Supabase & RLS)

A camada mais crítica de segurança está no banco de dados. Utilizamos o PostgreSQL com RLS para garantir que as regras de acesso sejam aplicadas diretamente nos dados, independentemente de onde a requisição venha (Frontend, Backend ou API externa).

### Como o RLS funciona neste projeto?
*   **Leitura (Select):** Pública. Qualquer pessoa pode ver a vitrine de produtos.
*   **Escrita (Insert/Update/Delete):** Restrita. Apenas usuários autenticados (com token JWT válido) podem modificar dados.

### 📜 Script de Implementação (SQL)

Para replicar a segurança em um novo ambiente Supabase, execute o seguinte script na aba **SQL Editor**:

```sql
-- 1. Ativar RLS na tabela
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- 2. Política de Leitura Pública
-- Permite que qualquer usuário (anônimo ou logado) veja os produtos
CREATE POLICY "Permitir leitura pública de produtos"
ON produtos FOR SELECT
TO public
USING (true);

-- 3. Política de Inserção (Autenticado)
-- Apenas usuários com token JWT válido podem criar
CREATE POLICY "Permitir inserção apenas para usuários autenticados"
ON produtos FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Política de Atualização (Autenticado)
-- Apenas usuários logados podem editar
CREATE POLICY "Permitir atualização apenas para usuários autenticados"
ON produtos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Política de Exclusão (Autenticado)
-- Apenas usuários logados podem deletar
CREATE POLICY "Permitir exclusão apenas para usuários autenticados"
ON produtos FOR DELETE
TO authenticated
USING (true);
```

### Verificação
Após rodar o script, você pode verificar se as políticas estão ativas com:
```sql
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'produtos';
```

---

## 🛡️ 2. Segurança no Backend (API)

A API Python (FastAPI) atua como uma barreira adicional e orquestrador de lógica.

### Autenticação JWT
Todas as rotas de modificação (`POST`, `PUT`, `DELETE`) são protegidas via dependência `get_current_user`. O backend valida o token JWT do Supabase antes de processar qualquer requisição.

```python
# Exemplo de proteção de rota
@router.post("/", dependencies=[Depends(get_current_user)])
def create_product(...):
    ...
```

### Rate Limiting (Proteção contra Abuso)
Para evitar ataques de força bruta ou sobrecarga, utilizamos `SlowAPI`:
*   **Leitura:** 10 requisições/minuto por IP.
*   **Escrita:** 5 requisições/minuto por IP.

Configurável via variáveis de ambiente:
```env
RATE_LIMIT_READ=10/minute
RATE_LIMIT_WRITE=5/minute
```

### Validação de Dados (Pydantic V2)
Nenhum dado entra no banco sem validação estrita de tipos. Isso previne injeção de dados maliciosos ou corrompidos.

---

## 🌐 3. Infraestrutura (Docker & Traefik)

Em produção, a segurança de rede é gerenciada pelo **Traefik**:

*   **HTTPS Automático:** Certificados TLS/SSL gerados automaticamente via Let's Encrypt.
*   **Proxy Reverso:** O backend e o banco de dados não são expostos diretamente à internet pública; todo o tráfego passa pelo gateway seguro.
*   **Rede Isolada:** O cluster Docker Swarm utiliza redes overlay criptografadas para comunicação entre containers.

---

## 👤 4. Gerenciando Usuários (Supabase Auth)

Para que alguém consiga fazer login no sistema, é necessário criar um usuário no painel do Supabase.

### Passo a Passo para Criar Usuário:
1.  Acesse o Dashboard do seu projeto no Supabase.
2.  No menu lateral esquerdo, clique em **Authentication**.
3.  Clique na aba **Users**.
4.  Clique no botão verde **Add User** (canto superior direito).
5.  Selecione **Send Magic Link** (se configurado) ou **Create new user** (Email/Password).
6.  Preencha o email e senha do usuário.
7.  Clique em **Create User**.
8.  Opcional: Clique nos três pontos `...` ao lado do usuário criado e selecione **Send password recovery** se quiser que ele defina a própria senha.

⚠️ **Atenção:** Como o RLS está ativo, assim que este usuário fizer login, ele terá permissão para Inserir, Atualizar e Deletar produtos. Usuários não cadastrados apenas visualizam.

## ✅ Checklist para Novos Ambientes

Ao implantar este sistema para um novo cliente:
1.  [ ] Criar projeto no Supabase.
2.  [ ] Rodar o script SQL de RLS acima.
3.  [ ] Configurar Autenticação (Email/Senha) no Authentication > Providers.
4.  [ ] Gerar novas chaves de API (`SUPABASE_URL`, `SUPABASE_KEY`).
5.  [ ] Definir `SECRET_KEY` forte para o JWT se for utilizar autenticação customizada no futuro.
