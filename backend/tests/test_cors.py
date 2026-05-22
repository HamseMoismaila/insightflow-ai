def test_cors_preflight_allows_frontend_origin(client) -> None:
    response = client.options(
        "/api/v1/upload",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
