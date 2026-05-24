def test_analyze_upload_and_fetch_dashboard(client) -> None:
    upload_response = client.post(
        "/api/v1/upload",
        files={
            "file": (
                "sales.csv",
                b"month,revenue,cost\nJan,100,60\nFeb,120,75\nMar,140,82\n",
                "text/csv",
            )
        },
    )
    upload_payload = upload_response.json()

    analyze_response = client.post(f"/api/v1/analyze/{upload_payload['upload_id']}")
    assert analyze_response.status_code == 200
    analyze_payload = analyze_response.json()
    assert analyze_payload["report_id"].startswith("rep_")
    assert analyze_payload["status"] == "success"

    dashboard_response = client.get(f"/api/v1/dashboard/{analyze_payload['report_id']}")
    assert dashboard_response.status_code == 200
    dashboard_payload = dashboard_response.json()
    assert dashboard_payload["summary"]
    assert "revenue" in dashboard_payload["summary"].lower()
    assert isinstance(dashboard_payload["recommendations"], list)
    assert len(dashboard_payload["recommendations"]) >= 3
    assert "upward" in dashboard_payload["recommendations"][0].lower()
    assert "barChartData" in dashboard_payload["charts"]
    assert "lineChartData" in dashboard_payload["charts"]
    assert "pieChartData" in dashboard_payload["charts"]
    assert isinstance(dashboard_payload["insights"], list)
    assert len(dashboard_payload["insights"]) >= 4
    assert any(insight["title"] == "Performance signal" for insight in dashboard_payload["insights"])
    assert any("revenue" in insight["description"].lower() for insight in dashboard_payload["insights"])


def test_analyze_missing_upload_returns_404(client) -> None:
    response = client.post("/api/v1/analyze/upl_missing")

    assert response.status_code == 404


def test_dashboard_missing_report_returns_404(client) -> None:
    response = client.get("/api/v1/dashboard/rep_missing")

    assert response.status_code == 404
