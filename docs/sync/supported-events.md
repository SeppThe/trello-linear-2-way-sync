# Supported Events

Legend:

- **Supported**: implemented in the current source.
- **Partial**: some behavior exists, but important gaps remain.
- **Planned**: no complete sync behavior exists.

## Item Events

| Capability | Trello to Linear | Linear to Trello | Notes |
|---|---:|---:|---|
| Create item | Supported | Supported | Destination is created and mapped |
| Rename | Supported | Supported | |
| Description | Supported | Supported | Linear priority may be represented in Trello description |
| Due date | Supported | Supported | Supports clearing dates |
| Status/list | Supported | Supported | Uses source-code configuration |
| Archive | Supported | Supported | Trello delete is treated as archive in Linear |
| Reopen | Supported | Supported | |
| Multi-field update | Supported | Supported | Parsers may return multiple events |
| Priority | Partial | Partial | Trello uses labels, descriptions, and lists rather than a dedicated field |
| Labels | Planned | Planned | Label events are parsed on Trello but not executed |
| Members/assignees | Planned | Planned | |
| Attachments | Planned | Planned | |

## Comment Events

| Capability | Trello to Linear | Linear to Trello | Notes |
|---|---:|---:|---|
| Create comment | Supported | Supported | Comment mappings prevent already-mapped duplicates |
| Edit comment | Planned | Planned | |
| Delete comment | Planned | Planned | |

## Ignored Trello Events

The current parser explicitly ignores:

- Card position updates.
- Raw label-ID update events.
- Due-completion updates.
- Unsupported action types.

## Reliability Status

| Capability | Status |
|---|---|
| Item mapping uniqueness | Supported |
| Comment mapping uniqueness | Supported |
| Basic recent-source echo prevention | Supported |
| Persistent event ID deduplication | Planned |
| Retry with exponential backoff | Planned |
| Per-item locking | Planned |
| Queue processing | Planned |
| Automated tests | Planned |
