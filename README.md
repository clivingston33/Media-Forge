# MediaForge

MediaForge is a Windows-first desktop media workstation for local media downloads, file conversion, background removal, and vocal isolation. The app pairs an Electron desktop shell and React frontend with a FastAPI backend that runs real jobs through `yt-dlp`, `ffmpeg`, `Demucs`, and `rembg`.

## Install

If you want to use MediaForge instead of develop it, download the Windows installer from the latest release:

- Releases: https://github.com/clivingston33/Media-Forge/releases/latest
- Wiki: https://github.com/clivingston33/Media-Forge/wiki

Open the release, expand **Assets**, and download `MediaForge-0.1.0-win-x64.exe`.

Do not download `Source code (zip)` or `Source code (tar.gz)` unless you want the repository files for development.

## Features

- Queue and monitor local download, conversion, vocal separation, and background removal jobs
- Persist settings and task history across restarts
- Block job launches when required tools are missing
- Manage logs, update checks, and desktop runtime health from the app
- Package the desktop experience as an installable Windows build

## Architecture

- `frontend/`: React renderer, Electron runtime, feature hooks, and desktop packaging
- `backend/`: FastAPI app, `core` bootstrapping, router composition, services, and tool runners
- `docs/architecture.md`: module boundaries and request flow
- `.github/workflows/release-desktop.yml`: Windows release automation

Package-specific notes live in `frontend/README.md` and `backend/README.md`.

## Getting Started

### Run the backend

```bash
cd backend
python -m pip install -r requirements.txt
python start.py
```

### Run the web UI

```bash
cd frontend
npm install
npm run dev
```

### Run the desktop app

```bash
cd frontend
npm install
npm run dev:desktop
```

`npm run dev:desktop` starts the Vite renderer and launches Electron. The Electron shell will start the backend automatically when it is not already available at `http://127.0.0.1:8000`.

## Tooling Setup

MediaForge uses two Python environments on Windows:

- `backend/.venv` for the FastAPI application
- `backend/.venv312` for media tooling that requires Python 3.12

Provision the full local toolchain with:

```powershell
powershell -ExecutionPolicy Bypass -File backend/setup_real_tools.ps1
```

That script installs the backend runtime, provisions the dedicated media-tool environment, installs FFmpeg, and prepares packaged-tool resources used by desktop builds.

If you manage the binaries yourself, MediaForge also supports:

- `MEDIAFORGE_TOOL_PYTHON`
- `MEDIAFORGE_FFMPEG`
- `MEDIAFORGE_FFPROBE`

## Quality Checks

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

### Backend

```bash
cd backend
python -m unittest discover -s tests -v
```

## Packaging

Create an unpacked desktop build:

```bash
cd frontend
npm run dist:dir
```

Create a Windows installer:

```bash
cd frontend
npm run dist:win
```

Release packaging is automated through `.github/workflows/release-desktop.yml`.

## Runtime And Operations

- Backend logs are written under `backend/.runtime/logs` for direct backend runs.
- Desktop logs are written under Electron user data and can be opened from Settings.
- Installed builds can check for GitHub-hosted updates when an `app-update.yml` feed is bundled into the release.
- Optional Sentry configuration is supported for both the desktop shell and backend services.

## Project Standards

- Contribution guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Release automation: `.github/workflows/release-desktop.yml`
