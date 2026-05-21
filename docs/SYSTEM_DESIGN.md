# System Design

# High-Level Architecture

```text
Frontend (Next.js / Streamlit)
        ↓
Backend API (FastAPI)
        ↓
Data Processing Layer (Pandas)
        ↓
AI Insight Engine (OpenAI/Gemini)
        ↓
Visualization Layer (Plotly)
        ↓
Dashboard Output
```

---

# Frontend Layer

Responsibilities:
- dataset upload
- dashboard rendering
- charts display
- recommendations UI

Technologies:
- Next.js
- TailwindCSS
- Plotly

---

# Backend Layer

Responsibilities:
- API routing
- file validation
- orchestration
- AI integration

Technologies:
- FastAPI
- Python

---

# Data Processing Layer

Responsibilities:
- cleaning datasets
- duplicate detection
- missing value analysis
- statistical profiling

Technologies:
- Pandas
- NumPy

---

# AI Insight Engine

Responsibilities:
- trend analysis
- recommendations
- anomaly detection
- summaries

Technologies:
- OpenAI API
- Gemini API

---

# Visualization Layer

Responsibilities:
- generate charts
- dashboard visualization
- interactive analytics

Technologies:
- Plotly

---

# API Flow

```text
User Upload
→ FastAPI Endpoint
→ Dataset Validation
→ Pandas Processing
→ AI Prompt Generation
→ LLM Response
→ Dashboard Rendering
```

---

# Error Handling

The system should handle:
- invalid files
- corrupted datasets
- API failures
- timeout errors
- missing columns

---

# Scalability

Future improvements:
- asynchronous processing
- task queues
- cloud object storage
- distributed analytics
- caching systems
