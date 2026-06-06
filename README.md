# Trello-Linear Two-Way Sync

A TypeScript service that keeps Trello cards and Linear issues synchronized through webhooks.

The service receives JSON webhook payloads from Trello and Linear, validates and normalizes them, converts them into internal sync commands, writes changes to the opposite platform, and stores local item and comment mappings in PostgreSQL.

## Current Capabilities

| Capability | Trello to Linear | Linear to Trello |
|---|---:|---:|
| Create item | Supported | Supported |
| Rename | Supported | Supported |
| Description | Supported | Supported |
| Due date | Supported | Supported |
| List / workflow state | Supported | Supported |
| Archive and reopen | Supported | Supported |
| Comments | Supported | Supported |
| Priority | Parsed from Trello conventions | Written into Trello descriptions |
| Multiple fields in one webhook | Supported | Supported |

Labels, members/assignees, attachments, multi-board configuration, persistent event deduplication, retries, queues, and an admin dashboard are not yet implemented.

## How It Works

```text
Webhook JSON
  -> Hono route
  -> Zod schema validation
  -> normalized domain event
  -> sync command
  -> mapping and echo checks
  -> Trello REST or Linear GraphQL API
  -> PostgreSQL cache and mapping update
```

See the [documentation index](docs/README.md) for architecture, complete sync flows, examples, setup, operations, and the roadmap.

## Quick Start

Requirements:

- Node.js
- pnpm
- PostgreSQL or Neon database
- Linear API key and team ID
- Trello API key, token, and board ID

```bash
pnpm install
cp apps/server/.env.example apps/server/.env
pnpm run db:migrate
pnpm run dev
```

The server starts on `http://localhost:3000` by default.

Configure webhook targets:

```text
Trello: <public-server-url>/webhooks/trello
Linear: <public-server-url>/webhooks/linear
```

For full setup instructions, see [Local Setup](docs/development/setup.md).

## Repository Structure

```text
apps/server/       Hono webhook server and sync logic
packages/db/       Drizzle schema, migrations, and repositories
packages/env/      Typed environment validation
packages/config/   Shared TypeScript configuration
docs/              Project documentation
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm run dev` | Start development tasks |
| `pnpm run dev:server` | Start only the server |
| `pnpm run build` | Build the project |
| `pnpm run check-types` | Check TypeScript contracts |
| `pnpm run check` | Run Biome with fixes |
| `pnpm run db:push` | Push the current schema |
| `pnpm run db:generate` | Generate a Drizzle migration |
| `pnpm run db:migrate` | Apply migrations |
| `pnpm run db:studio` | Open Drizzle Studio |

## Project Status

The core two-way sync behavior is substantially implemented, but production hardening remains. There are currently no automated tests, persistent webhook event records, queue, retry system, or per-item lock.

See [Current Status](docs/roadmap/current-status.md) and [Roadmap](docs/roadmap/roadmap.md).
