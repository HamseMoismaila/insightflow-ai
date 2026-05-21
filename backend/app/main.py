from fastapi import FastAPI
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Data Insight Generator API"
    app_version: str = "0.1.0"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
app = FastAPI(title=settings.app_name, version=settings.app_version)


@app.get("/api/v1/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
