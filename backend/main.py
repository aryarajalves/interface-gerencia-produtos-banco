from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.config import limiter
from core.exceptions import ProductAlreadyExistsError, ServiceError, ResourceNotFoundError
from routers import product_routes, upload_routes

app = FastAPI()

# Configuração do Limiter
app.state.limiter = limiter



def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Muitas requisições. Por favor, aguarde 1 minuto para tentar novamente."}
    )

app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

@app.exception_handler(ProductAlreadyExistsError)
async def product_exists_handler(request: Request, exc: ProductAlreadyExistsError):
    return JSONResponse(
        status_code=400, # Bad Request
        content={"detail": exc.message}
    )

@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": exc.message}
    )

@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erro interno do servidor: {exc.message}"}
    )

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(product_routes.router)
app.include_router(upload_routes.router)

@app.get("/")
def read_root():
    return {"message": "API de Produtos Rodando!"}
