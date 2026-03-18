# MediaForge

MediaForge is a desktop-first media toolkit scaffold built from the supplied UI mockup and project spec. It includes:

- a React + TypeScript + Tailwind frontend shaped around the dashboard/sidebar layout
- an Electron shell that can start and supervise the local backend automatically
- a FastAPI backend with persisted settings/tasks, readiness checks, queue controls, cancellation, and real media jobs powered by `yt-dlp`, `ffmpeg`, `Demucs`, and `rembg`

## Project Layout

- `frontend/`: React app, shared UI components, Zustand stores, Electron entrypoints
- `backend/`: FastAPI routes, persisted task manager, media tooling runners, runtime state
- `MediaForge-UI-Mockup.jsx`: original mockup reference
- `MediaForgeSPEC.md`: source spec used for the scaffold

## Run The Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run The Desktop Shell

```bash
cd frontend
npm install
npm run dev:desktop
```

`npm run dev:desktop` launches the Vite frontend and the Electron shell. The Electron shell now boots the backend automatically if `http://127.0.0.1:8000` is not already healthy.

## Run The Backend

```bash
cd backend
python -m pip install -r requirements.txt
python start.py
```

## Enable Real Media Tools

The FastAPI server runs from `backend/.venv`, but the heavier media tooling is isolated in `backend/.venv312` so `demucs`, `rembg`, and `yt-dlp` can run under a supported Python version.

On Windows, you can provision the toolchain with:

```powershell
powershell -ExecutionPolicy Bypass -File backend/setup_real_tools.ps1
```

That script installs:

- the FastAPI runtime into `backend/.venv`
- Python 3.12 for the dedicated media-tool environment
- FFmpeg through `winget`
- `yt-dlp`, `demucs`, `rembg[cpu]`, and their helper dependencies into `backend/.venv312`
- bundled `ffmpeg.exe` and `ffprobe.exe` into `backend/tools/ffmpeg` for packaged desktop builds

If you already manage those binaries yourself, the backend can also use:

- `MEDIAFORGE_TOOL_PYTHON`
- `MEDIAFORGE_FFMPEG`
- `MEDIAFORGE_FFPROBE`

## Logs And Operations

- Backend logs are written under `backend/.runtime/logs` in direct backend runs.
- Desktop app logs are written under the Electron user-data logs folder and can be opened from the Settings page.
- Tasks can be cancelled from the Queue page while queued or processing.
- Installed desktop builds can check for GitHub-hosted updates from the Settings page when an `app-update.yml` feed is packaged into the release.

## Build A Desktop Artifact

```bash
cd frontend
npm install
npm run dist:dir
```

That produces an unpacked Windows desktop build under `frontend/release/win-unpacked` with the backend resources bundled into the app layout expected by Electron. The packaging scripts generate the branded desktop icons automatically before building.

To create a Windows installer instead:

```bash
cd frontend
npm install
npm run dist:win
```

That produces an NSIS installer under `frontend/release/`.

## Release Automation

GitHub Actions release packaging is defined in `.github/workflows/release-desktop.yml`. The workflow:

- installs Node 22 and Python 3.12
- provisions `backend/.venv`, `backend/.venv312`, and bundled FFmpeg from scratch
- runs backend regression tests
- publishes an NSIS release build through `npm run dist:release`

The production release path reads its desktop runtime configuration from `frontend/build/runtime-config.json`, which is generated automatically during `npm run build` from these environment variables:

- `MEDIAFORGE_UPDATE_REPOSITORY=owner/repo`
- `MEDIAFORGE_RELEASE_CHANNEL=stable`
- `MEDIAFORGE_SENTRY_DSN`
- `MEDIAFORGE_BACKEND_SENTRY_DSN`
- `MEDIAFORGE_SENTRY_ENVIRONMENT`
- `MEDIAFORGE_SENTRY_TRACES_SAMPLE_RATE`

For signed Windows releases, add these GitHub secrets:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `MEDIAFORGE_SENTRY_DSN`
- `MEDIAFORGE_BACKEND_SENTRY_DSN`

If the signing secrets are absent, the workflow still produces an unsigned installer.

## Verified Workflows

The real backend has been smoke-tested for:

- `/api/convert` with FFmpeg audio conversion
- `/api/remove-bg` with `rembg`
- `/api/separate` with Demucs vocal separation
- `/api/download` with `yt-dlp` for generic media URLs and public YouTube URLs
