# Frontend

The frontend contains the React renderer, Electron main-process code, and desktop packaging scripts.

## Layout

- `electron/`: Electron main process, preload bridge, updater, and desktop integration
- `public/`: static assets bundled by Vite
- `scripts/`: build-time helpers for icons, runtime config, and backend staging
- `src/app/`: app shell, route registration, and top-level providers
- `src/components/`: reusable UI grouped by workflow and layout area
- `src/features/`: feature-specific hooks and selectors
- `src/hooks/`: shared React hooks used across features
- `src/lib/`: framework-agnostic utilities
- `src/pages/`: route-level screens
- `src/store/`: Zustand stores and app state
- `src/types/`: shared TypeScript contracts

## Local Run

```bash
npm install
npm run dev
```

Desktop shell:

```bash
npm run dev:desktop
```

## Quality Checks

```bash
npm run lint
npm run build
```
