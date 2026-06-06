# Linear Webhooks

## Endpoint

```text
POST /webhooks/linear
```

Implementation: `apps/server/src/routes/linear.ts`

## Request Verification

When `LINEAR_WEBHOOK_SECRET` is configured:

1. The route reads the raw request body.
2. It computes an HMAC SHA-256 signature.
3. It compares the result with `Linear-Signature` using `timingSafeEqual`.
4. It requires `webhookTimestamp` to be within 60 seconds of the server time.

When the secret is not configured, both checks are disabled.

## Processing

```text
raw body
-> signature check
-> JSON.parse
-> linearWebhookSchema
-> parseLinearEvents
-> handleLinearWebhook
```

The parser supports issue and comment resources. A Linear issue update can produce several parsed events.

## Useful Headers

| Header | Use |
|---|---|
| `Linear-Signature` | Request signature |
| `Linear-Delivery` | Delivery identifier used in logs |
| `Linear-Event` | Event category used in logs |

The delivery and webhook IDs are currently logged but not persistently deduplicated.

## Example Payloads

- [Issue created](../examples/linear/issue-created.json)
- [Issue updated](../examples/linear/issue-updated.json)

## Error Responses

- Invalid signatures and stale signed payloads return HTTP `401`.
- Invalid JSON and schema failures are logged and return `{ "ok": true }`.
- Sync command failures are logged and return `{ "ok": true }`.
