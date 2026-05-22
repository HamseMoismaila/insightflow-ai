from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app.core.config import get_settings
from backend.app.main import app


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.setenv("UPLOAD_STORAGE_DIR", str(tmp_path / "uploads"))
    monkeypatch.setenv("REPORT_STORAGE_DIR", str(tmp_path / "reports"))
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    get_settings.cache_clear()
    with TestClient(app) as test_client:
        yield test_client
    get_settings.cache_clear()
