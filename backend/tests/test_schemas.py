import pytest
from pydantic import ValidationError
from schemas.product import ProductCreate

def test_product_create_valid():
    """Deve criar um produto com dados válidos"""
    product = ProductCreate(
        nome="Açaí Tradicional",
        preco=15.50,
        estoque=10,
        categoria="Açaí",
        descricao="Delicioso",
        tags=["vegano", "fitness"]
    )
    assert product.nome == "Açaí Tradicional"
    assert product.preco == 15.50
    assert product.tags == ["vegano", "fitness"]

def test_product_create_invalid_price():
    """Deve falhar se o preço for zero ou negativo"""
    with pytest.raises(ValidationError):
        ProductCreate(nome="Teste", preco=-10, estoque=1)
    
    with pytest.raises(ValidationError):
        ProductCreate(nome="Teste", preco=0, estoque=1)

def test_product_create_invalid_stock():
    """Deve falhar se o estoque for negativo"""
    with pytest.raises(ValidationError):
        ProductCreate(nome="Teste", preco=10, estoque=-1)

def test_product_create_empty_name():
    """Deve falhar se o nome for vazio ou apenas espaços"""
    with pytest.raises(ValidationError):
        ProductCreate(nome="", preco=10)
    
    with pytest.raises(ValidationError):
        ProductCreate(nome="   ", preco=10)

def test_product_create_html_injection_name():
    """Deve falhar se o nome conter HTML tags"""
    with pytest.raises(ValidationError):
        ProductCreate(nome="<script>alert('xss')</script>", preco=10)

def test_product_create_rounding():
    """Deve arredondar o preço para 2 casas decimais"""
    product = ProductCreate(nome="Teste", preco=10.5555, estoque=1)
    assert product.preco == 10.56
