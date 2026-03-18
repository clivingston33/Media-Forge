from __future__ import annotations

import os
import shutil
import subprocess
from functools import lru_cache
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent
RUNTIME_ROOT = Path(os.environ.get("MEDIAFORGE_RUNTIME_DIR", str(BACKEND_ROOT / ".runtime")))
TOOLS_VENV_ROOT = BACKEND_ROOT / ".venv312"
BUNDLED_TOOLS_ROOT = BACKEND_ROOT / "tools"


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def runtime_dir(*parts: str) -> Path:
    return ensure_dir(RUNTIME_ROOT.joinpath(*parts))


def uploads_dir(kind: str) -> Path:
    return runtime_dir("uploads", kind)


def cache_dir() -> Path:
    return runtime_dir("cache")


def logs_dir() -> Path:
    return runtime_dir("logs")


def state_dir() -> Path:
    return runtime_dir("state")


def output_dir() -> Path:
    from app.services.settings_service import settings_service

    return ensure_dir(Path(settings_service.get().output_folder))


def runner_script(name: str) -> Path:
    return BACKEND_ROOT / "app" / "tooling" / name


def bundled_tool_path(*parts: str) -> Path:
    return BUNDLED_TOOLS_ROOT.joinpath(*parts)


def _pick_existing(label: str, candidates: list[Path]) -> Path:
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate

    raise RuntimeError(
        f"{label} is not installed or could not be located. Run backend/setup_real_tools.ps1 first."
    )


def _winget_tool_candidates(filename: str) -> list[Path]:
    local_appdata = os.environ.get("LOCALAPPDATA")
    if not local_appdata:
        return []

    winget_root = Path(local_appdata) / "Microsoft" / "WinGet" / "Packages"
    if not winget_root.exists():
        return []

    return list(winget_root.rglob(filename))


@lru_cache
def tool_python() -> Path:
    env_override = os.environ.get("MEDIAFORGE_TOOL_PYTHON")
    candidates = []

    if env_override:
        candidates.append(Path(env_override))

    candidates.append(TOOLS_VENV_ROOT / "Scripts" / "python.exe")
    return _pick_existing("Media tool Python runtime", candidates)


@lru_cache
def ffmpeg_path() -> Path:
    env_override = os.environ.get("MEDIAFORGE_FFMPEG")
    path_candidates = []

    if env_override:
        path_candidates.append(Path(env_override))

    path_candidates.append(bundled_tool_path("ffmpeg", "ffmpeg.exe" if os.name == "nt" else "ffmpeg"))

    resolved = shutil.which("ffmpeg")
    if resolved:
        path_candidates.append(Path(resolved))

    path_candidates.extend(_winget_tool_candidates("ffmpeg.exe"))
    return _pick_existing("FFmpeg", path_candidates)


@lru_cache
def ffprobe_path() -> Path:
    env_override = os.environ.get("MEDIAFORGE_FFPROBE")
    path_candidates = []

    if env_override:
        path_candidates.append(Path(env_override))

    path_candidates.append(bundled_tool_path("ffmpeg", "ffprobe.exe" if os.name == "nt" else "ffprobe"))

    resolved = shutil.which("ffprobe")
    if resolved:
        path_candidates.append(Path(resolved))

    path_candidates.extend(_winget_tool_candidates("ffprobe.exe"))
    return _pick_existing("FFprobe", path_candidates)


def demucs_device() -> str:
    from app.services.settings_service import settings_service

    if not settings_service.get().gpu_acceleration:
        return "cpu"

    process = subprocess.run(
        [str(tool_python()), "-c", "import torch; print('cuda' if torch.cuda.is_available() else 'cpu')"],
        capture_output=True,
        check=False,
        text=True,
    )
    detected = process.stdout.strip().lower()
    return detected if detected in {"cpu", "cuda"} else "cpu"
