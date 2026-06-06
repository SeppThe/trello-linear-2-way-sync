# Roadmap

## Guiding Principle

Finish and verify the current core two-way sync before expanding product breadth.

## Phase 1: Verify Core Sync

Goal: prove the implemented behavior.

- Add a test framework.
- Add parser and command-builder tests.
- Add mocked sync-service tests.
- Verify create, update, archive, reopen, comments, priority, and multi-field updates.
- Verify real Trello and Linear webhook payloads.
- Explicitly apply the mapped Linear state during Trello-originated issue creation.

Completion: every supported event has automated coverage and a manual real-provider verification result.

## Phase 2: Persistent Idempotency

Goal: never process the same external event twice.

- Add a `sync_events` table.
- Persist Trello action IDs and Linear webhook/delivery IDs.
- Add deterministic fingerprints when IDs are unavailable.
- Record `processing`, `completed`, `failed`, and `ignored` states.
- Check idempotency before any external write.

Completion: replaying a webhook cannot repeat a destination write.

## Phase 3: Reliable Processing

Goal: make failures recoverable.

- Stop swallowing retryable errors.
- Add request timeouts.
- Add retry classification.
- Add exponential backoff and maximum attempts.
- Store final failures.
- Add manual retry tooling.

Completion: transient failures recover automatically and final failures remain visible.

## Phase 4: Concurrency and Strong Loop Prevention

Goal: handle simultaneous and delayed events safely.

- Add per-item locks or queue grouping.
- Process one mapped item sequentially.
- Store field fingerprints and completed sync metadata.
- Replace timing-only echo decisions.
- Define conflict resolution behavior.

Completion: concurrent webhooks do not create duplicates, loops, or stale overwrites.

## Phase 5: Security and Operations

Goal: prepare for production traffic.

- Add Trello webhook origin verification.
- Require Linear webhook secrets in production.
- Add structured logging and metrics.
- Add health/readiness checks.
- Add CI and deployment configuration.
- Add alerts and operational runbooks.

Completion: the service can be safely deployed, observed, and maintained.

## Phase 6: Product Expansion

- Label synchronization.
- Member/assignee synchronization.
- Attachment synchronization.
- Multi-board and multi-project configuration.
- Configurable mappings outside source code.
- Admin dashboard.
- Reconciliation and history views.

Completion: product scope is configurable and manageable beyond one board/team pair.
