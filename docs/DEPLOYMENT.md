# Deployment Guide

## Current Status

Production deployment is still planned work.

What exists today:

- a Dockerfile for the backend in `backend/`
- a `docker-compose.yml` file for backend plus PostgreSQL
- local frontend development through Vite

## Local Runtime

### Backend

From the repo root:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

## Docker Compose

Current compose services:

- `backend`
- `postgres`

Notes:

- PostgreSQL is available for future persistence work
- the active MVP report flow still uses filesystem storage for uploads and reports

### Start Compose

```bash
docker compose up --build
```

### Backend Health URL

```text
http://127.0.0.1:8000/api/v1/health
```

## Backend Container Details

The backend container:

- builds from `backend/Dockerfile`
- installs dependencies from the root `requirements.txt`
- starts Uvicorn with `backend.app.main:app`

## Environment Variables

Currently relevant environment values:

```env
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5
OPENAI_TIMEOUT_SECONDS=30
OPENAI_BASE_URL=https://api.openai.com/v1
ALLOWED_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
UPLOAD_STORAGE_DIR=data/uploads
REPORT_STORAGE_DIR=data/reports
MAX_UPLOAD_SIZE_BYTES=52428800
DATABASE_URL=postgresql://insightflow:change_me@postgres:5432/insightflow
VITE_API_BASE_URL=http://localhost:8000
```

## Planned Hosting Direction

Possible future deployment split:

- frontend on Vercel or similar static hosting
- backend on Render, Railway, or another Python host
- managed PostgreSQL once report persistence is activated

## Production Checklist

- [ ] Enable HTTPS
- [ ] Store secrets outside the repository
- [ ] Configure logging and monitoring
- [ ] Add rate limiting
- [ ] Confirm CORS for the deployed frontend origin
- [ ] Move uploads and reports to durable storage
