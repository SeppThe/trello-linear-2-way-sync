# Database Model

The database package uses Drizzle ORM with PostgreSQL through the Neon serverless driver.

Implementation:

- Schema: `packages/db/src/schema/index.ts`
- Client: `packages/db/src/client.ts`
- Repositories: `packages/db/src/repositories/`
- Migrations: `packages/db/src/migrations/`

## Tables

### `trello_cards`

Caches the most recently known Trello card state used by sync decisions.

Important fields:

| Field | Purpose |
|---|---|
| `id` | Trello card ID |
| `board_id` | Trello board ID when available |
| `list_id`, `list_name` | Current Trello list |
| `name`, `description` | Card content |
| `due_date` | Card due date |
| `labels` | Cached Trello labels |
| `archived` | Trello closed/archive state |

### `linear_issues`

Caches the most recently known Linear issue state.

Important fields:

| Field | Purpose |
|---|---|
| `id` | Linear issue ID |
| `identifier` | Human-readable identifier such as `ENG-123` |
| `team_id` | Linear team ID |
| `title`, `description` | Issue content |
| `priority` | Normalized priority name |
| `due_date` | Linear due date |
| `state_name` | Current workflow state |
| `archived` | Linear archive state |

### `trello_linear_mappings`

Links one Trello card to one Linear issue.

| Field | Purpose |
|---|---|
| `trello_card_id` | Unique Trello card reference |
| `linear_issue_id` | Unique Linear issue reference |
| `last_sync_source` | Most recent source: `trello` or `linear` |
| `last_synced_at` | Timestamp used by echo prevention |

Both external IDs are unique to enforce one-to-one item mappings.

### `comment_mappings`

Links Trello comment actions to Linear comments.

| Field | Purpose |
|---|---|
| `trello_action_id` | Unique Trello comment action ID |
| `linear_comment_id` | Unique Linear comment ID |
| `trello_card_id` | Parent Trello card |
| `linear_issue_id` | Parent Linear issue |
| `source` | Platform that originated the comment |

## Repository Rule

Database access belongs in `packages/db/src/repositories/`. Routes and parsers must not contain raw Drizzle queries.

## Planned Database Work

Production hardening should add:

- A `sync_events` or `sync_logs` table for event-level idempotency and audit history.
- Attempt counts and final error details.
- Persistent field fingerprints for stronger loop prevention.
- A lock or job table if PostgreSQL is used for per-item sequential processing.
