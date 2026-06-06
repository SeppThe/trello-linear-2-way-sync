# Environment Variables

Copy `apps/server/.env.example` to `apps/server/.env`.

## Variables

| Variable | Required by schema | Required for full sync | Purpose |
|---|---:|---:|---|
| `DATABASE_URL` | Yes | Yes | PostgreSQL or Neon connection string |
| `LINEAR_API_KEY` | Yes | Yes | Linear GraphQL authentication |
| `LINEAR_TEAM_ID` | Yes | Yes | Team used for issue creation and state lookup |
| `LINEAR_WEBHOOK_SECRET` | No | Strongly recommended | Linear HMAC and replay-window verification |
| `TRELLO_API_KEY` | No | Yes | Trello REST authentication |
| `TRELLO_TOKEN` | No | Yes | Trello REST authentication |
| `TRELLO_BOARD_ID` | No | Yes | Board used for list lookup and card creation |
| `CORS_ORIGIN` | Yes | Yes | Allowed CORS origin URL |
| `NODE_ENV` | No | No | `development`, `production`, or `test` |
| `PORT` | No | No | Server port; defaults to `3000` |

## Example

```dotenv
DATABASE_URL=postgresql://user:password@host/database
LINEAR_API_KEY=lin_api_example
LINEAR_TEAM_ID=linear-team-id
LINEAR_WEBHOOK_SECRET=linear-webhook-secret
TRELLO_API_KEY=trello-api-key
TRELLO_TOKEN=trello-token
TRELLO_BOARD_ID=trello-board-id
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
PORT=3000
```

## Production Guidance

- Store secrets in the deployment platform's secret manager.
- Set `LINEAR_WEBHOOK_SECRET`; leaving it empty disables Linear request verification.
- Never commit real `.env` files.
- Treat Trello API tokens and Linear API keys as privileged credentials.
