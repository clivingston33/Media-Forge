# Backend

The backend is a FastAPI application responsible for job orchestration, health checks, persisted settings, and execution of the local media toolchain.

## Layout

- `app/api/`: API router composition
- `app/core/`: application bootstrapping, configuration, and HTTP concerns
- `app/models/`: request, response, and domain models
- `app/routers/`: feature routes
- `app/services/`: business logic and long-running job orchestration
- `app/tooling/`: command runners used by external media tools
- `app/utils/`: file system, process, and persistence helpers
- `tests/`: backend regression coverage

## Local Run

```bash
python -m pip install -r requirements.txt
python start.py
```

Environment variables:

- `MEDIAFORGE_HOST`
- `MEDIAFORGE_PORT`
- `MEDIAFORGE_RELOAD`
- `MEDIAFORGE_RUNTIME_DIR`
- `MEDIAFORGE_TOOL_PYTHON`
- `MEDIAFORGE_FFMPEG`
- `MEDIAFORGE_FFPROBE`

## Test

```bash
python -m unittest discover -s tests -v
```
