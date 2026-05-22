from __future__ import annotations

from dataclasses import dataclass

import httpx

from backend.app.core.config import Settings, get_settings
from backend.app.services.prompt_service import PromptService


class AIConfigurationError(RuntimeError):
    """Raised when required AI configuration is missing."""


class AIServiceError(RuntimeError):
    """Raised when the OpenAI API request fails."""


@dataclass(frozen=True)
class InsightResult:
    text: str
    model: str


class OpenAIInsightService:
    """Generates insights with the OpenAI Responses API."""

    def __init__(
        self,
        settings: Settings | None = None,
        prompt_service: PromptService | None = None,
        client: httpx.Client | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._prompt_service = prompt_service or PromptService()
        self._client = client or httpx.Client(
            base_url=self._settings.openai_base_url,
            timeout=self._settings.openai_timeout_seconds,
        )

    def generate_first_insight(self, dataset_summary: str) -> InsightResult:
        api_key = self._settings.openai_api_key
        if not api_key:
            raise AIConfigurationError("OPENAI_API_KEY is not configured")

        prompt_payload = self._prompt_service.build_dataset_analysis_prompt(dataset_summary)
        response = self._client.post(
            "/responses",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": self._settings.openai_model,
                "instructions": prompt_payload.system_prompt,
                "input": prompt_payload.user_prompt,
                # Security inference: disable provider-side storage unless explicitly needed.
                "store": False,
            },
        )

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise AIServiceError("OpenAI API request failed") from exc

        response_payload = response.json()
        text = _extract_output_text(response_payload)
        if not text:
            raise AIServiceError("OpenAI API response did not include output text")

        return InsightResult(text=text, model=self._settings.openai_model)


def _extract_output_text(response_payload: dict) -> str:
    output_items = response_payload.get("output", [])
    fragments: list[str] = []

    for item in output_items:
        if item.get("type") != "message":
            continue

        for content_item in item.get("content", []):
            if content_item.get("type") == "output_text":
                text = content_item.get("text", "").strip()
                if text:
                    fragments.append(text)

    return "\n".join(fragments).strip()
