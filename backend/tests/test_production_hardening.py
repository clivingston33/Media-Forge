from __future__ import annotations

import asyncio
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.models.health import FeatureHealth, HealthCheck, SystemHealth
from app.models.schemas import SettingsPatchPayload
from app.services.health_service import HealthService
from app.services.readiness_service import ensure_feature_ready
from app.services.settings_service import SettingsService
from app.services.task_manager import TaskManager


class SettingsServiceTests(unittest.TestCase):
    def test_settings_persist_to_disk(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            settings_path = root / "settings.json"
            export_path = root / "exports"

            service = SettingsService(settings_path=settings_path)
            service.patch(
                SettingsPatchPayload(
                    gpu_acceleration=False,
                    output_folder=str(export_path),
                    queue_concurrency=3,
                )
            )

            reloaded = SettingsService(settings_path=settings_path)
            persisted = reloaded.get()

            self.assertFalse(persisted.gpu_acceleration)
            self.assertEqual(persisted.queue_concurrency, 3)
            self.assertEqual(persisted.output_folder, str(export_path))
            self.assertTrue(export_path.exists())


class TaskManagerTests(unittest.IsolatedAsyncioTestCase):
    async def test_restart_marks_inflight_tasks_interrupted(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tasks_path = Path(temp_dir) / "tasks.json"
            manager = TaskManager(tasks_path=tasks_path, concurrency_limit=1)

            task = await manager.create_task("download", "example.mp4")
            await manager.update_task(task.id, status="processing", stage="Downloading")

            reloaded = TaskManager(tasks_path=tasks_path, concurrency_limit=1)
            restored = await reloaded.get_task(task.id)

            self.assertIsNotNone(restored)
            assert restored is not None
            self.assertEqual(restored.status, "error")
            self.assertEqual(restored.stage, "Interrupted after restart")
            self.assertIn("shutdown", restored.error or "")

    async def test_queue_concurrency_is_enforced(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tasks_path = Path(temp_dir) / "tasks.json"
            manager = TaskManager(tasks_path=tasks_path, concurrency_limit=1)

            first = await manager.create_task("convert", "first.wav")
            second = await manager.create_task("convert", "second.wav")

            first_started = asyncio.Event()
            second_started = asyncio.Event()
            release_first = asyncio.Event()

            async def first_runner() -> None:
                await manager.update_task(first.id, status="processing", stage="First running", progress=50)
                first_started.set()
                await release_first.wait()
                await manager.update_task(first.id, status="done", stage="Done", progress=100)

            async def second_runner() -> None:
                await manager.update_task(second.id, status="processing", stage="Second running", progress=50)
                second_started.set()
                await manager.update_task(second.id, status="done", stage="Done", progress=100)

            first_task = asyncio.create_task(manager.run_task(first.id, first_runner))
            second_task = asyncio.create_task(manager.run_task(second.id, second_runner))

            await asyncio.wait_for(first_started.wait(), timeout=1)
            await asyncio.sleep(0.1)
            self.assertFalse(second_started.is_set())

            queued = await manager.get_task(second.id)
            self.assertIsNotNone(queued)
            assert queued is not None
            self.assertEqual(queued.status, "queued")
            self.assertEqual(queued.stage, "Waiting for worker")

            release_first.set()
            await asyncio.wait_for(second_started.wait(), timeout=1)
            await asyncio.gather(first_task, second_task)

    async def test_cancel_queued_task_marks_task_cancelled(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tasks_path = Path(temp_dir) / "tasks.json"
            manager = TaskManager(tasks_path=tasks_path, concurrency_limit=1)

            task = await manager.create_task("download", "queued.mp4")
            cancelled = await manager.cancel(task.id)

            self.assertIsNotNone(cancelled)
            assert cancelled is not None
            self.assertEqual(cancelled.status, "cancelled")
            self.assertEqual(cancelled.stage, "Cancelled by user")

    async def test_cancel_running_task_marks_task_cancelled(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            tasks_path = Path(temp_dir) / "tasks.json"
            manager = TaskManager(tasks_path=tasks_path, concurrency_limit=1)

            task = await manager.create_task("convert", "running.wav")
            started = asyncio.Event()

            async def runner() -> None:
                await manager.update_task(task.id, status="processing", stage="Running", progress=35)
                started.set()
                while not manager.is_cancellation_requested(task.id):
                    await asyncio.sleep(0.05)
                raise RuntimeError("Task cancelled by user.")

            run = asyncio.create_task(manager.run_task(task.id, runner))
            await asyncio.wait_for(started.wait(), timeout=1)
            await manager.cancel(task.id)
            await run

            updated = await manager.get_task(task.id)
            self.assertIsNotNone(updated)
            assert updated is not None
            self.assertEqual(updated.status, "cancelled")
            self.assertEqual(updated.stage, "Cancelled by user")


class ReadinessServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_feature_guard_raises_for_unavailable_feature(self) -> None:
        snapshot = SystemHealth(
            status="degraded",
            checked_at=datetime.now(timezone.utc),
            output_folder="C:/MediaForge/Exports",
            checks=[
                HealthCheck(
                    key="ffmpeg",
                    label="FFmpeg",
                    status="missing",
                    detail="FFmpeg was not found.",
                )
            ],
            features=[
                FeatureHealth(
                    key="convert",
                    label="Convert",
                    status="missing",
                    detail="Blocked by FFmpeg",
                )
            ],
        )

        with patch("app.services.readiness_service.health_service.get", new=AsyncMock(return_value=snapshot)):
            with self.assertRaises(HTTPException) as context:
                await ensure_feature_ready("convert")

        self.assertEqual(context.exception.status_code, 503)
        self.assertIn("Convert is unavailable", context.exception.detail)

    async def test_feature_guard_allows_ready_feature(self) -> None:
        snapshot = SystemHealth(
            status="ok",
            checked_at=datetime.now(timezone.utc),
            output_folder="C:/MediaForge/Exports",
            checks=[],
            features=[
                FeatureHealth(
                    key="download",
                    label="Downloads",
                    status="ready",
                    detail="Ready",
                )
            ],
        )

        with patch("app.services.readiness_service.health_service.get", new=AsyncMock(return_value=snapshot)):
            await ensure_feature_ready("download")


class HealthServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_get_returns_placeholder_while_background_refresh_runs(self) -> None:
        service = HealthService()
        refresh_started = asyncio.Event()
        release_refresh = asyncio.Event()

        async def fake_refresh() -> SystemHealth:
            refresh_started.set()
            await release_refresh.wait()
            snapshot = SystemHealth(
                status="ok",
                checked_at=datetime.now(timezone.utc),
                output_folder="C:/MediaForge/Exports",
                checks=[],
                features=[],
            )
            service._snapshot = snapshot
            return snapshot

        service.refresh = fake_refresh  # type: ignore[method-assign]

        snapshot = await asyncio.wait_for(service.get(), timeout=0.2)
        self.assertEqual(snapshot.status, "degraded")
        self.assertTrue(any(check.detail == "Checking dependency..." for check in snapshot.checks))
        await asyncio.wait_for(refresh_started.wait(), timeout=0.2)

        release_refresh.set()
        await asyncio.wait_for(service._refresh_task, timeout=0.2)
        self.assertIsNotNone(service._snapshot)


if __name__ == "__main__":
    unittest.main()
