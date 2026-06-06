# Local Setup

## Requirements

- Node.js
- pnpm `10.x`
- PostgreSQL-compatible database, such as Neon
- Linear API key and team ID
- Trello API key, token, and board ID
- A public HTTPS tunnel or deployed URL for receiving webhooks

## Install

```bash
pnpm install
cp apps/server/.env.example apps/server/.env
```

Fill in `apps/server/.env`. See [Environment Variables](environment.md).

## Database

Apply committed migrations:

```bash
pnpm run db:migrate
```

During local schema development, `pnpm run db:push` can push the current Drizzle schema directly.

Generate migrations after intentional schema changes:

```bash
pnpm run db:generate
```

## Start the Server

```bash
pnpm run dev:server
```

The default address is:

```text
http://localhost:3000
```

Check:

```text
GET /                    -> OK
GET /webhooks/trello     -> Trello webhook route works
HEAD /webhooks/trello    -> ok
```

## Configure Webhooks

Expose the server using a public HTTPS URL, then configure:

```text
Trello callback: https://your-host/webhooks/trello
Linear callback: https://your-host/webhooks/linear
```

Configure Linear to send issue and comment events used by the service.

## Validate Changes

```bash
pnpm run check-types
pnpm run build
pnpm exec biome check apps/server/src packages/db/src packages/env/src
```

The repository currently has no automated test suite.

## First Manual Verification

1. Create a Trello card and confirm a Linear issue and mapping are created.
2. Rename the Linear issue and confirm Trello changes.
3. Move the Trello card and confirm Linear state changes.
4. Change Linear description, due date, and priority together.
5. Add comments in both directions.
6. Archive and reopen in both directions.
7. Inspect server logs and database mappings after each action.
