import { trelloWebhookSchema } from "@/schemas/trello";
import { Hono } from "hono";

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
		console.error("Invalid Trello webhook:", result.error);
		return c.json({ ok: false }, 400);
	}

	const body = result.data;
	const action = body.action;
	const card = action.data.card;

	console.log("Trello webhook received:", {
		actionId: action.id,
		actionType: action.type,
		cardId: card?.id,
		cardName: card?.name,
	});

	return c.json({ ok: true });
});

export default trelloRoutes;
