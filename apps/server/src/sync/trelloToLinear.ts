import { getMappingByTrelloCardId } from "@Trello-Linear-2-way-sync/db/repositories/mapping";
import type { ParsedTrelloEvent } from "../types/trello";

export async function handleTrelloToLinearEvent(
	event: ParsedTrelloEvent,
): Promise<void> {
	if (!event.cardId) {
		console.log("Trello event has no card id; skipping sync", {
			actionType: event.normalizedType,
			actionId: event.actionId,
		});
		return;
	}

	if (event.normalizedType === "createCard") {
		const mapping = await getMappingByTrelloCardId(event.cardId);

		if (mapping) {
			console.log("Trello card already mapped; skipping createCard duplicate", {
				trelloCardId: event.cardId,
				linearIssueId: mapping.linearIssueId,
			});
			return;
		}

		console.log("Trello createCard ready for Linear issue creation", {
			trelloCardId: event.cardId,
			cardName: event.cardName,
		});
		return;
	}

	if (event.normalizedType === "updateCard") {
		const mapping = await getMappingByTrelloCardId(event.cardId);

		if (!mapping) {
			console.log("No mapping found for Trello updateCard event", {
				trelloCardId: event.cardId,
				cardName: event.cardName,
			});
			return;
		}

		console.log("Trello updateCard ready for Linear issue update", {
			trelloCardId: event.cardId,
			linearIssueId: mapping.linearIssueId,
			cardName: event.cardName,
		});
		return;
	}

	console.log("Trello action parsed but not synced in MVP yet", {
		actionType: event.normalizedType,
		actionId: event.actionId,
		trelloCardId: event.cardId,
	});
}
