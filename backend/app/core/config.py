from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache

DEFAULT_CORS_ORIGINS = ("http://127.0.0.1:5173", "http://localhost:5173")


def _read_bool_env(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


def _read_cors_origins() -> tuple[str, ...]:
    raw_value = os.environ.get("MEDIAFORGE_CORS_ORIGINS", "")
    parsed = tuple(origin.strip() for origin in raw_value.split(",") if origin.strip())
    return parsed or DEFAULT_CORS_ORIGINS


@dataclass(frozen=True)
class AppConfig:
    title: str
    host: str
    port: int
    reload: bool
    cors_origins: tuple[str, ...]


@lru_cache
def get_app_config() -> AppConfig:
    return AppConfig(
        title="MediaForge API",
        host=os.environ.get("MEDIAFORGE_HOST", "127.0.0.1"),
        port=int(os.environ.get("MEDIAFORGE_PORT", "8000")),
        reload=_read_bool_env("MEDIAFORGE_RELOAD"),
        cors_origins=_read_cors_origins(),
    )
