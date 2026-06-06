# ADR 0001: Command-Based Sync Pipeline

- Status: Accepted
- Date: 2026-06-06

## Context

Trello and Linear send different webhook JSON structures and use different API operations. Directly executing destination API calls from webhook routes would couple HTTP parsing, provider payloads, business rules, and side effects.

## Decision

The application uses a staged pipeline:

```text
provider JSON -> Zod schema -> parsed domain event -> sync command -> service execution
```

Parsers describe what happened. Command builders describe what should happen on the destination platform. Services execute commands and update persistence.

## Consequences

Benefits:

- External payload changes are isolated at schemas and parsers.
- Field mapping rules are visible in command builders.
- Services operate on narrow TypeScript unions.
- New events can be added incrementally.
- The service boundary can later move behind a queue.

Costs:

- Adding a feature touches several files.
- Event and command unions must stay synchronized.
- Without tests, missed wiring can compile but still behave incorrectly.

## Feature Change Checklist

Use [Adding a Sync Feature](../../development/adding-a-sync-feature.md) whenever extending this pipeline.
