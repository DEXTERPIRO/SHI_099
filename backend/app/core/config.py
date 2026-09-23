from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "National Unified Material Master (NUMM) Platform"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./numm.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
