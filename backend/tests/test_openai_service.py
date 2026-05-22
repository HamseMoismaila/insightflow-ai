import json

import httpx

from backend.app.core.config import Settings
from backend.app.services.openai_service import (
    AIConfigurationError,
    AIServiceError,
    OpenAIInsightService,
)


def test_generate_first_insight_requires_api_key() -> None:
    service = OpenAIInsightService(
        settings=Settings(OPENAI_API_KEY=None),
        client=httpx.Client(transport=httpx.MockTransport(_unreachable_handler)),
    )

    try:
        service.generate_first_insight("Revenue increased by 15%.")
    except AIConfigurationError as exc:
        assert str(exc) == "OPENAI_API_KEY is not configured"
    else:
        raise AssertionError("Expected AIConfigurationError when API key is missing")


def test_generate_first_insight_sends_secure_request_and_parses_response() -> None:
    captured_request: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured_request["url"] = str(request.url)
        captured_request["authorization"] = request.headers["Authorization"]
        captured_request["content_type"] = request.headers["Content-Type"]
        captured_request["json"] = json.loads(request.content.decode("utf-8"))
        return httpx.Response(
            200,
            json={
                "output": [
                    {
                        "type": "message",
                        "content": [
                            {"type": "output_text", "text": "Sales rose steadily across Q4."}
                        ],
                    }
                ]
            },
        )

    service = OpenAIInsightService(
        settings=Settings(OPENAI_API_KEY="test-key", OPENAI_MODEL="gpt-5"),
        client=httpx.Client(
            base_url="https://api.openai.com/v1",
            transport=httpx.MockTransport(handler),
        ),
    )

    result = service.generate_first_insight("Sales rose 18% in Q4.")

    assert result.text == "Sales rose steadily across Q4."
    assert result.model == "gpt-5"
    assert captured_request["url"] == "https://api.openai.com/v1/responses"
    assert captured_request["authorization"] == "Bearer test-key"
    assert captured_request["content_type"] == "application/json"
    assert captured_request["json"]["model"] == "gpt-5"
    assert captured_request["json"]["store"] is False
    assert "professional AI business analyst" in captured_request["json"]["instructions"]
    assert "<dataset_summary>" in captured_request["json"]["input"]


def test_generate_first_insight_raises_for_openai_api_errors() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(500, json={"error": {"message": "server error"}})

    service = OpenAIInsightService(
        settings=Settings(OPENAI_API_KEY="test-key"),
        client=httpx.Client(
            base_url="https://api.openai.com/v1",
            transport=httpx.MockTransport(handler),
        ),
    )

    try:
        service.generate_first_insight("Sales rose 18% in Q4.")
    except AIServiceError as exc:
        assert str(exc) == "OpenAI API request failed"
    else:
        raise AssertionError("Expected AIServiceError for OpenAI API failures")


def _unreachable_handler(_: httpx.Request) -> httpx.Response:
    raise AssertionError("Network request should not be attempted without configuration")
