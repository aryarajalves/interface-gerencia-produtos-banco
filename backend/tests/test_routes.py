from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app
from core.exceptions import ProductAlreadyExistsError, ResourceNotFoundError
from core.security import get_current_user

client = TestClient(app)

# Helper para simular usuário logado
def override_get_current_user():
    return {"id": "test-user-id", "email": "test@example.com"}

app.dependency_overrides[get_current_user] = override_get_current_user

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API de Produtos Rodando!"}

@patch('routers.product_routes.ProductService')
def test_create_product_success(mock_service):
    # Mock do retorno do serviço
    mock_service.create_product.return_value = [{"id": 1, "nome": "Produto Teste", "preco": 10.0}]
    
    payload = {
        "nome": "Produto Teste",
        "preco": 10.0,
        "estoque": 5,
        "categoria": "Testes"
    }
    
    response = client.post("/products/", json=payload)
    
    assert response.status_code == 200
    assert response.json()[0]["nome"] == "Produto Teste"
    mock_service.create_product.assert_called_once()

@patch('routers.product_routes.ProductService')
def test_create_product_duplicate(mock_service):
    # Simula erro de duplicidade
    mock_service.create_product.side_effect = ProductAlreadyExistsError("Nome duplicado")
    
    payload = {"nome": "Duplicado", "preco": 10.0, "estoque": 1}
    response = client.post("/products/", json=payload)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Nome duplicado"

@patch('routers.product_routes.ProductService')
def test_list_products(mock_service):
    mock_service.list_products.return_value = [{"id": 1, "nome": "P1"}, {"id": 2, "nome": "P2"}]
    
    response = client.get("/products/")
    
    assert response.status_code == 200
    assert len(response.json()) == 2

@patch('routers.product_routes.ProductService')
def test_update_product_success(mock_service):
    mock_service.update_product.return_value = [{"id": 1, "nome": "Atualizado"}]
    
    payload = {"nome": "Atualizado", "preco": 20.0, "estoque": 10}
    response = client.put("/products/1", json=payload)
    
    assert response.status_code == 200
    assert response.json()[0]["nome"] == "Atualizado"

@patch('routers.product_routes.ProductService')
def test_update_product_not_found(mock_service):
    mock_service.update_product.side_effect = ResourceNotFoundError("Produto não encontrado")
    
    payload = {"nome": "Inexistente", "preco": 20.0}
    response = client.put("/products/999", json=payload)
    
    assert response.status_code == 404

@patch('routers.product_routes.ProductService')
def test_delete_product_success(mock_service):
    mock_service.delete_product.return_value = True
    
    response = client.delete("/products/1")
    
    assert response.status_code == 200
    assert response.json()["message"] == "Produto deletado com sucesso"
