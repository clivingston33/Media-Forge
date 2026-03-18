from __future__ import annotations

import logging
import os
from dataclasses import dataclass

import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration


@dataclass(frozen=True)
class BackendObservabilityStatus:
    enabled: bool
    environment: str
    release: str | None


def _read_traces_sample_rate() -> float:
    try:
        value = float(os.environ.get("MEDIAFORGE_SENTRY_TRACES_SAMPLE_RATE", "0.1"))
    except ValueError:
        return 0.1

    return max(value, 0.0)


def configure_backend_observability() -> BackendObservabilityStatus:
    dsn = (os.environ.get("MEDIAFORGE_BACKEND_SENTRY_DSN") or os.environ.get("MEDIAFORGE_SENTRY_DSN") or "").strip()
    environment = os.environ.get(
        "MEDIAFORGE_SENTRY_ENVIRONMENT",
        "development" if os.environ.get("MEDIAFORGE_RELOAD", "0") == "1" else "production",
    )
    release = os.environ.get("MEDIAFORGE_RELEASE") or None

    if not dsn:
        return BackendObservabilityStatus(enabled=False, environment=environment, release=release)

    logging_integration = LoggingIntegration(level=logging.INFO, event_level=logging.ERROR)
    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        release=release,
        traces_sample_rate=_read_traces_sample_rate(),
        enable_logs=os.environ.get("MEDIAFORGE_SENTRY_ENABLE_LOGS", "1") != "0",
        integrations=[logging_integration],
        send_default_pii=False,
    )
    return BackendObservabilityStatus(enabled=True, environment=environment, release=release)
