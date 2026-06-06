import { Hono } from "hono";
import { parseTrelloEvents } from "@/parser/trello";
import { trelloWebhookSchema } from "@/schemas/trello";
import { handleTrelloWebhook } from "@/services/trello.service";

const trelloRoutes = new Hono();

trelloRoutes.on("HEAD", "/", (c) => {
	return c.text("ok");
});

trelloRoutes.get("/", (c) => {
	return c.text("Trello webhook route works");
});
trelloRoutes.post("/", async (c) => {
	let rawBody: unknown;

	try {
		rawBody = await c.req.json();
	} catch (error) {
		console.error("Invalid Trello webhook JSON:", error);
		return c.json({ ok: true });
	}

	const result = trelloWebhookSchema.safeParse(rawBody);

	if (!result.success) {
		console.error("Invalid Trello webhook:", result.error.issues);
		return c.json({ ok: true });
	}

	const body = result.data;
	const action = body.action;
	const card = action?.data?.card;
	const listName = action?.data?.list?.name;

	console.log("Trello webhook received:", {
		actionId: action?.id,
		actionType: action?.type,
		cardId: card?.id,
		cardName: card?.name,
		old: action?.data?.old,
		listBefore: action?.data?.listBefore,
		listAfter: action?.data?.listAfter,
		listName: listName,
		commentText: action?.data?.text,
		memberCreator: action?.memberCreator,
	});

	const events = parseTrelloEvents(body);
	console.log("Parsed Trello events:", events);
	await handleTrelloWebhook(events);

	return c.json({ ok: true });
});

export default trelloRoutes;
