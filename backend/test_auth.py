import requests

URL = "http://127.0.0.1:8000/products"

# Tentar CRIAR um produto sem token
try:
    print("Tentando criar produto SEM token...")
    response = requests.post(URL, json={"nome": "Hacker Product", "preco": 0, "estoque": 0})
    if response.status_code == 401:
        print("SUCESSO: Bloqueado (401 Unauthorized)")
    elif response.status_code == 403:
        print("SUCESSO: Bloqueado (403 Forbidden)")
    else:
        print(f"FALHA: Passou com status {response.status_code}")
except Exception as e:
    print(f"Erro: {e}")

# Tentar DELETAR um produto sem token (usando ID 1 como exemplo)
try:
    print("\nTentando deletar produto SEM token...")
    response = requests.delete(f"{URL}/1")
    if response.status_code == 401:
        print("SUCESSO: Bloqueado (401 Unauthorized)")
    else:
        print(f"FALHA: Passou com status {response.status_code}")
except Exception as e:
    print(f"Erro: {e}")

# Tentar LER produtos (deve passar)
try:
    print("\nTentando ler produtos (sem token)...")
    response = requests.get(URL)
    if response.status_code == 200:
        print("SUCESSO: Leitura permitida (Pública)")
    else:
        print(f"FALHA: Leitura bloqueada com status {response.status_code}")
except Exception as e:
    print(f"Erro: {e}")
