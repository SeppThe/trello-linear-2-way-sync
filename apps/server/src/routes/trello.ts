import { Hono } from "hono";
import { parseTrelloEvent } from "@/parser/trello";
import { trelloWebhookSchema } from "@/schemas/trello";

const trelloRoutes = new Hono();

trelloRoutes.on("HEAD", "/", (c) => {
	return c.text("ok");
});

trelloRoutes.get("/", (c) => {
	return c.text("Trello webhook route works");
});
trelloRoutes.post("/", async (c) => {
	const rawBody = await c.req.json();
	const result = trelloWebhookSchema.safeParse(rawBody);

	if (!result.success) {
		console.error("Invalid Trello webhook:", result.error.issues);
		return c.json({ ok: true });
	}

	const body = result.data;
	const action = body.action;
	const card = action?.data?.card;

	console.log("Trello webhook received:", {
		actionId: action?.id,
		actionType: action?.type,
		cardId: card?.id,
		cardName: card?.name,
		old: action?.data?.old,
		listBefore: action?.data?.listBefore,
		listAfter: action?.data?.listAfter,
	});

	const eventType = parseTrelloEvent(body);
	if (eventType) {
		console.log("Processing Trello event:", eventType);
	}

	return c.json({ ok: true });
});

export default trelloRoutes;
