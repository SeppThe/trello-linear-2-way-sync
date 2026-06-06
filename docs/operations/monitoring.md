# Monitoring

## Current Observability

The server uses Hono request logging and `console.log`, `console.warn`, and `console.error` throughout webhook and sync processing.

Logs commonly include:

- Command type.
- Trello card ID.
- Linear issue ID and identifier.
- Trello action ID.
- Linear comment ID.
- Mapping and echo decisions.
- External API failures.

## What Operators Should Monitor

| Signal | Why it matters |
|---|---|
| Webhook request volume | Detect missing or excessive deliveries |
| Sync command failures | Find unsynchronized items |
| Missing mappings | Identify unsupported or inconsistent flows |
| Echo skips | Detect loops or overly aggressive suppression |
| External API status errors | Detect auth, rate-limit, or outage problems |
| Duplicate-create symptoms | Detect race conditions |
| Database failures | Protect mapping consistency |

## Recommended Structured Log Fields

```text
source
event_type
command_type
external_event_id
trello_card_id
linear_issue_id
trello_action_id
linear_comment_id
mapping_id
status
duration_ms
error_message
```

## Planned Monitoring Improvements

- Structured logger.
- Persistent `sync_events` records.
- Error tracking such as Sentry.
- Metrics for latency, failures, retries, and duplicates.
- Alerts for final failures and repeated missing mappings.
- Correlation IDs spanning route, command, API write, and database update.
