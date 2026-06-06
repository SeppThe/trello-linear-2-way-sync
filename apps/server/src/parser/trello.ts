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

function hasOldField(old: Record<string, unknown> | undefined, field: string) {
	return old ? Object.hasOwn(old, field) : false;
}

export function parseTrelloEvents(payload: TrelloWebhook): ParsedTrelloEvent[] {
	const action = payload.action;
	const data = action?.data;
	const card = data?.card;
	const old = data?.old;

	if (!action) {
		console.warn("Trello webhook payload does not contain an action.");
		return [{ type: "ignored", reason: "no action found" }];
	}

	if (action.type === "deleteCard") {
		if (!card?.id) {
			return [{ type: "ignored", reason: "deleted card is missing card id" }];
		}

		return [
			{
				type: "card.deleted",
				cardId: card.id,
			},
		];
	}

	if (!card?.id || !card?.name) {
		return [{ type: "ignored", reason: "missing card id or name" }];
	}

	if (action.type === "createCard") {
		return [
			{
				type: "card.created",
				cardId: card.id,
				cardName: card.name,
				description: card.desc,
				dueDate: card.due,
				labels: card.labels
					?.map(parseTrelloLabel)
					.filter((label) => label !== null),
				listId: action.data?.list?.id ?? card.idList,
				listName: action.data?.list?.name,
			},
		];
	}

	if (action.type === "commentCard" && typeof action.data?.text === "string") {
		if (!action.id) {
			return [{ type: "ignored", reason: "comment is missing action id" }];
		}

		return [
			{
				type: "card.commented",
				cardId: card.id,
				cardName: card.name,
				commentText: action.data.text,
				trelloActionId: action.id,
				authorName: action.memberCreator?.fullName,
				authorUsername: action.memberCreator?.username,
			},
		];
	}

	if (action.type === "addLabelToCard" && action.data?.label) {
		const label = parseTrelloLabel(action.data.label);

		if (!label) {
			return [
				{
					type: "ignored",
					reason: "added label is missing label id",
				},
			];
		}

		return [
			{
				type: "card.label_added",
				cardId: card.id,
				cardName: card.name,
				label,
			},
		];
	}

	if (action.type === "removeLabelFromCard" && action.data?.label) {
		const label = parseTrelloLabel(action.data.label);

		if (!label) {
			return [
				{
					type: "ignored",
					reason: "removed label is missing label id",
				},
			];
		}

		return [
			{
				type: "card.label_removed",
				cardId: card.id,
				cardName: card.name,
				label,
			},
		];
	}

	if (action.type === "updateCard") {
		const events: ParsedTrelloEvent[] = [];
		let archiveEvent: ParsedTrelloEvent | undefined;

		if (typeof old?.closed === "boolean") {
			archiveEvent =
				typeof card.closed === "boolean"
					? {
							type: "card.archive_status_changed",
							cardId: card.id,
							cardName: card.name,
							archived: card.closed,
							previousArchived: old.closed,
						}
					: {
							type: "ignored",
							reason: "archive status update is missing current closed value",
						};

			if (
				archiveEvent.type === "card.archive_status_changed" &&
				!archiveEvent.archived
			) {
				events.push(archiveEvent);
				archiveEvent = undefined;
			}
		}

		if (typeof old?.name === "string") {
			events.push({
				type: "card.renamed",
				cardId: card.id,
				cardName: card.name,
				previousName: old.name,
			});
		}

		if (typeof old?.desc === "string") {
			events.push({
				type: "card.description_changed",
				cardId: card.id,
				cardName: card.name,
				description: card.desc,
				previousDescription: old.desc,
			});
		}

		if (typeof old?.idList === "string") {
			events.push({
				type: "card.moved",
				cardId: card.id,
				cardName: card.name,
				fromListId: old.idList,
				fromListName: data?.listBefore?.name,
				toListId: data?.listAfter?.id,
				toListName: data?.listAfter?.name,
			});
		}

		if (typeof old?.due === "string" || old?.due === null) {
			events.push({
				type: "card.due_date_changed",
				cardId: card.id,
				cardName: card.name,
				dueDate: card.due,
				previousDueDate: old.due,
			});
		}

		if (archiveEvent) {
			events.push(archiveEvent);
		}

		if (events.length > 0) {
			return events;
		}

		if (hasOldField(old, "pos")) {
			return [{ type: "ignored", reason: "position updated" }];
		}

		if (hasOldField(old, "idLabels")) {
			return [{ type: "ignored", reason: "label ids updated" }];
		}

		if (typeof old?.dueComplete === "boolean") {
			return [{ type: "ignored", reason: "due completion updated" }];
		}
	}

	return [
		{
			type: "ignored",
			reason: `unhandled action type: ${action.type}`,
		},
	];
}
