from __future__ import annotations

import asyncio
import contextlib
import subprocess
from datetime import datetime, timezone
from uuid import uuid4

from app.models.health import FeatureHealth, HealthCheck, HealthCheckStatus, SystemHealth
from app.utils.paths import ffmpeg_path, ffprobe_path, output_dir, tool_python


class HealthService:
    def __init__(self) -> None:
        self._snapshot: SystemHealth | None = None
        self._lock = asyncio.Lock()
        self._refresh_task: asyncio.Task[SystemHealth] | None = None

    async def get(self, force_refresh: bool = False, max_age_seconds: int = 300) -> SystemHealth:
        if force_refresh:
            return await self.refresh()

        snapshot = self._snapshot
        if snapshot is None:
            self.refresh_in_background()
            return self._placeholder_snapshot()

        age_seconds = (datetime.now(timezone.utc) - snapshot.checked_at).total_seconds()
        if age_seconds > max_age_seconds:
            self.refresh_in_background()

        return snapshot

    async def refresh(self) -> SystemHealth:
        async with self._lock:
            snapshot = await asyncio.to_thread(self._probe)
            self._snapshot = snapshot
            return snapshot

    def refresh_in_background(self) -> None:
        if self._refresh_task and not self._refresh_task.done():
            return

        self._refresh_task = asyncio.create_task(self.refresh())
        self._refresh_task.add_done_callback(self._on_refresh_complete)

    def _probe(self) -> SystemHealth:
        checks = [
            self._check_tool_python(),
            self._check_ffmpeg(),
            self._check_ffprobe(),
            self._check_python_module(
                key="yt_dlp",
                label="yt-dlp",
                command=["-c", "import yt_dlp.version as version; print(version.__version__)"],
                success_prefix="Version",
            ),
            self._check_python_module(
                key="demucs",
                label="Demucs",
                command=["-c", "import demucs; print('Import OK')"],
                success_prefix="Status",
            ),
            self._check_python_module(
                key="rembg",
                label="rembg",
                command=["-c", "from rembg import remove; print('Import OK')"],
                success_prefix="Status",
            ),
            self._check_output_folder(),
        ]

        checks_by_key = {check.key: check for check in checks}
        features = [
            self._build_feature(
                key="download",
                label="Downloads",
                required_checks=["tool_python", "ffmpeg", "yt_dlp", "output_folder"],
                checks_by_key=checks_by_key,
            ),
            self._build_feature(
                key="convert",
                label="Convert",
                required_checks=["ffmpeg", "ffprobe", "output_folder"],
                checks_by_key=checks_by_key,
            ),
            self._build_feature(
                key="separate",
                label="Voice Isolate",
                required_checks=["tool_python", "ffmpeg", "demucs", "output_folder"],
                checks_by_key=checks_by_key,
            ),
            self._build_feature(
                key="remove_bg",
                label="Remove BG",
                required_checks=["tool_python", "rembg", "output_folder"],
                checks_by_key=checks_by_key,
            ),
        ]

        overall_status: HealthCheckStatus = "ready" if all(feature.status == "ready" for feature in features) else "degraded"
        return SystemHealth(
            status="ok" if overall_status == "ready" else "degraded",
            checked_at=datetime.now(timezone.utc),
            output_folder=str(output_dir()),
            checks=checks,
            features=features,
        )

    def _on_refresh_complete(self, task: asyncio.Task[SystemHealth]) -> None:
        if self._refresh_task is task:
            self._refresh_task = None

        with contextlib.suppress(Exception):
            task.result()

    def _placeholder_snapshot(self) -> SystemHealth:
        return SystemHealth(
            status="degraded",
            checked_at=datetime.now(timezone.utc),
            output_folder=str(output_dir()),
            checks=[
                self._pending_check("tool_python", "Tool Python"),
                self._pending_check("ffmpeg", "FFmpeg"),
                self._pending_check("ffprobe", "FFprobe"),
                self._pending_check("yt_dlp", "yt-dlp"),
                self._pending_check("demucs", "Demucs"),
                self._pending_check("rembg", "rembg"),
                self._check_output_folder(),
            ],
            features=[
                self._pending_feature("download", "Downloads"),
                self._pending_feature("convert", "Convert"),
                self._pending_feature("separate", "Voice Isolate"),
                self._pending_feature("remove_bg", "Remove BG"),
            ],
        )

    def _build_feature(
        self,
        key: str,
        label: str,
        required_checks: list[str],
        checks_by_key: dict[str, HealthCheck],
    ) -> FeatureHealth:
        blocked_by = [checks_by_key[item] for item in required_checks if checks_by_key[item].status != "ready"]
        if not blocked_by:
            return FeatureHealth(key=key, label=label, status="ready", detail="Ready")

        detail = "Blocked by " + ", ".join(check.label for check in blocked_by)
        status: HealthCheckStatus = "missing" if any(check.status == "missing" for check in blocked_by) else "degraded"
        return FeatureHealth(key=key, label=label, status=status, detail=detail)

    def _pending_check(self, key: str, label: str) -> HealthCheck:
        return HealthCheck(key=key, label=label, status="degraded", detail="Checking dependency...")

    def _pending_feature(self, key: str, label: str) -> FeatureHealth:
        return FeatureHealth(key=key, label=label, status="degraded", detail="Checking dependencies...")

    def _check_tool_python(self) -> HealthCheck:
        return self._check_executable(
            key="tool_python",
            label="Tool Python",
            resolver=tool_python,
            version_command=["-c", "import sys; print(sys.version.split()[0])"],
            success_prefix="Python",
        )

    def _check_ffmpeg(self) -> HealthCheck:
        return self._check_executable(
            key="ffmpeg",
            label="FFmpeg",
            resolver=ffmpeg_path,
            version_command=["-version"],
            success_prefix="Version",
        )

    def _check_ffprobe(self) -> HealthCheck:
        return self._check_executable(
            key="ffprobe",
            label="FFprobe",
            resolver=ffprobe_path,
            version_command=["-version"],
            success_prefix="Version",
        )

    def _check_python_module(
        self,
        key: str,
        label: str,
        command: list[str],
        success_prefix: str,
    ) -> HealthCheck:
        try:
            python_path = tool_python()
        except Exception as error:
            return HealthCheck(key=key, label=label, status="missing", detail=str(error))

        success, output = self._run_command([str(python_path), *command], timeout_seconds=15)
        detail = f"{success_prefix} {output}" if success else output
        return HealthCheck(
            key=key,
            label=label,
            status="ready" if success else "degraded",
            detail=detail,
            location=str(python_path),
        )

    def _check_executable(
        self,
        key: str,
        label: str,
        resolver,
        version_command: list[str],
        success_prefix: str,
    ) -> HealthCheck:
        try:
            resolved_path = resolver()
        except Exception as error:
            return HealthCheck(key=key, label=label, status="missing", detail=str(error))

        success, output = self._run_command([str(resolved_path), *version_command], timeout_seconds=10)
        detail = f"{success_prefix} {output}" if success else output
        return HealthCheck(
            key=key,
            label=label,
            status="ready" if success else "degraded",
            detail=detail,
            location=str(resolved_path),
        )

    def _check_output_folder(self) -> HealthCheck:
        folder_location: str | None = None
        try:
            folder = output_dir()
            folder_location = str(folder)
            probe = folder / f".mediaforge-health-{uuid4().hex}.tmp"
            probe.write_text("ok", encoding="utf-8")
            probe.unlink(missing_ok=True)
        except Exception as error:
            return HealthCheck(
                key="output_folder",
                label="Output Folder",
                status="degraded",
                detail=str(error),
                location=folder_location,
            )

        return HealthCheck(
            key="output_folder",
            label="Output Folder",
            status="ready",
            detail="Writable",
            location=str(folder),
        )

    def _run_command(self, command: list[str], timeout_seconds: int) -> tuple[bool, str]:
        process = subprocess.run(
            command,
            capture_output=True,
            check=False,
            text=True,
            timeout=timeout_seconds,
        )

        lines = [line.strip() for line in process.stdout.splitlines() if line.strip()]
        if not lines:
            lines = [line.strip() for line in process.stderr.splitlines() if line.strip()]

        message = lines[0] if lines else "Command completed without output."
        return process.returncode == 0, message


health_service = HealthService()
