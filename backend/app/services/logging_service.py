from __future__ import annotations

import json
import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any

from app.utils.paths import logs_dir


class JsonLineFormatter(logging.Formatter):
    _reserved = {
        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "module",
        "msecs",
        "message",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "thread",
        "threadName",
    }

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        extras = {
            key: value
            for key, value in record.__dict__.items()
            if key not in self._reserved and not key.startswith("_")
        }
        if extras:
            payload.update(extras)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def configure_backend_logging(log_path: Path | None = None) -> None:
    target_path = log_path or logs_dir() / "backend.log"
    target_path.parent.mkdir(parents=True, exist_ok=True)

    root_logger = logging.getLogger()
    if any(getattr(handler, "_mediaforge_handler", False) for handler in root_logger.handlers):
        return

    root_logger.setLevel(logging.INFO)

    formatter = JsonLineFormatter()
    file_handler = RotatingFileHandler(target_path, maxBytes=2_000_000, backupCount=5, encoding="utf-8")
    file_handler.setFormatter(formatter)
    file_handler._mediaforge_handler = True  # type: ignore[attr-defined]

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler._mediaforge_handler = True  # type: ignore[attr-defined]

    root_logger.handlers = [file_handler, console_handler]
    logging.getLogger("uvicorn.access").handlers = [file_handler, console_handler]
    logging.getLogger("uvicorn.error").handlers = [file_handler, console_handler]
