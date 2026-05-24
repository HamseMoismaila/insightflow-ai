# Database Schema

## Current MVP Reality

The current application flow does not persist uploads or reports to PostgreSQL yet.

Implemented storage today:

- upload files are saved to `data/uploads`
- upload metadata is saved as JSON alongside the uploaded file
- generated reports are saved to `data/reports` as JSON payloads

## Current Local Record Shapes

### Upload Metadata JSON

Stored per upload in `data/uploads/{upload_id}.json`.

Fields:

- `upload_id`
- `filename`
- `stored_filename`
- `file_size`
- `created_at`

### Report JSON

Stored per report in `data/reports/{report_id}.json`.

Fields:

- `report_id`
- `filename`
- `row_count`
- `analyzed_at`
- `summary`
- `recommendations`
- `insights`
- `charts`

## Planned Relational Schema

The following tables remain a future direction once database persistence is activated.

### Users

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR | User email |
| password_hash | TEXT | Hashed password |
| created_at | TIMESTAMP | Account creation time |

### Uploads

| Field | Type | Description |
|---|---|---|
| id | UUID | Upload ID |
| user_id | UUID | Owner |
| filename | VARCHAR | Original filename |
| stored_filename | VARCHAR | Filesystem or object-storage key |
| file_size | INTEGER | File size in bytes |
| created_at | TIMESTAMP | Upload time |

### Reports

| Field | Type | Description |
|---|---|---|
| id | UUID | Report ID |
| upload_id | UUID | Related upload |
| summary | TEXT | Summary text |
| recommendations | JSON | Recommendation list |
| insights | JSON | Insight cards |
| charts | JSON | Chart payloads |
| created_at | TIMESTAMP | Report creation time |

### Analytics History

| Field | Type | Description |
|---|---|---|
| id | UUID | Analysis ID |
| report_id | UUID | Related report |
| trend_summary | TEXT | Trend notes |
| anomaly_detected | BOOLEAN | Optional anomaly flag |
| created_at | TIMESTAMP | Analysis timestamp |

## Relationship Direction

```text
Users
  ->
Uploads
  ->
Reports
  ->
Analytics History
```
