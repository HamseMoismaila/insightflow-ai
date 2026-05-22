import uuid

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.schemas.upload import UploadResponse


class Settings(BaseSettings):
    app_name: str = "AI Data Insight Generator API"
    app_version: str = "0.1.0"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)


@app.post("/api/v1/upload", response_model=UploadResponse)
def upload_dataset(file: UploadFile = File(...)) -> UploadResponse:
    allowed_content_types = {
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }

    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported")

    if not (file.filename.lower().endswith(".csv") or file.filename.lower().endswith(".xlsx")):
        raise HTTPException(status_code=400, detail="Invalid file extension")

    return UploadResponse(upload_id=str(uuid.uuid4()), status="success")


@app.get("/api/v1/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
