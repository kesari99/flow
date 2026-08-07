from enum import Enum
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Promptflow AI Engine"
    app_version: str = "0.1.0"
    debug: bool = False
    log_level: LogLevel = LogLevel.INFO

    host: str = "0.0.0.0"
    port: int = 8000

    openai_api_key: Optional[str] = None
    default_model: str = "gpt-4o-mini"
    default_temperature: float = 0.7
    default_max_tokens: int = 2048
    default_timeout: int = 60

    max_execution_time: int = 300
    max_retries: int = 3
    max_memory_messages: int = 50


settings = Settings()
