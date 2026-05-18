# Trello Webhook Registration

Register the board webhook after `TRELLO_API_KEY` and `TRELLO_TOKEN` are set.

```bash
pnpm --filter server trello:register-webhook
```

Defaults used by the helper:

- `TRELLO_BOARD_ID=69fccdca1ade3ad28e81581b`
- `TRELLO_WEBHOOK_CALLBACK_URL=https://trello-linear-sync.onrender.com/webhooks/trello`

You can override either value in `apps/server/.env` or in the shell before running the command.

Equivalent curl:

```bash
curl -X POST \
"https://api.trello.com/1/tokens/$TRELLO_TOKEN/webhooks/?key=$TRELLO_API_KEY" \
-d "description=Trello Linear Sync" \
-d "callbackURL=https://trello-linear-sync.onrender.com/webhooks/trello" \
-d "idModel=69fccdca1ade3ad28e81581b"
```

Trello validates the callback with:

```bash
curl -I https://trello-linear-sync.onrender.com/webhooks/trello
```

Expected result: `HTTP 200`.
