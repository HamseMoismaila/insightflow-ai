# System Design

## Current MVP Architecture

```text
React + Vite Frontend
        ->
FastAPI Backend
        ->
Pandas Analysis Layer
        ->
OpenAI Responses API (optional)
        ->
Dashboard Report JSON
        ->
Frontend Charts and Insight Cards
```

## Frontend Layer

Responsibilities:

- accept CSV/XLSX uploads
- show upload and analysis states
- request backend endpoints
- render report summary, recommendations, insights, and charts

Technologies:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts

## Backend Layer

Responsibilities:

- expose API routes
- validate uploads
- orchestrate analysis
- call OpenAI when configured
- save report payloads

Technologies:

- FastAPI
- Pydantic
- Python

## Data Processing Layer

Responsibilities:

- load CSV/XLSX files with pandas
- compute row and column counts
- calculate numeric statistics
- detect missing values and duplicate rows
- derive simple trend and categorical highlights

Technologies:

- Pandas
- OpenPyXL for Excel parsing

## AI Insight Layer

Responsibilities:

- build sanitized prompts from dataset summaries
- request the OpenAI Responses API
- return text insights when available
- fall back to safe local summary generation when AI is unavailable

Technologies:

- OpenAI Responses API
- HTTPX

## Storage Model

Current MVP storage:

- uploaded files are stored in `data/uploads`
- generated reports are stored in `data/reports`

Prepared but not yet active in the report flow:

- PostgreSQL through `docker-compose.yml`

## API Flow

```text
User selects file
-> Frontend uploads file
-> FastAPI validates and stores upload
-> Frontend triggers analysis by upload_id
-> Backend loads dataset with pandas
-> Backend computes report signals
-> Backend requests OpenAI or uses fallback summary
-> Backend saves dashboard JSON by report_id
-> Frontend fetches dashboard JSON
-> Frontend renders charts and insight cards
```

## Error Handling

The current system handles:

- unsupported file types
- empty files
- oversized files
- missing uploads
- unreadable datasets
- missing reports
- OpenAI configuration failures
- OpenAI API request failures

## Planned Evolution

Future improvements may add:

- asynchronous/background analysis jobs
- persistent database-backed reports
- cloud object storage
- richer anomaly detection
- saved report history
- authentication and multi-user access
