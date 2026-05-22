from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[1]))
from app.main import app


client = TestClient(app)


def test_upload_csv_returns_success() -> None:
    response = client.post(
        "/api/v1/upload",
        files={"file": ("data.csv", b"col1,col2\n1,2\n", "text/csv")},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["status"] == "success"
    assert isinstance(body["upload_id"], str)


def test_upload_rejects_invalid_file_type() -> None:
    response = client.post(
        "/api/v1/upload",
        files={"file": ("malicious.exe", b"MZ", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Only CSV and XLSX files are supported"}
