import { env } from "@Trello-Linear-2-way-sync/env/server";
import { z } from "zod";

const trelloCardUpdateResponseSchema = z.looseObject({
	id: z.string(),
	name: z.string().optional(),
	desc: z.string().optional(),
	due: z.string().nullable().optional(),
	idList: z.string().optional(),
	closed: z.boolean().optional(),
});

const trelloListSchema = z.looseObject({
	id: z.string(),
	name: z.string(),
});

const trelloCommentActionSchema = z.looseObject({
	id: z.string(),
	data: z
		.looseObject({
			text: z.string().optional(),
		})
		.optional(),
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

function getTrelloBoardId() {
	if (!env.TRELLO_BOARD_ID) {
		throw new Error("Missing TRELLO_BOARD_ID");
	}

	return env.TRELLO_BOARD_ID;
}

function createTrelloUrl(path: string) {
	const { apiKey, token } = getTrelloAuth();
	const url = new URL(`https://api.trello.com/1/${path}`);

	url.searchParams.set("key", apiKey);
	url.searchParams.set("token", token);

	return url;
}

async function updateTrelloCardFields(
	cardId: string,
	fields: {
		name?: string;
		desc?: string;
		due?: string | null;
		idList?: string;
		closed?: boolean;
	},
) {
	const url = createTrelloUrl(`cards/${cardId}`);

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(fields),
	});

	if (!response.ok) {
		throw new Error(`Trello card update failed with status ${response.status}`);
	}

	const payload = await response.json();
	return trelloCardUpdateResponseSchema.parse(payload);
}

export async function updateTrelloCardName(cardId: string, name: string) {
	return updateTrelloCardFields(cardId, { name });
}

export async function updateTrelloCardDescription(
	cardId: string,
	description?: string | null,
) {
	return updateTrelloCardFields(cardId, { desc: description ?? "" });
}

export async function updateTrelloCardDueDate(
	cardId: string,
	dueDate?: string | null,
) {
	return updateTrelloCardFields(cardId, { due: dueDate ?? null });
}

export async function moveTrelloCardToList(cardId: string, listId: string) {
	return updateTrelloCardFields(cardId, { idList: listId });
}

export async function archiveTrelloCard(cardId: string) {
	return updateTrelloCardFields(cardId, { closed: true });
}

export async function reopenTrelloCard(cardId: string) {
	return updateTrelloCardFields(cardId, { closed: false });
}

export async function createTrelloCard(input: {
	listId: string;
	name: string;
	description?: string | null;
	dueDate?: string | null;
}) {
	const url = createTrelloUrl("cards");

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			idList: input.listId,
			name: input.name,
			desc: input.description ?? "",
			due: input.dueDate ?? null,
		}),
	});

	if (!response.ok) {
		throw new Error(`Trello card create failed with status ${response.status}`);
	}

	const payload = await response.json();
	return trelloCardUpdateResponseSchema.parse(payload);
}

export async function createTrelloComment(cardId: string, text: string) {
	const url = createTrelloUrl(`cards/${cardId}/actions/comments`);

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ text }),
	});

	if (!response.ok) {
		throw new Error(
			`Trello comment create failed with status ${response.status}`,
		);
	}

	const payload = await response.json();
	return trelloCommentActionSchema.parse(payload);
}

export async function getTrelloBoardLists() {
	const boardId = getTrelloBoardId();
	const url = createTrelloUrl(`boards/${boardId}/lists`);

	url.searchParams.set("filter", "open");

	const response = await fetch(url, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Trello board lists request failed with status ${response.status}`,
		);
	}

	const payload = await response.json();
	return z.array(trelloListSchema).parse(payload);
}

export async function getTrelloListByName(listName: string) {
	const lists = await getTrelloBoardLists();
	const normalizedListName = listName.toLowerCase();

	return (
		lists.find((list) => list.name.toLowerCase() === normalizedListName) ?? null
	);
}
