# insightflow-ai

InsightFlow AI is an MVP analytics application for uploading CSV/XLSX datasets, generating AI-backed insights, and displaying a dashboard of summaries, recommendations, and charts.

## Overview

The project is built as a frontend-backend monorepo:
- a React frontend for file upload, analysis flow, and dashboard display
- a FastAPI backend for upload handling, dataset analysis, AI prompt generation, and dashboard response shaping
- local filesystem storage for uploaded files and generated reports in the current MVP

The current implementation supports the full local v1 workflow:
1. upload a CSV or XLSX dataset
2. store and validate the file on the backend
3. generate a dataset summary with pandas
4. produce AI-backed or safe mock insights
5. return dashboard-ready JSON to the frontend

## Technologies Used

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Recharts for bar, line, and pie charts
- Lucide React for UI icons

### Backend

- Python 3
- FastAPI
- Uvicorn
- Pydantic Settings for environment-based configuration
- Pandas for dataset loading and numeric/statistical profiling
- OpenPyXL for XLSX parsing
- `python-multipart` for file upload handling
- HTTPX for OpenAI API communication

### AI / Prompting

- OpenAI Responses API integration
- Prompt-building service based on `docs/PROMPTS.md`
- Input sanitization and prompt-safety filtering
- Safe fallback summary/recommendations when OpenAI is not configured

### Tooling / Infrastructure

- Docker for backend containerization
- Docker Compose for backend + PostgreSQL local setup
- Pytest for backend testing

## Current Backend Features

Implemented API routes:
- `GET /api/v1/health`
- `POST /api/v1/upload`
- `POST /api/v1/analyze/{upload_id}`
- `GET /api/v1/dashboard/{report_id}`

Implemented backend capabilities:
- CSV and XLSX validation
- safe local upload storage
- row count, column count, column names, missing values, and numeric statistics generation
- dashboard-ready chart payload generation
- recommendations and summary generation
- CORS support for local frontend-backend development

## Current Frontend Features

Implemented frontend capabilities:
- dataset upload UI
- drag-and-drop upload flow
- upload progress, error, and retry states
- analysis progress state
- dashboard summary view
- recommendation panel
- insight cards
- bar, line, and pie chart display
- empty, loading, and error states

## Project Structure

Key directories:
- `frontend/` - React + Vite frontend
- `backend/` - FastAPI backend
- `docs/` - product, API, roadmap, security, and system design documents
- `data/uploads/` - local uploaded datasets for MVP
- `data/reports/` - local generated report payloads for MVP

## Current Status

Completed work in this repository:
- FastAPI backend with working MVP routes
- React frontend integrated into repo structure
- local end-to-end upload -> analyze -> dashboard flow working
- OpenAI configuration through environment variables
- Docker setup for backend and PostgreSQL
- backend automated tests for:
  - health
  - config
  - prompt safety
  - OpenAI service
  - upload
  - analysis
  - dashboard
  - CORS

## Local Development

Backend from the repo root:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Frontend from `frontend/`:

```powershell
npm install
npm run dev
```

Local URLs:
- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:8000/api/v1/health`

## Environment Notes

Important environment variables:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_SECONDS`
- `ALLOWED_CORS_ORIGINS`
- `UPLOAD_STORAGE_DIR`
- `REPORT_STORAGE_DIR`
- `MAX_UPLOAD_SIZE_BYTES`
- `DATABASE_URL`
- `VITE_API_BASE_URL`

See [.env.example](C:/Users/User/OneDrive%20-%20Nilai%20University/Desktop/insightflow-ai/.env.example) for the current template.

## Notes

- The MVP currently uses local filesystem storage for uploads and reports.
- Secrets are environment-based and are not hardcoded in the codebase.
- Public deployment remains planned work and is not yet complete.
- PostgreSQL is prepared in local infrastructure, but the current MVP flow still relies on local file/report storage rather than database persistence.
