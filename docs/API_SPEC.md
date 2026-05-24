# API Specification

## Base URL

```text
/api/v1
```

## Endpoints

## `POST /upload`

Upload a CSV or XLSX dataset.

### Success Response

```json
{
  "upload_id": "upl_ab12cd34ef56",
  "filename": "sales.csv",
  "status": "success",
  "message": "Dataset uploaded successfully"
}
```

### Error Cases

- unsupported file type
- empty file
- file larger than configured upload limit

## `POST /analyze/{upload_id}`

Analyze a previously uploaded dataset and create a dashboard report.

### Success Response

```json
{
  "report_id": "rep_ab12cd34ef56",
  "status": "success"
}
```

### Notes

- the current backend stores the final report under a `report_id`
- summary text and recommendations are returned from `GET /dashboard/{report_id}`
- analysis includes dataset-derived signals such as trends, numeric ranges, category leaders, and quality notes

## `GET /dashboard/{report_id}`

Fetch the generated dashboard payload.

### Success Response Shape

```json
{
  "report_id": "rep_ab12cd34ef56",
  "filename": "sales.csv",
  "row_count": 120,
  "analyzed_at": "2026-05-24T00:00:00+00:00",
  "summary": "The dataset contains 120 rows across 5 columns. revenue trends upward from 100 to 160 (60.0% change).",
  "recommendations": [
    "Prioritize investigation of revenue because it moved upward by 60.0% across the sampled records.",
    "Use region segmentation to compare why North leads with 48 rows.",
    "Data quality checks look stable, so the report can stay focused on business interpretation."
  ],
  "insights": [
    {
      "id": "insight-summary",
      "title": "Dataset scope",
      "description": "The uploaded dataset contains 120 rows and 5 columns."
    }
  ],
  "charts": {
    "barChartData": [
      { "name": "Row 1", "value": 100.0 }
    ],
    "lineChartData": [
      { "name": "Point 1", "value": 60.0 }
    ],
    "pieChartData": [
      { "name": "North", "value": 48.0 }
    ]
  }
}
```

## `GET /health`

Simple service health check.

### Success Response

```json
{
  "status": "healthy"
}
```

## Current Scope Notes

- there is no active `POST /insights` route in the current implementation
- the frontend uses `upload -> analyze -> dashboard` as the complete flow
- report payloads are stored on the local filesystem in the MVP
