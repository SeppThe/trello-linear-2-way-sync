import { env } from "@Trello-Linear-2-way-sync/env/server";
import { z } from "zod";

const trelloCardUpdateResponseSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
});

function getTrelloAuth() {
	if (!env.TRELLO_API_KEY || !env.TRELLO_TOKEN) {
		throw new Error("Missing TRELLO_API_KEY or TRELLO_TOKEN");
	}

	return {
		apiKey: env.TRELLO_API_KEY,
		token: env.TRELLO_TOKEN,
	};
}

export async function updateTrelloCardName(cardId: string, name: string) {
	const { apiKey, token } = getTrelloAuth();
	const url = new URL(`https://api.trello.com/1/cards/${cardId}`);

	url.searchParams.set("key", apiKey);
	url.searchParams.set("token", token);

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name }),
	});

	if (!response.ok) {
		throw new Error(`Trello card update failed with status ${response.status}`);
	}

	const payload = await response.json();
	return trelloCardUpdateResponseSchema.parse(payload);
}
