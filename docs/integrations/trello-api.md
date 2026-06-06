# Trello REST API

Implementation: `apps/server/src/services/trello-api.service.ts`

## Authentication

Every request adds the configured `TRELLO_API_KEY` and `TRELLO_TOKEN` as URL query parameters.

## Implemented Operations

| Operation | HTTP behavior |
|---|---|
| Create card | `POST /1/cards` |
| Rename card | `PUT /1/cards/{cardId}` |
| Update description | `PUT /1/cards/{cardId}` |
| Update due date | `PUT /1/cards/{cardId}` |
| Move card | `PUT /1/cards/{cardId}` |
| Archive card | `PUT /1/cards/{cardId}` with `closed: true` |
| Reopen card | `PUT /1/cards/{cardId}` with `closed: false` |
| Create comment | `POST /1/cards/{cardId}/actions/comments` |
| List board lists | `GET /1/boards/{boardId}/lists?filter=open` |

## Response Validation

Trello card, list, and comment action responses are parsed with Zod before being returned to sync services.

## Errors

Non-success HTTP responses throw an error containing the HTTP status. There are currently no request timeouts, retries, rate-limit handling, or typed Trello error bodies.
