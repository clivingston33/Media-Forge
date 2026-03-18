from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .task import Task, TaskType


class DownloadRequest(BaseModel):
    url: str
    format: Literal["mp4", "mp3", "webm"]
    quality: Literal["best", "1080p", "720p", "480p", "audio_only"] = "best"


class TaskStartResponse(BaseModel):
    task_id: str
    type: TaskType
    status: Literal["started"] = "started"


class TasksResponse(BaseModel):
    tasks: list[Task]


class SettingsPayload(BaseModel):
    gpu_acceleration: bool = True
    output_folder: str = "C:/MediaForge/Exports"
    queue_concurrency: int = Field(default=2, ge=1, le=4)
    temp_cache_gb: float = Field(default=12.0, ge=1)
    auto_save_exports: bool = True


class SettingsPatchPayload(BaseModel):
    gpu_acceleration: bool | None = None
    output_folder: str | None = None
    queue_concurrency: int | None = Field(default=None, ge=1, le=4)
    temp_cache_gb: float | None = Field(default=None, ge=1)
    auto_save_exports: bool | None = None
