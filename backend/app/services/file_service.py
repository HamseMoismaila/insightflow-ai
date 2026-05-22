from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from backend.app.core.config import Settings, get_settings

_ALLOWED_EXTENSIONS = {".csv", ".xlsx"}


class InvalidUploadError(ValueError):
    """Raised when an uploaded file fails validation."""


class UploadNotFoundError(FileNotFoundError):
    """Raised when an upload record does not exist."""


@dataclass(frozen=True)
class StoredUpload:
    upload_id: str
    filename: str
    stored_filename: str
    file_size: int
    created_at: str


class FileService:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._settings.upload_storage_path.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload_file: UploadFile) -> StoredUpload:
        sanitized_name = Path(upload_file.filename or "").name
        if not sanitized_name:
            raise InvalidUploadError("Filename is required")

        extension = Path(sanitized_name).suffix.lower()
        if extension not in _ALLOWED_EXTENSIONS:
            raise InvalidUploadError("Only CSV and XLSX files are supported")

        file_bytes = await upload_file.read()
        file_size = len(file_bytes)
        if file_size == 0:
            raise InvalidUploadError("Uploaded file is empty")

        if file_size > self._settings.max_upload_size_bytes:
            raise InvalidUploadError("Uploaded file exceeds the 50MB size limit")

        upload_id = f"upl_{uuid4().hex[:12]}"
        stored_filename = f"{upload_id}{extension}"
        file_path = self._settings.upload_storage_path / stored_filename
        metadata_path = self._metadata_path(upload_id)

        file_path.write_bytes(file_bytes)
        created_at = datetime.now(UTC).isoformat()
        upload_record = StoredUpload(
            upload_id=upload_id,
            filename=sanitized_name,
            stored_filename=stored_filename,
            file_size=file_size,
            created_at=created_at,
        )
        metadata_path.write_text(json.dumps(asdict(upload_record), indent=2), encoding="utf-8")
        await upload_file.close()
        return upload_record

    def get_upload(self, upload_id: str) -> StoredUpload:
        metadata_path = self._metadata_path(upload_id)
        if not metadata_path.exists():
            raise UploadNotFoundError(f"Upload '{upload_id}' was not found")

        payload = json.loads(metadata_path.read_text(encoding="utf-8"))
        return StoredUpload(**payload)

    def get_upload_file_path(self, upload: StoredUpload) -> Path:
        file_path = self._settings.upload_storage_path / upload.stored_filename
        if not file_path.exists():
            raise UploadNotFoundError(f"File for upload '{upload.upload_id}' was not found")
        return file_path

    def _metadata_path(self, upload_id: str) -> Path:
        return self._settings.upload_storage_path / f"{upload_id}.json"
