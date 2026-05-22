from fastapi import APIRouter

from .analyze import router as analyze_router
from .dashboard import router as dashboard_router
from .upload import router as upload_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(upload_router)
api_router.include_router(analyze_router)
api_router.include_router(dashboard_router)
