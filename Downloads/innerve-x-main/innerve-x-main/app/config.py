import os
from functools import lru_cache


class Settings:
    app_name: str = "DhanSathi"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    ai_provider: str = os.getenv("AI_PROVIDER", "local")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./dhan_sathi.db")


@lru_cache
def get_settings() -> Settings:
    return Settings()
