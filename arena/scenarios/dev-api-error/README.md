# dev-api-error

REST API error responses (400, 401, 403, 404, 409) dengan validation details, auth issues, dan state transition errors.

## Data Type
- HTTP error responses with validation details, auth context, state machine info

## Payload Formats
- `json.txt` — JSON array
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `status` — HTTP status code
- `error.code` — Application error code
- `error.details` — Human-readable explanation
- `error.sso` — SSO provider error (for 401)
- `error.user` — User context (for 403)
- `error.allowed_transitions` — State machine (for 409)

## Developer Actions
- Add client-side validation before submit
- Handle SSO token refresh flow
- Implement proper RBAC middleware
- Add state machine validation in API layer
