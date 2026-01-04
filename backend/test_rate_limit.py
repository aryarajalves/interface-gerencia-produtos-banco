import requests
import time

URL = "http://127.0.0.1:8000/products"
LIMIT = 15  # Tentar mais que o limite de 10

print(f"Testando Rate Limit em {URL}...")

for i in range(LIMIT):
    try:
        response = requests.get(URL)
        if response.status_code == 200:
            print(f"Req {i+1}: Sucesso (200)")
        elif response.status_code == 429:
            print(f"Req {i+1}: BLOQUEADO (429) - {response.text}")
            break
        else:
            print(f"Req {i+1}: Status inesperado: {response.status_code}")
    except Exception as e:
        print(f"Erro na requisição: {e}")
    # time.sleep(0.1) # Rápido para estourar o limite

print("Teste finalizado.")
