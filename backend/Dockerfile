# Usar imagem base completa do Python (evita erros de compilação)
FROM python:3.9

# Definir diretório de trabalho inside do container
WORKDIR /app

# Variáveis de ambiente para evitar arquivos .pyc e logs em buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalar dependências do sistema... (já incluídas na imagem full)


# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY . .

# Expor a porta que o Uvicorn vai rodar
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
