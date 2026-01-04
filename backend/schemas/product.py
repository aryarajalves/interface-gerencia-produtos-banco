from pydantic import BaseModel, Field, field_validator, PositiveFloat, NonNegativeInt
from typing import Optional, List

# Modelo de Produto (Visualização)
class Product(BaseModel):
    id: Optional[int] = None
    nome: str
    descricao: Optional[str] = None
    categoria: Optional[str] = None
    tags: Optional[List[str]] = None
    preco: float
    estoque: int

# Modelo de Criação com Validações
class ProductCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=200, description="Nome do produto")
    preco: PositiveFloat = Field(..., description="Preço deve ser maior que zero")
    categoria: Optional[str] = Field(None, max_length=50)
    descricao: Optional[str] = Field(None, max_length=1000)
    estoque: NonNegativeInt = Field(0, description="Estoque não pode ser negativo")
    tags: Optional[List[str]] = Field(default_factory=list, description="Lista de tags do produto")
    
    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('Nome não pode ser vazio ou conter apenas espaços')
        if '<' in v or '>' in v:
            raise ValueError('Nome não pode conter caracteres especiais < ou >')
        return v
    
    @field_validator('preco')
    @classmethod
    def validar_preco(cls, v: float) -> float:
        return round(v, 2)
    
    @field_validator('categoria')
    @classmethod
    def validar_categoria(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
            if '<' in v or '>' in v:
                raise ValueError('Categoria não pode conter caracteres especiais')
        return v
    
    @field_validator('descricao')
    @classmethod
    def validar_descricao(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v = v.strip()
        return v
