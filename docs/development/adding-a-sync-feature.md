# Adding a Sync Feature

Use this workflow whenever adding a new synchronized event or field.

## Implementation Checklist

- [ ] Capture and sanitize a real source webhook JSON example.
- [ ] Add required fields to the source Zod schema.
- [ ] Add or extend the parsed event union in `apps/server/src/types/types.ts`.
- [ ] Parse the source payload in `apps/server/src/parser/`.
- [ ] Add or extend the destination command union.
- [ ] Build the destination command in `apps/server/src/sync/`.
- [ ] Add mapping configuration when needed.
- [ ] Add the destination API operation in `apps/server/src/services/linear.service.ts` or `trello-api.service.ts`.
- [ ] Execute the command in the appropriate webhook service.
- [ ] Update local cached source and destination records.
- [ ] Add mapping or idempotency behavior.
- [ ] Add echo-prevention behavior.
- [ ] Add parser, command, and service tests.
- [ ] Update `docs/sync/supported-events.md`.
- [ ] Update the relevant direction-specific sync document.
- [ ] Add the sanitized payload under `docs/examples/`.

## Trello-Originated Feature Path

```text
schemas/trello.ts
-> parser/trello.ts
-> types/types.ts
-> sync/trello-sync-command.ts
-> services/trello.service.ts
-> services/linear.service.ts
-> packages/db when persistence changes
```

## Linear-Originated Feature Path

```text
schemas/linear.ts
-> parser/linear.ts
-> types/types.ts
-> sync/linear-sync-command.ts
-> services/linear-webhook.service.ts
-> services/trello-api.service.ts
-> packages/db when persistence changes
```

## Completion Definition

A feature is complete only when:

- Both valid and invalid source payloads are handled.
- The destination API write is implemented.
- Mapping and local cache state remain consistent.
- Echo behavior is defined.
- Tests cover the flow.
- Documentation and examples are updated.
