from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

HealthCheckStatus = Literal["ready", "degraded", "missing"]
HealthStatus = Literal["ok", "degraded"]


class HealthCheck(BaseModel):
    key: str
    label: str
    status: HealthCheckStatus
    detail: str
    location: str | None = None


class FeatureHealth(BaseModel):
    key: str
    label: str
    status: HealthCheckStatus
    detail: str


class SystemHealth(BaseModel):
    status: HealthStatus
    checked_at: datetime
    output_folder: str
    checks: list[HealthCheck]
    features: list[FeatureHealth]
