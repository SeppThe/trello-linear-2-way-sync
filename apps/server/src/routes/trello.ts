import { Hono } from "hono";
import { trelloWebhookSchema, type TrelloWebhook } from "@/schemas/trello";
import type { ParsedTrelloEvent } from "@/types/types";

const trelloRoutes = new Hono();

export function parseTrelloEvent(payload: TrelloWebhook): ParsedTrelloEvent {
	const action = payload.action;
	const card = action?.data?.card;

	if (!action) {
		console.warn("Trello webhook payload does not contain an action.");
		return {
			type: "ignored",
			reason: "no action found",
		};
	}

	if (!card?.id || !card?.name) {
		return { type: "ignored", reason: "missing card id or name" };
	}

	if (action.type === "createCard") {
		return {
			type: "card.created",
			cardId: card.id,
			cardName: card.name,
		};
	}

	if (action.type === "updateCard" && typeof action.data?.old?.name === "string") {
		return {
			type: "card.renamed",
			cardId: card.id,
			cardName: card.name,
			previousName: action.data.old.name,
		};
	}

	if (
		action.type === "updateCard" &&
		typeof action.data?.old?.idList === "string"
	) {
		return {
			type: "card.moved",
			cardId: card.id,
			cardName: card.name,
			fromListId: action.data.old.idList,
			fromListName: action.data.listBefore?.name,
			toListId: action.data.listAfter?.id,
			toListName: action.data.listAfter?.name,
		};
	}

	if (action.type === "updateCard" && action.data?.old?.pos) {
		return {
			type: "ignored",
			reason: "position updated",
		};
	}

	return {
		type: "ignored",
		reason: `unhandled action type: ${action.type}`,
	};
}

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
