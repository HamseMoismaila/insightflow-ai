from io import BytesIO

import pandas as pd


def test_upload_csv_success(client) -> None:
    response = client.post(
        "/api/v1/upload",
        files={"file": ("sales.csv", b"month,revenue\nJan,100\nFeb,120\n", "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["upload_id"].startswith("upl_")
    assert payload["filename"] == "sales.csv"
    assert payload["status"] == "success"


def test_upload_invalid_file_type_returns_400(client) -> None:
    response = client.post(
        "/api/v1/upload",
        files={"file": ("notes.txt", b"not a dataset", "text/plain")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Only CSV and XLSX files are supported"


def test_upload_xlsx_success(client) -> None:
    buffer = BytesIO()
    pd.DataFrame({"month": ["Jan", "Feb"], "revenue": [100, 120]}).to_excel(buffer, index=False)
    buffer.seek(0)

    response = client.post(
        "/api/v1/upload",
        files={
            "file": (
                "sales.xlsx",
                buffer.getvalue(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
    )

    assert response.status_code == 200
    assert response.json()["filename"] == "sales.xlsx"
