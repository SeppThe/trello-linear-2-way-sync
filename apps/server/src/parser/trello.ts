import type { TrelloWebhook } from "@/schemas/trello";
import type { ParsedTrelloEvent, TrelloLabel } from "@/types/types";

function parseTrelloLabel(label: {
	id?: string;
	name?: string;
	color?: string | null;
}): TrelloLabel | null {
	if (!label.id) {
		return null;
	}

	return {
		id: label.id,
		name: label.name,
		color: label.color,
	};
}

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

	if (action.type === "deleteCard") {
		if (!card?.id) {
			return { type: "ignored", reason: "deleted card is missing card id" };
		}

		return {
			type: "card.deleted",
			cardId: card.id,
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
			description: card.desc,
			dueDate: card.due,
			labels: card.labels
				?.map(parseTrelloLabel)
				.filter((label) => label !== null),
		};
	}

	if (
		action.type === "updateCard" &&
		typeof action.data?.old?.name === "string"
	) {
		return {
			type: "card.renamed",
			cardId: card.id,
			cardName: card.name,
			previousName: action.data.old.name,
		};
	}

	if (
		action.type === "updateCard" &&
		typeof action.data?.old?.desc === "string"
	) {
		return {
			type: "card.description_changed",
			cardId: card.id,
			cardName: card.name,
			description: card.desc,
			previousDescription: action.data.old.desc,
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

	if (
		action.type === "updateCard" &&
		(typeof action.data?.old?.due === "string" ||
			action.data?.old?.due === null)
	) {
		return {
			type: "card.due_date_changed",
			cardId: card.id,
			cardName: card.name,
			dueDate: card.due,
			previousDueDate: action.data.old.due,
		};
	}

	if (action.type === "addLabelToCard" && action.data?.label) {
		const label = parseTrelloLabel(action.data.label);

		if (!label) {
			return { type: "ignored", reason: "added label is missing label id" };
		}

		return {
			type: "card.label_added",
			cardId: card.id,
			cardName: card.name,
			label,
		};
	}

	if (action.type === "removeLabelFromCard" && action.data?.label) {
		const label = parseTrelloLabel(action.data.label);

		if (!label) {
			return { type: "ignored", reason: "removed label is missing label id" };
		}

		return {
			type: "card.label_removed",
			cardId: card.id,
			cardName: card.name,
			label,
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
