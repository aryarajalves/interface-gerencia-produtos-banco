from fastapi import APIRouter, Depends, Request
from core.config import limiter, rate_limit_read, rate_limit_write
from core.security import get_current_user
from schemas.product import ProductCreate
from services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
@limiter.limit(rate_limit_read)
def get_products(request: Request, order_by: str = "id", direction: str = "asc"):
    return ProductService.list_products(order_by, direction)

@router.post("/", dependencies=[Depends(get_current_user)])
@limiter.limit(rate_limit_write)
def create_product(request: Request, product: ProductCreate):
    return ProductService.create_product(product)

@router.put("/{product_id}", dependencies=[Depends(get_current_user)])
@limiter.limit(rate_limit_write)
def update_product(request: Request, product_id: int, product: ProductCreate):
    return ProductService.update_product(product_id, product)

@router.delete("/{product_id}", dependencies=[Depends(get_current_user)])
@limiter.limit(rate_limit_write)
def delete_product(request: Request, product_id: int):
    ProductService.delete_product(product_id)
    return {"message": "Produto deletado com sucesso"}
