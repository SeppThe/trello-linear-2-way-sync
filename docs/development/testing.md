# Testing Strategy

## Current Status

There is currently no automated test framework or test suite in the repository. Type checking, builds, and focused Biome checks pass, but external behavior is not automatically verified.

## Recommended Test Layers

### Parser unit tests

Test JSON payload to parsed events:

```text
Trello JSON -> ParsedTrelloEvent[]
Linear JSON -> ParsedLinearEvent[]
```

Important cases:

- Create.
- Multi-field update.
- Archive and reopen.
- Comments.
- Missing required provider fields.
- Ignored events.

### Command-builder unit tests

Test parsed event to command:

```text
card.moved -> linear.issue.status_update
issue.created -> trello.card.create
```

Include status and priority mapping cases.

### Sync-service tests

Mock external API methods and repositories. Verify:

- Mapping checks happen before external writes.
- Correct API method and parameters are used.
- Cached records are updated.
- Echoes and already-mapped comments are skipped.
- Failures are handled as expected.

### Integration tests

Use a temporary PostgreSQL database and mocked Trello/Linear HTTP servers to verify full webhook-to-database flows.

### Manual provider tests

Use a test Trello board and Linear team for final verification of real webhook payloads and external API behavior.

## Suggested Test Files

```text
apps/server/src/parser/trello.test.ts
apps/server/src/parser/linear.test.ts
apps/server/src/sync/trello-sync-command.test.ts
apps/server/src/sync/linear-sync-command.test.ts
apps/server/src/services/trello.service.test.ts
apps/server/src/services/linear-webhook.service.test.ts
```

## Minimum Acceptance Matrix

Every supported row in [Supported Events](../sync/supported-events.md) should have:

- A parser test.
- A command-builder test.
- A service test for the destination write.
- A duplicate/echo behavior test where applicable.
