# devops-pipeline-failure

CI/CD pipeline failure dengan failed test assertion, job stages, dan error log.

## Data Type
- Pipeline metadata, job statuses, test failure details

## Payload Formats
- `json.txt` — JSON object
- `yaml.txt` — YAML
- `md.txt` — Markdown
- `mz.txt` — MarkZero grid

## Key Fields
- `pipeline.status` — failed
- `pipeline.failed_job` — test
- `jobs[].status` — success / failed / skipped
- `jobs[].error_log` — Test assertion failure details

## DevOps Actions
- Review test performance benchmark threshold
- Check export service performance regression
- Deploy skipped — fix test first
