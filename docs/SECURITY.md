# Security Guidelines

## Current Security Controls

### File Upload Safety

Implemented in the current MVP:

- allow only `.csv` and `.xlsx`
- reject empty uploads
- enforce a maximum upload size
- sanitize filenames with `Path(...).name`
- store uploads only in the configured upload directory

### API and Configuration Safety

Implemented in the current MVP:

- OpenAI API key is environment-based
- settings are loaded through Pydantic Settings
- CORS origins are explicitly configured
- OpenAI base URL is restricted to approved OpenAI hosts

### AI Prompt Safety

Implemented in the current MVP:

- dataset summaries are sanitized before prompt construction
- control characters are stripped
- structural tags are filtered
- prompt-injection phrases are replaced
- provider-side response storage is disabled in the OpenAI request

## Current Gaps

Not yet implemented:

- authentication
- authorization
- rate limiting
- audit logging
- encryption at rest for local report files
- durable production-grade secret management

## Operational Guidance

Do not commit:

- API keys
- database credentials
- `.env` files with real secrets

Use:

- environment variables
- hosted secret managers in production

## Future Security Work

- authentication and account ownership
- RBAC or scoped permissions
- report access controls
- rate limiting and abuse protection
- centralized logging and monitoring
