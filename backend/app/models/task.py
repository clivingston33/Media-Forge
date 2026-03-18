from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

TaskType = Literal["download", "convert", "separate", "remove_bg"]
TaskStatus = Literal["queued", "processing", "done", "error", "cancelled"]


class Task(BaseModel):
    id: str
    type: TaskType
    name: str
    status: TaskStatus
    progress: int = Field(default=0, ge=0, le=100)
    stage: str | None = None
    output_files: list[str] = Field(default_factory=list)
    error: str | None = None
    size: str | None = None
    created_at: datetime
    updated_at: datetime
