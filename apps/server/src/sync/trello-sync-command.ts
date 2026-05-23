import type { ParsedTrelloEvent, SyncCommand } from "@/types/types";

export function buildSyncCommand(event: ParsedTrelloEvent): SyncCommand {
	if (event.type === "card.created") {
		return {
			type: "linear.issue.create",
			trelloCardId: event.cardId,
			title: event.cardName,
			description: event.description,
			dueDate: event.dueDate,
			labels: event.labels
				?.map((label) => label.name || "")
				.filter((name) => name !== ""),
			priority: parsePriority(event.description),
			listId: event.listId,
			listName: event.listName,
		};
	}

	if (event.type === "card.moved") {
		return {
			type: "linear.issue.status_update",
			trelloCardId: event.cardId,
			fromListId: event.fromListId,
			fromListName: event.fromListName,
			toListId: event.toListId,
			toListName: event.toListName,
		};
	}

	if (event.type === "card.deleted") {
		return {
			type: "linear.issue.close",
			trelloCardId: event.cardId,
		};
	}

	if (event.type === "card.description_changed") {
		return {
			type: "linear.issue.description_update",
			trelloCardId: event.cardId,
			description: event.description,
		};
	}
	if (event.type === "card.due_date_changed") {
		return {
			type: "linear.issue.due_date_update",
			trelloCardId: event.cardId,
			dueDate: event.dueDate,
		};
	}
	if (event.type === "card.renamed") {
		return {
			type: "linear.issue.renamed",
			trelloCardId: event.cardId,
			title: event.cardName,
			previousTitle: event.previousName,
		};
	}
	if (event.type === "ignored") {
		return {
			type: "noop",
			reason: event.reason,
		};
	}

	return {
		type: "noop",
		reason: `No sync command defined for event type ${event.type}`,
	};
}

function parsePriority(description?: string) {
	if (!description) return undefined;

	if (description.includes("## Urgent")) return "Urgent";
	if (description.includes("## High")) return "High";
	if (description.includes("## Medium")) return "Medium";
	if (description.includes("## Low")) return "Low";

	return undefined;
}
