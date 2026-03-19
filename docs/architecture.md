# Architecture

MediaForge is split into three runtime layers:

## 1. Renderer

The React renderer owns screen composition, local interaction state, and presentation logic.

- `frontend/src/app/`: shell, routes, and providers
- `frontend/src/pages/`: route-level workspaces
- `frontend/src/components/`: reusable UI
- `frontend/src/features/`: feature-specific hooks and selectors
- `frontend/src/store/`: long-lived client state
- `frontend/src/lib/`: pure utilities

## 2. Desktop Runtime

The Electron layer owns desktop-only capabilities that should not leak into renderer code.

- backend process orchestration
- desktop logging
- updater integration
- native dialogs
- shell actions such as reveal-in-folder

The renderer talks to Electron only through the preload bridge.

## 3. Backend

The backend is the system of record for job execution, health checks, and persisted settings.

- `backend/app/core/`: configuration, app construction, lifecycle, and HTTP concerns
- `backend/app/api/`: composed router registration
- `backend/app/routers/`: request handling by feature
- `backend/app/services/`: orchestration and business logic
- `backend/app/tooling/`: media-tool runner entrypoints
- `backend/app/utils/`: filesystem and process helpers

## Request Flow

1. The renderer submits a job through the API client.
2. A backend router validates the request and checks feature readiness.
3. A backend service creates a task and schedules tool execution.
4. The task manager persists progress and exposes task updates to the UI.
5. The renderer polls task state and updates the relevant workspace.

## Design Principles

- Keep platform concerns in Electron, not in React components.
- Keep orchestration in backend services, not in API routers.
- Prefer feature hooks and selectors over repeated store plumbing in pages.
- Treat generated artifacts and local references as local-only, not source of truth.
