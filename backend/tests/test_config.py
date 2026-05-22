from pydantic import ValidationError

from backend.app.core.config import Settings


def test_settings_rejects_unapproved_openai_base_url() -> None:
    try:
        Settings(OPENAI_BASE_URL="https://attacker.example/v1")
    except ValidationError as exc:
        assert "OPENAI_BASE_URL must use an approved OpenAI API host" in str(exc)
    else:
        raise AssertionError("Expected ValidationError for unapproved OPENAI_BASE_URL")


def test_settings_accepts_official_openai_base_url() -> None:
    settings = Settings(OPENAI_BASE_URL="https://api.openai.com/v1/")

    assert settings.openai_base_url == "https://api.openai.com/v1"
