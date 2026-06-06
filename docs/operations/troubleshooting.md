# Troubleshooting

## A Webhook Does Not Arrive

Check:

1. The server is publicly reachable over HTTPS.
2. The webhook URL ends with `/webhooks/trello` or `/webhooks/linear`.
3. Server request logs show the provider request.
4. Linear webhook configuration includes the relevant issue or comment events.
5. Trello `HEAD /webhooks/trello` succeeds.

## Linear Returns `401`

Possible causes:

- `Linear-Signature` does not match `LINEAR_WEBHOOK_SECRET`.
- The server clock differs significantly from Linear.
- The payload timestamp is outside the 60-second replay window.

## An Update Is Skipped

Look for logs containing:

```text
No mapping found
Skipping ... echo
No Linear state mapping found
Configured Trello list was not found
```

Then inspect:

- `trello_linear_mappings`
- Cached `trello_cards` and `linear_issues`
- `last_sync_source` and `last_synced_at`
- Status mappings in `apps/server/src/sync/sync-config.ts`

## Duplicate Cards or Issues

Current creation handling checks mappings, but the destination item is created before the mapping is saved. Concurrent deliveries can race.

Recovery:

1. Choose the correct destination item.
2. Correct the item mapping in the database.
3. Archive or remove the duplicate.
4. Review logs around both create requests.

Permanent prevention requires persistent event idempotency and per-item locking.

## Comments Duplicate or Loop

Inspect `comment_mappings`. Each Trello action ID and Linear comment ID should be unique. A failed external write followed by a missing mapping write may still require manual cleanup.

## Status Does Not Move

Check:

- The Trello list exists and is open.
- The Linear state name exists for `LINEAR_TEAM_ID`.
- Mappings in `apps/server/src/sync/sync-config.ts` match exact intended names after normalization.

## API Authentication Errors

Verify:

- `LINEAR_API_KEY`
- `LINEAR_TEAM_ID`
- `TRELLO_API_KEY`
- `TRELLO_TOKEN`
- `TRELLO_BOARD_ID`

## Database Errors

Verify `DATABASE_URL`, database reachability, and applied migrations:

```bash
pnpm run db:migrate
```

## Useful Validation Commands

```bash
pnpm run check-types
pnpm run build
pnpm exec biome check apps/server/src packages/db/src packages/env/src
```
