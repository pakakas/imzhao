# devops-deploy-rollback

Deployment rollback dari v1.3.0 ke v1.2.5 karena high error rate, dengan metrics comparison.

## Data Type
- Deployment metadata, rollback phases, before/after metrics

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `deployment.reason` — Why rollback
- `deployment.status` — completed
- `phases[]` — validate, pause, rollback, verify
- `metrics.before` — v1.3.0 (bad) metrics
- `metrics.after` — v1.2.5 (good) metrics

## DevOps Actions
- Investigate v1.3.0 error root cause
- Review deploy pipeline for regression tests
- Add canary deployment for gradual rollout
