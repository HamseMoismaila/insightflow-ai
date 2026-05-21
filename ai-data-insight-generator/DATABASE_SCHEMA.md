# Database Schema

# Overview

The MVP may initially operate without persistent storage.

Future versions will support:
- users
- reports
- uploads
- AI history
- analytics tracking

---

# Tables

## Users

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| email | VARCHAR | User email |
| password_hash | TEXT | Hashed password |
| created_at | TIMESTAMP | Account creation |

---

## Uploads

| Field | Type | Description |
|---|---|---|
| id | UUID | Upload ID |
| user_id | UUID | Owner |
| filename | VARCHAR | Uploaded filename |
| file_size | INTEGER | File size |
| created_at | TIMESTAMP | Upload timestamp |

---

## Reports

| Field | Type | Description |
|---|---|---|
| id | UUID | Report ID |
| upload_id | UUID | Related upload |
| summary | TEXT | AI summary |
| recommendations | JSON | AI recommendations |
| charts | JSON | Visualization metadata |
| created_at | TIMESTAMP | Report timestamp |

---

## Analytics_History

| Field | Type | Description |
|---|---|---|
| id | UUID | Analysis ID |
| report_id | UUID | Related report |
| anomaly_detected | BOOLEAN | Anomaly flag |
| trend_summary | TEXT | Trend analysis |
| created_at | TIMESTAMP | Timestamp |

---

# Relationships

```text
Users
  ↓
Uploads
  ↓
Reports
  ↓
Analytics_History
```
