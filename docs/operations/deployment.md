# Deployment

## Current Status

The repository builds a Node.js server but does not currently include provider-specific deployment configuration, container files, or CI/CD workflows.

## Build and Start

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm --filter server start
```

The built server entry is `apps/server/dist/index.mjs`.

## Required Infrastructure

- A public HTTPS Node.js hosting environment.
- A reachable PostgreSQL or Neon database.
- Environment variables listed in [Environment Variables](../development/environment.md).
- Trello and Linear webhooks configured to target the deployed URL.

## Deployment Sequence

1. Provision the database.
2. Configure secrets and environment variables.
3. Apply database migrations with `pnpm run db:migrate`.
4. Build and start the server.
5. Confirm `GET /` responds with `OK`.
6. Configure Trello and Linear webhook URLs.
7. Verify Linear signature checks are enabled.
8. Run the manual sync verification matrix.

## Recommended Production Checks

```bash
pnpm run check-types
pnpm run build
pnpm exec biome check apps/server/src packages/db/src packages/env/src
```

## Current Production Risks

- Trello webhook origin is not verified.
- Sync failures are logged but return successful webhook responses.
- No durable event deduplication or retries.
- No queue or per-item locking.
- No automated tests or CI.
- No readiness endpoint separate from the root health response.

Do not treat deployment alone as production readiness. Complete the stability roadmap first for important workloads.
