import os
from dotenv import load_dotenv
from supabase import create_client, Client
from slowapi import Limiter
from slowapi.util import get_remote_address

# Carregar variáveis de ambiente
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
rate_limit_read: str = os.environ.get("RATE_LIMIT_READ", "10/minute")
rate_limit_write: str = os.environ.get("RATE_LIMIT_WRITE", "5/minute")

if not url or not key:
    print("Aviso: SUPABASE_URL e SUPABASE_KEY são necessários no arquivo .env")

# Inicializar cliente Supabase
supabase: Client = create_client(url, key) if url and key else None

# Inicializar o Limiter
limiter = Limiter(key_func=get_remote_address)
