from __future__ import annotations

import asyncio
import subprocess
from datetime import datetime, timezone
from uuid import uuid4

from app.models.health import FeatureHealth, HealthCheck, HealthCheckStatus, SystemHealth
from app.utils.paths import ffmpeg_path, ffprobe_path, output_dir, tool_python


class HealthService:
    def __init__(self) -> None:
        self._snapshot: SystemHealth | None = None
        self._lock = asyncio.Lock()

    async def get(self, force_refresh: bool = False, max_age_seconds: int = 30) -> SystemHealth:
        snapshot = self._snapshot
        if snapshot is None:
            return await self.refresh()

        age_seconds = (datetime.now(timezone.utc) - snapshot.checked_at).total_seconds()
        if force_refresh or age_seconds > max_age_seconds:
            return await self.refresh()

        return snapshot

    async def refresh(self) -> SystemHealth:
        async with self._lock:
            snapshot = await asyncio.to_thread(self._probe)
            self._snapshot = snapshot
            return snapshot

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

        success, output = self._run_command([str(python_path), *command])
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

        success, output = self._run_command([str(resolved_path), *version_command])
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

    def _run_command(self, command: list[str]) -> tuple[bool, str]:
        process = subprocess.run(
            command,
            capture_output=True,
            check=False,
            text=True,
            timeout=30,
        )

        lines = [line.strip() for line in process.stdout.splitlines() if line.strip()]
        if not lines:
            lines = [line.strip() for line in process.stderr.splitlines() if line.strip()]

        message = lines[0] if lines else "Command completed without output."
        return process.returncode == 0, message


health_service = HealthService()
