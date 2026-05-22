from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_ALLOWED_OPENAI_BASE_URLS = {
    "https://api.openai.com/v1",
}


class Settings(BaseSettings):
    app_name: str = "AI Data Insight Generator API"
    app_version: str = "0.1.0"
    allowed_cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        alias="ALLOWED_CORS_ORIGINS",
    )
    upload_storage_dir: str = Field(default="data/uploads", alias="UPLOAD_STORAGE_DIR")
    report_storage_dir: str = Field(default="data/reports", alias="REPORT_STORAGE_DIR")
    max_upload_size_bytes: int = Field(default=50 * 1024 * 1024, alias="MAX_UPLOAD_SIZE_BYTES")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-5", alias="OPENAI_MODEL")
    openai_timeout_seconds: float = Field(default=30.0, alias="OPENAI_TIMEOUT_SECONDS")
    openai_base_url: str = Field(default="https://api.openai.com/v1", alias="OPENAI_BASE_URL")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        populate_by_name=True,
        extra="ignore",
    )

    @field_validator("openai_base_url")
    @classmethod
    def validate_openai_base_url(cls, value: str) -> str:
        normalized_value = value.rstrip("/")
        if normalized_value not in _ALLOWED_OPENAI_BASE_URLS:
            raise ValueError("OPENAI_BASE_URL must use an approved OpenAI API host")
        return normalized_value

    @field_validator("allowed_cors_origins", mode="before")
    @classmethod
    def validate_allowed_cors_origins(cls, value: list[str] | str) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @property
    def upload_storage_path(self) -> Path:
        return Path(self.upload_storage_dir)

    @property
    def report_storage_path(self) -> Path:
        return Path(self.report_storage_dir)


@lru_cache
def get_settings() -> Settings:
    return Settings()
