from __future__ import annotations

import re
from dataclasses import dataclass


_SYSTEM_PROMPT = """You are a professional AI business analyst specialized in:
- data analytics
- trend analysis
- anomaly detection
- business intelligence

Analyze datasets and generate:
- summaries
- trends
- anomalies
- recommendations
- actionable insights

Avoid hallucinations and only use dataset information."""

_DATASET_ANALYSIS_PROMPT = """Analyze the following dataset summary.

Generate:
1. Key trends
2. Important statistics
3. Anomalies
4. Business insights
5. Recommendations

Dataset Summary:
{dataset_summary}"""

_MAX_DATASET_SUMMARY_LENGTH = 4_000
_CONTROL_CHARACTERS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_WHITESPACE_RUNS = re.compile(r"\s+")
_PROMPT_INJECTION_PATTERNS = (
    "ignore previous instructions",
    "ignore all previous instructions",
    "system prompt",
    "developer message",
    "reveal hidden prompt",
    "disregard the above",
)
_STRUCTURAL_TAG_PATTERN = re.compile(r"</?\s*dataset_summary\s*>", flags=re.IGNORECASE)


@dataclass(frozen=True)
class PromptPayload:
    system_prompt: str
    user_prompt: str
    sanitized_dataset_summary: str


class PromptService:
    """Builds prompt payloads without calling an AI provider."""

    def build_dataset_analysis_prompt(self, dataset_summary: str) -> PromptPayload:
        sanitized_summary = sanitize_dataset_summary(dataset_summary)
        user_prompt = _DATASET_ANALYSIS_PROMPT.format(
            dataset_summary=f"<dataset_summary>\n{sanitized_summary}\n</dataset_summary>"
        )
        return PromptPayload(
            system_prompt=_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            sanitized_dataset_summary=sanitized_summary,
        )


def sanitize_dataset_summary(dataset_summary: str) -> str:
    if not isinstance(dataset_summary, str):
        raise TypeError("dataset_summary must be a string")

    normalized_summary = _CONTROL_CHARACTERS.sub(" ", dataset_summary)
    normalized_summary = _STRUCTURAL_TAG_PATTERN.sub("[filtered]", normalized_summary)
    normalized_summary = normalized_summary.replace("{", "(").replace("}", ")")
    normalized_summary = normalized_summary.replace("<", "(").replace(">", ")")
    normalized_summary = normalized_summary.strip()
    normalized_summary = _WHITESPACE_RUNS.sub(" ", normalized_summary)

    for pattern in _PROMPT_INJECTION_PATTERNS:
        normalized_summary = re.sub(
            pattern,
            "[filtered]",
            normalized_summary,
            flags=re.IGNORECASE,
        )

    if not normalized_summary:
        raise ValueError("dataset_summary must not be empty")

    return normalized_summary[:_MAX_DATASET_SUMMARY_LENGTH]
