# Trello Webhooks

## Endpoint

```text
HEAD /webhooks/trello
GET  /webhooks/trello
POST /webhooks/trello
```

- `HEAD` responds with `ok` for Trello webhook callback verification.
- `GET` is a simple route check.
- `POST` receives webhook JSON.

Implementation: `apps/server/src/routes/trello.ts`

## Processing

```text
JSON body
-> trelloWebhookSchema
-> parseTrelloEvents
-> handleTrelloWebhook
```

The route currently returns `{ "ok": true }` for invalid JSON, invalid payloads, and sync-service failures after logging the problem.

## Payload Validation

The Zod schema accepts a loose Trello webhook shape and reads:

- Action ID, type, and date.
- Card ID, name, description, due date, closed state, labels, and list ID.
- Old values for update detection.
- Current, previous, and next lists.
- Comment text.
- Comment creator details.

Implementation: `apps/server/src/schemas/trello.ts`

## Example Payloads

- [Card created](../examples/trello/card-created.json)
- [Card updated](../examples/trello/card-updated.json)

## Security Status

Trello webhook signature validation is not implemented. The endpoint must be treated as publicly reachable and untrusted. Payloads are shape-validated, but origin is not verified.

## Adding Event Support

Follow [Adding a Sync Feature](../development/adding-a-sync-feature.md) and update [Supported Events](../sync/supported-events.md).
