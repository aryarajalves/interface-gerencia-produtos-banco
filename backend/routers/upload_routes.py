from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from core.security import get_current_user
from services.product_service import ProductService

router = APIRouter(prefix="/products/upload", tags=["upload"])

@router.post("/", dependencies=[Depends(get_current_user)])
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Arquivo deve ser um CSV (.csv)")
    
    content = await file.read()
    stats = ProductService.bulk_import(content)
    
    return {
        "message": "Importação concluída!",
        "details": stats
    }
