from __future__ import annotations

import asyncio
from dataclasses import dataclass
from collections import defaultdict
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import WebSocket

from app.models.task import Task, TaskType
from app.utils.json_storage import load_json_file, write_json_file
from app.utils.paths import state_dir
from app.utils.process import TaskCancelledError

TERMINAL_STATUSES = {"done", "error", "cancelled"}


@dataclass
class TaskControl:
    cancel_requested: bool = False
    process: asyncio.subprocess.Process | None = None


class TaskManager:
    def __init__(self, tasks_path: Path | None = None, concurrency_limit: int = 2) -> None:
        self._tasks_path = tasks_path or state_dir() / "tasks.json"
        self._tasks = self._load_tasks()
        self._controls: dict[str, TaskControl] = {task_id: TaskControl() for task_id in self._tasks}
        self._task_subscribers: dict[str, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()
        self._queue_condition = asyncio.Condition()
        self._active_runs = 0
        self._waiting_order: list[str] = []
        self._concurrency_limit = max(1, concurrency_limit)

    async def create_task(self, task_type: TaskType, name: str, size: str | None = None) -> Task:
        now = datetime.now(timezone.utc)
        task = Task(
            id=f"task_{uuid4().hex[:8]}",
            type=task_type,
            name=name,
            status="queued",
            progress=0,
            created_at=now,
            updated_at=now,
            size=size,
        )

        async with self._lock:
            self._tasks[task.id] = task
            self._controls[task.id] = TaskControl()
            self._persist_unlocked()

        await self._broadcast(task)
        return task

    async def list_tasks(self) -> list[Task]:
        async with self._lock:
            return sorted(self._tasks.values(), key=lambda item: item.updated_at, reverse=True)

    async def get_task(self, task_id: str) -> Task | None:
        async with self._lock:
            return self._tasks.get(task_id)

    async def update_task(self, task_id: str, **updates) -> Task | None:
        async with self._lock:
            task = self._tasks.get(task_id)
            if task is None:
                return None

            updated_task = task.model_copy(
                update={
                    **updates,
                    "updated_at": datetime.now(timezone.utc),
                }
            )
            self._tasks[task_id] = updated_task
            self._persist_unlocked()

        await self._broadcast(updated_task)
        return updated_task

    async def connect(self, task_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._task_subscribers[task_id].add(websocket)
        task = await self.get_task(task_id)
        if task:
            await websocket.send_json(task.model_dump(mode="json"))

    def disconnect(self, task_id: str, websocket: WebSocket) -> None:
        self._task_subscribers[task_id].discard(websocket)

    async def fail(self, task_id: str, error: str) -> None:
        current = await self.get_task(task_id)
        if current is None or current.status in TERMINAL_STATUSES:
            return

        await self.update_task(task_id, status="error", error=error, stage="Task failed")

    async def set_concurrency(self, concurrency_limit: int) -> None:
        async with self._queue_condition:
            self._concurrency_limit = max(1, concurrency_limit)
            self._queue_condition.notify_all()

    def is_cancellation_requested(self, task_id: str) -> bool:
        control = self._controls.get(task_id)
        return bool(control and control.cancel_requested)

    async def attach_process(self, task_id: str, process: asyncio.subprocess.Process) -> None:
        async with self._queue_condition:
            control = self._controls.setdefault(task_id, TaskControl())
            control.process = process
            if control.cancel_requested and process.returncode is None:
                process.terminate()

    async def detach_process(self, task_id: str, process: asyncio.subprocess.Process) -> None:
        async with self._queue_condition:
            control = self._controls.get(task_id)
            if control and control.process is process:
                control.process = None

    async def cancel(self, task_id: str) -> Task | None:
        task = await self.get_task(task_id)
        if task is None:
            return None

        if task.status in TERMINAL_STATUSES:
            return task

        process: asyncio.subprocess.Process | None = None
        should_mark_cancelled = False

        async with self._queue_condition:
            control = self._controls.setdefault(task_id, TaskControl())
            control.cancel_requested = True
            process = control.process

            if task_id in self._waiting_order:
                self._waiting_order = [queued_task_id for queued_task_id in self._waiting_order if queued_task_id != task_id]
                should_mark_cancelled = True

            if task.status == "queued" and process is None:
                should_mark_cancelled = True

            self._queue_condition.notify_all()

        if process is not None and process.returncode is None:
            process.terminate()

        if should_mark_cancelled:
            await self._mark_cancelled(task_id)

        return await self.get_task(task_id)

    async def run_task(self, task_id: str, runner: Callable[[], Awaitable[None]]) -> None:
        if self.is_cancellation_requested(task_id):
            await self._mark_cancelled(task_id)
            return

        await self.update_task(task_id, status="queued", stage="Waiting for worker")

        acquired_slot = False
        should_cancel = False
        async with self._queue_condition:
            self._waiting_order.append(task_id)

            while True:
                if self._controls.setdefault(task_id, TaskControl()).cancel_requested:
                    self._waiting_order = [queued_task_id for queued_task_id in self._waiting_order if queued_task_id != task_id]
                    should_cancel = True
                    self._queue_condition.notify_all()
                    break

                if self._waiting_order and self._waiting_order[0] == task_id and self._active_runs < self._concurrency_limit:
                    self._waiting_order.pop(0)
                    self._active_runs += 1
                    acquired_slot = True
                    break

                await self._queue_condition.wait()

        if should_cancel or self.is_cancellation_requested(task_id):
            await self._mark_cancelled(task_id)
            return

        try:
            await runner()
        except TaskCancelledError:
            await self._mark_cancelled(task_id)
        except Exception as error:
            if self.is_cancellation_requested(task_id):
                await self._mark_cancelled(task_id)
            else:
                await self.fail(task_id, str(error))
        finally:
            if acquired_slot:
                async with self._queue_condition:
                    self._active_runs = max(0, self._active_runs - 1)
                    self._queue_condition.notify_all()

    def _load_tasks(self) -> dict[str, Task]:
        raw_tasks = load_json_file(self._tasks_path, default=[])
        now = datetime.now(timezone.utc)
        tasks: dict[str, Task] = {}

        for raw_task in raw_tasks if isinstance(raw_tasks, list) else []:
            try:
                task = Task.model_validate(raw_task)
            except Exception:
                continue

            if task.status in {"queued", "processing"}:
                task = task.model_copy(
                    update={
                        "status": "error",
                        "stage": "Interrupted after restart",
                        "error": "This task was interrupted by a previous app shutdown.",
                        "updated_at": now,
                    }
                )

            tasks[task.id] = task

        if tasks:
            write_json_file(self._tasks_path, [task.model_dump(mode="json") for task in tasks.values()])

        return tasks

    def _persist_unlocked(self) -> None:
        write_json_file(
            self._tasks_path,
            [task.model_dump(mode="json") for task in sorted(self._tasks.values(), key=lambda item: item.created_at)],
        )

    async def _mark_cancelled(self, task_id: str) -> None:
        task = await self.get_task(task_id)
        if task is None or task.status in TERMINAL_STATUSES:
            return

        await self.update_task(task_id, status="cancelled", progress=task.progress, stage="Cancelled by user", error=None)

    async def _broadcast(self, task: Task) -> None:
        subscribers = list(self._task_subscribers[task.id])
        for websocket in subscribers:
            try:
                await websocket.send_json(task.model_dump(mode="json"))
            except Exception:
                self.disconnect(task.id, websocket)


task_manager = TaskManager()
