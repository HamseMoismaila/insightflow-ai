# Deployment Guide

# Deployment Architecture

Frontend → Vercel
Backend → Render / Railway
AI APIs → OpenAI / Gemini

---

# Backend Deployment

## Render

### Steps

1. Push backend to GitHub
2. Create Render Web Service
3. Add environment variables
4. Deploy FastAPI application

### Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port 10000
```

---

# Frontend Deployment

## Vercel

### Steps

1. Push frontend to GitHub
2. Import into Vercel
3. Configure environment variables
4. Deploy application

---

# Environment Variables

```env
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key
BACKEND_URL=https://your-api.com
```

---

# Docker Deployment

## Build Image

```bash
docker build -t ai-insight-generator .
```

## Run Container

```bash
docker run -p 8000:8000 ai-insight-generator
```

---

# Production Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Logging enabled
- [ ] Health checks configured
- [ ] Error monitoring enabled
