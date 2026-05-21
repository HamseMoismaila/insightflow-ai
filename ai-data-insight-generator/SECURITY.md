# Security Guidelines

# File Upload Security

- Validate file types
- Restrict upload size
- Reject executable files
- Prevent path traversal
- Sanitize filenames

---

# API Security

- Protect API keys
- Use environment variables
- Validate requests
- Add rate limiting

---

# AI Security

- Prevent prompt injection
- Sanitize dataset text
- Restrict dangerous prompts
- Filter malicious input

---

# Infrastructure Security

- HTTPS only
- Enable logging
- Monitor failures
- Secure deployment environments

---

# Secrets Management

Never commit:
- API keys
- database credentials
- .env files

Use:
- cloud secret managers
- environment variables

---

# Future Security Features

- Authentication
- RBAC permissions
- Audit logging
- Encryption at rest
