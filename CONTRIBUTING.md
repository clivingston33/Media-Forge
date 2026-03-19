# Contributing

Thanks for contributing to MediaForge.

## Ground Rules

- Keep changes scoped and production-oriented.
- Prefer small pull requests with a clear user-facing outcome.
- Match the existing architecture instead of introducing parallel patterns.
- Do not commit secrets, local runtime data, packaged artifacts, or generated virtual environments.

## Local Setup

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python start.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Desktop Shell

```bash
cd frontend
npm run dev:desktop
```

## Required Checks

Run the relevant checks before opening a pull request.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd backend
python -m unittest discover -s tests -v
python -m compileall app tests
```

## Pull Request Expectations

- Explain the problem and the user-facing result.
- Include screenshots for UI changes when practical.
- Call out any follow-up work or known limitations.
- Update docs when behavior or setup changes.
