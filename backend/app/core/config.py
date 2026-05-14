from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "dev"

    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

    openai_api_key: Optional[str] = None

    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

    daily_requests_per_user: int = 10

    admin_key: Optional[str] = None

    allowed_origins: str = "http://localhost:3000,https://crimecompare.co.uk"

    class model_config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def is_production(self) -> bool:
        return self.app_env.lower() in ("prod", "production")

    def is_development(self) -> bool:
        return self.app_env.lower() in ("dev", "development")


settings = Settings()
