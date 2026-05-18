# Trello ↔ Linear Bidirectional Sync Integration

## Technical Design & Implementation Document

---

# 1. Project Overview

This project builds a bidirectional synchronization system between:

- Trello (task management tool using boards & cards)
- Linear (engineering issue tracking system)

## Goal

Enable real-time or near-real-time synchronization of issues/cards between both systems so that:

- A Trello card ↔ Linear issue remain linked
- Updates in one system reflect in the other
- Both systems can be used interchangeably as interfaces to the same work items

---

# 2. System Architecture

## 2.1 High-Level Architecture

```text
Trello Webhooks ─┐
                 │
                 ▼
      Sync Backend (Better Stack Builder)
                 │
        ┌────────┴────────┐
        ▼                 ▼
   Linear API      Mapping Database
        ▲                 ▲
        └──── Linear Webhooks ────┘
```

## 2.2 Core Components
    1. Sync Backend (Brain of system)

        Built using Better Stack Builder (Node.js + TypeScript)

        Handles:

        webhook ingestion
        transformation logic
        API calls
        deduplication
    2. Mapping Database

        Stores relationships between systems.

        Example schema:

        trello_linear_map
        -----------------
        id
        trello_card_id
        linear_issue_id
        last_sync_source
        created_at
        updated_at
    3. Queue System (recommended)

        Prevents race conditions and API overload.

        Options:

        BullMQ (Redis-based)
        Upstash Redis (serverless-friendly)
# 3. Tech Stack
    Backend
    Better Stack Builder (starter framework)
    Node.js
    TypeScript
    Database
    PostgreSQL (recommended via Supabase or Neon)
    Queue / Async processing
    Redis (Upstash or self-hosted)
    BullMQ
    API Tools
    Trello REST API
    Linear GraphQL API
    Dev Tools
    Postman / Insomnia (API testing)
    ngrok (local webhook testing)
    Zod (schema validation)
    Pino / Winston (logging)
# 4. Sync Flow Design
## 4.1 Trello → Linear
    Trello webhook triggers
    Backend receives event
    Validate payload
    Check mapping DB:
    If no mapping → create Linear issue
    If exists → update issue
    Save/update mapping
## 4.2 Linear → Trello
    Linear webhook triggers
    Backend receives event
    Lookup Trello card in mapping DB
    Update Trello card
    Prevent loop execution
# 5. Loop Prevention System
    Problem

    Bidirectional sync can create infinite loops:

    Trello update → Linear update → Trello update → ...
    Solution: Source tagging

    When updating via API:

    {
    "source": "trello-sync"
    }
    Rules
    Ignore events originating from same source
    Store last_sync_source in DB
# 6. Field Mapping Strategy
    Trello Field	Linear Field
    Card Title	Issue Title
    Description	Description
    List	Status
    Labels	Labels
    Members	Assignees
    Due Date	Target Date
## 6.1 Status Mapping Config
    {
    "To Do": "Backlog",
    "Doing": "In Progress",
    "Done": "Done"
    }
# 7. API Integration
## 7.1 Trello API
    REST API
    Auth: API key + token
    Supports webhooks per board
## 7.2 Linear API
    GraphQL API
    Requires API key or OAuth app
    Supports webhooks for issue events
# 8. Backend Endpoints
    POST /webhooks/trello
    POST /webhooks/linear
    Responsibilities
    Validate webhook signature
    Normalize payload
    Push to queue
    Trigger sync logic
# 9. Database Design
## 9.1 Core Mapping Table
    CREATE TABLE trello_linear_map (
    id SERIAL PRIMARY KEY,
    trello_card_id TEXT UNIQUE,
    linear_issue_id TEXT UNIQUE,
    last_sync_source TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
    );
## 9.2 Optional Extensions
    sync_logs (debugging)
    failed_jobs
    field_mappings
    user_project_settings
# 10. Sync Engine Logic
    Core Rules
    Create Flow
    If mapping doesn’t exist → create counterpart
    Update Flow
    If mapping exists → update counterpart
    Ignore Flow
    If event source == last_sync_source → ignore
# 11. Rate Limiting Strategy

    Both APIs enforce limits.

    Solution
    Queue all webhook events
    Process sequentially or batched
    Retry failed requests with exponential backoff
# 12. Observability & Monitoring
    Tools
    Better Stack Logging (primary)
    Sentry (error tracking)
    PostHog (optional analytics)
    Track
    sync failures
    duplicate events
    API latency
    webhook frequency
# 13. Local Development Setup
    Tools
    ngrok (webhook tunneling)
    Postman (API testing)
    local Postgres (or Supabase dev project)
# 14. Deployment Options
    Recommended
    Fly.io (best for backend webhook services)
    Render (simple deployment)
    Railway (fast setup)
    Better Stack hosting (if used end-to-end)
# 15. Recommended Build Phases
    Phase 1 — MVP
    Trello → Linear sync
    Linear → Trello sync
    basic mapping DB
    webhook endpoints
    Phase 2 — Stability
    loop prevention
    queue system
    status mapping
    logging system
    Phase 3 — Advanced Features
    comment sync
    attachments sync
    multi-board / multi-project support
    admin dashboard
# 16. Key Engineering Risks
    Infinite sync loops
    API rate limiting
    inconsistent state between systems
    webhook duplication
    field mismatch complexity (especially status)
# 17. Recommended Stack Summary
    Backend: Better Stack Builder (Node.js + TypeScript)
    DB: PostgreSQL (Supabase / Neon)
    Queue: BullMQ or Upstash Redis
    APIs: Trello REST + Linear GraphQL
    Observability: Better Stack + Sentry
    Dev tools: ngrok, Postman, Zod
# 18. Better Stack Project Bootstrap Command
    pnpm create better-t-stack@latest linear-trello-2-way-sync \
    --frontend none \
    --backend hono \
    --runtime node \
    --api none \
    --auth none \
    --payments none \
    --database postgres \
    --orm drizzle \
    --db-setup neon \
    --package-manager pnpm \
    --git \
    --web-deploy none \
    --server-deploy none \
    --install \
    --addons biome turborepo \
    --examples none
# 19. GraphQL Learning Resource
    https://www.apollographql.com/blog/the-basics-of-graphql-in-5-links-9e1dc4cac055