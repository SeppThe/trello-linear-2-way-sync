import { Hono } from "hono";
import { handleTrelloWebhook } from "../services/trello.service";
import type { TrelloWebhookPayload } from "../types/trello";

const trelloRoutes = new Hono();

trelloRoutes.on("HEAD", "/", (c) => {
	return c.text("ok");
});

trelloRoutes.get("/", (c) => {
	return c.text("Trello webhook route works");
});
trelloRoutes.post("/", async (c) => {
	const body = (await c.req.json()) as TrelloWebhookPayload;
	const action = body.action;
	const card = action?.data?.card;

	console.log("Received Trello webhook:", {
		actionType: action?.type,
		actionId: action?.id,
		cardId: card?.id,
		cardName: card?.name,
	});

	handleTrelloWebhook(body).catch((error: unknown) => {
		console.error("Failed to handle Trello webhook:", error);
	});

	return c.json({ ok: true });
});

export default trelloRoutes;
