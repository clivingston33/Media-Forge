from __future__ import annotations

import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.utils.paths import uploads_dir


def sanitize_filename(value: str) -> str:
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._")
    return sanitized or "mediaforge_file"


def format_file_size(size_in_bytes: int) -> str:
    if size_in_bytes <= 0:
        return "0 B"

    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(size_in_bytes)
    unit_index = 0

    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1

    precision = 0 if unit_index == 0 else 1
    return f"{size:.{precision}f} {units[unit_index]}"


async def save_upload_file(upload: UploadFile, purpose: str) -> Path:
    original_name = upload.filename or "upload.bin"
    original_path = Path(original_name)
    stem = sanitize_filename(original_path.stem)
    suffix = original_path.suffix or ".bin"
    destination = uploads_dir(purpose) / f"{stem}_{uuid4().hex[:10]}{suffix}"

    with destination.open("wb") as handle:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break
            handle.write(chunk)

    await upload.close()
    return destination
