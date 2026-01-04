# 📦 Gerenciador de Produtos Inteligente (RAG Sync)

Este projeto é um sistema completo de gerenciamento de produtos, desenvolvido com foco em performance, experiência do usuário e facilidade de implantação. Ele permite desde o cadastro manual até a importação em massa inteligente via CSV, servindo como base de dados para sistemas de RAG (Retrieval-Augmented Generation).

## ✨ Funcionalidades

### 🖥️ Frontend (React + Vite)
- **Dashboard Interativo**: Visualização clara de produtos com cards modernos.
- **Busca e Filtros**: Pesquisa em tempo real por nome e filtro por categorias.
- **Ordenação Avançada**: Organize produtos por Preço, Estoque ou Ordem Alfabética (Crescente/Decrescente).
- **Feedback Visual**: Notificações toast para todas as ações (sucesso, erro, carregamento).
- **Importação CSV**: Upload de arquivos CSV com detecção automática de delimitadores (`, ` ou `;`).
- **Download de Modelo**: Botão dedicado para baixar a planilha modelo de importação.
- **Autenticação**: Login seguro, Magic Links e Recuperação de Senha via Supabase.

### ⚙️ Backend (FastAPI)
- **API RESTful**: Endpoints documentados e performáticos.
- **Segurança**: Autenticação via JWT (Supabase), Rate Limiting e CORS configurado.
- **Upsert Inteligente**: Na importação CSV, produtos existentes são atualizados e novos são criados automaticamente.
- **Validação Robusta**: Validação estrita de colunas obrigatórias e tipos de dados com Pydantic v2.

### 🗄️ Infraestrutura & Banco de Dados
- **Supabase**: PostgreSQL gerenciado com Row Level Security (RLS) ativo.
- **Docker Swarm**: Arquivos prontos para deploy escalável em cluster.
- **Nginx**: Servidor web otimizado para servir o frontend SPA.

## 🛠️ Tecnologias

- **Frontend**: React 18, Vite, TailwindCSS, Lucide React, React Hot Toast.
- **Backend**: Python 3.9+, FastAPI, Pydantic, SlowAPI, Supabase Client.
- **Banco de Dados**: Supabase (PostgreSQL).
- **DevOps**: Docker, Docker Compose/Swarm.

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- Python (v3.9+)
- Conta no Supabase (URL e Key)

### 1. Configurar o Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

Rode o servidor:
```bash
python -m uvicorn main:app --reload
# Backend rodando em: http://127.0.0.1:8000
```

### 2. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env
# Crie um arquivo .env na pasta frontend com:
# VITE_SUPABASE_URL=sua_url
# VITE_SUPABASE_ANON_KEY=sua_key

# Rodar o projeto
npm run dev
# Frontend rodando em: http://localhost:5173
```

---

## 🐳 Deploy em Produção (Docker Swarm)

O projeto já inclui uma configuração pronta para Docker Swarm + Traefik.

1.  Certifique-se de ter um cluster Swarm iniciado.
2.  Edite o arquivo `stack.yml` na raiz:
    *   Ajuste os domínios nas labels do Traefik (`api.seu-dominio.com`, `app.seu-dominio.com`).
    *   Defina as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_KEY`.
3.  Faça o deploy:

```bash
docker stack deploy -c stack.yml produtos_stack
```

As imagens já estão configuradas para baixar do Docker Hub oficial:
- Backend: `aryarajalves/interface-gerencia-produtos-banco:backend-latest`
- Frontend: `aryarajalves/interface-gerencia-produtos-banco:frontend-latest`

## 📄 Estrutura do Projeto

```
/
├── backend/            # API Python (FastAPI)
│   ├── core/           # Configurações globais
│   ├── routers/        # Rotas da API
│   ├── services/       # Lógica de negócio (CSV, CRUD)
│   └── Dockerfile      # Dockerfile da API
├── frontend/           # Aplicação React
│   ├── src/            # Código fonte
│   ├── nginx.conf      # Configuração do Nginx
│   └── Dockerfile      # Dockerfile do Frontend
└── stack.yml           # Arquivo de deploy Docker Swarm
```

## 🔐 Configuração do Supabase (RLS)

O projeto utiliza Row Level Security. Certifique-se de rodar o script SQL fornecido (`backend/enable_rls.sql`) no seu painel do Supabase para configurar as permissões corretas para a tabela `produtos`.

---

Desenvolvido para entregar eficiência e escalabilidade.
