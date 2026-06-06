# Documentation

This directory is the source of truth for the current behavior, architecture, operation, and future direction of the Trello-Linear sync service.

## Start Here

- [Architecture Overview](architecture/overview.md)
- [End-to-End Data Flow](architecture/data-flow.md)
- [Sync Overview](sync/overview.md)
- [Supported Events](sync/supported-events.md)
- [Local Setup](development/setup.md)
- [Current Status](roadmap/current-status.md)
- [Roadmap](roadmap/roadmap.md)

## Architecture

- [Architecture Overview](architecture/overview.md)
- [Data Flow](architecture/data-flow.md)
- [Database Model](architecture/database.md)
- [ADR 0001: Command-Based Sync Pipeline](architecture/decisions/0001-command-based-sync.md)

## Synchronization

- [Sync Overview](sync/overview.md)
- [Trello to Linear](sync/trello-to-linear.md)
- [Linear to Trello](sync/linear-to-trello.md)
- [Field Mappings](sync/field-mappings.md)
- [Loop Prevention](sync/loop-prevention.md)
- [Supported Events](sync/supported-events.md)

## Integrations

- [Trello Webhooks](integrations/trello-webhooks.md)
- [Trello API](integrations/trello-api.md)
- [Linear Webhooks](integrations/linear-webhooks.md)
- [Linear API](integrations/linear-api.md)

## Development

- [Local Setup](development/setup.md)
- [Environment Variables](development/environment.md)
- [Testing Strategy](development/testing.md)
- [Adding a Sync Feature](development/adding-a-sync-feature.md)

## Operations

- [Deployment](operations/deployment.md)
- [Monitoring](operations/monitoring.md)
- [Troubleshooting](operations/troubleshooting.md)

## Roadmap

- [Current Status](roadmap/current-status.md)
- [Roadmap](roadmap/roadmap.md)

## Documentation Rules

- Describe implemented and planned behavior separately.
- Update [Supported Events](sync/supported-events.md) when adding or changing a sync feature.
- Add a sanitized webhook payload under `docs/examples/` when supporting a new event.
- Record significant architectural changes as an ADR under `docs/architecture/decisions/`.
- Update [Current Status](roadmap/current-status.md) before releases.
- Link to implementation files instead of duplicating large code sections.
