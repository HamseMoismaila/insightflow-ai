from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.v1 import api_router
from backend.app.core.config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/api/v1/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
