# API Specification

# Base URL

```text
/api/v1
```

---

# Endpoints

## Upload Dataset

### POST /upload

Upload CSV or Excel dataset.

### Response

```json
{
  "upload_id": "123",
  "status": "success"
}
```

---

## Generate Analysis

### POST /analyze/{upload_id}

Generate analytics and AI insights.

### Response

```json
{
  "summary": "Sales increased 22%",
  "recommendations": [
    "Increase inventory",
    "Focus marketing on top products"
  ]
}
```

---

## Get Dashboard Data

### GET /dashboard/{report_id}

Returns dashboard analytics and charts.

---

## Generate AI Insights

### POST /insights

Generate recommendations and summaries.

---

## Health Check

### GET /health

### Response

```json
{
  "status": "healthy"
}
```
