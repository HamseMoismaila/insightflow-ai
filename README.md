# insightflow-ai

InsightFlow AI is a local MVP for uploading CSV/XLSX datasets, generating dataset-aware analysis, and rendering a dashboard with summaries, recommendations, insight cards, and charts.

## What It Does Today

The current implementation supports this end-to-end flow:

1. Upload a CSV or XLSX file from the React frontend
2. Validate and store the file on the FastAPI backend
3. Load the dataset with pandas
4. Build a report from real dataset signals such as:
   - row and column counts
   - numeric ranges and averages
   - simple trend direction
   - dominant category values
   - missing values and duplicates
5. Generate an AI-backed summary when OpenAI is configured, or a safe local fallback summary when it is not
6. Save a dashboard-ready report payload to local storage
7. Fetch and render the report in the frontend

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Recharts
- Lucide React

### Backend

- Python 3
- FastAPI
- Uvicorn
- Pydantic and Pydantic Settings
- Pandas
- OpenPyXL
- python-multipart
- HTTPX

### Tooling

- Pytest
- Docker
- Docker Compose

## Current Architecture

- `frontend/` contains the React app
- `backend/app/` contains the FastAPI app
- `backend/app/api/v1/` contains HTTP routes
- `backend/app/services/` contains the main business logic
- `backend/app/schemas/` contains response models
- `data/uploads/` stores uploaded files locally
- `data/reports/` stores generated report JSON locally
- `docs/` contains product and technical documentation

## Implemented API

- `GET /api/v1/health`
- `POST /api/v1/upload`
- `POST /api/v1/analyze/{upload_id}`
- `GET /api/v1/dashboard/{report_id}`

## Current Report Behavior

The dashboard now prioritizes actual dataset findings before data-quality warnings.

Examples of the current report content:

- trend direction for numeric columns
- min, max, and average for key numeric columns
- most common values for categorical columns
- recommendations tied to observed dataset behavior
- missing-value and duplicate notes as supporting context

## Local Development

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

### Local URLs

- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:8000/api/v1/health`

## Environment Variables

Important variables used by the current MVP:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_SECONDS`
- `OPENAI_BASE_URL`
- `ALLOWED_CORS_ORIGINS`
- `UPLOAD_STORAGE_DIR`
- `REPORT_STORAGE_DIR`
- `MAX_UPLOAD_SIZE_BYTES`
- `DATABASE_URL`
- `VITE_API_BASE_URL`

See `.env.example` for the current template.

## Notes

- The MVP currently persists uploads and reports on the local filesystem.
- PostgreSQL is prepared in Docker infrastructure, but the active MVP flow does not yet store uploads or reports in the database.
- OpenAI is optional for local development because the backend includes a safe fallback report path.
- The frontend is connected to the real backend API and renders report payloads returned by the backend.
