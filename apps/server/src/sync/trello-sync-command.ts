import { defaultSyncConfig, type SyncConfig } from "@/sync/sync-config";
import type {
	ParsedTrelloEvent,
	SyncCommand,
	TrelloLabel,
} from "@/types/types";

export function buildSyncCommand(
	event: ParsedTrelloEvent,
	config: SyncConfig = defaultSyncConfig,
): SyncCommand {
	if (event.type === "card.created") {
		return {
			type: "linear.issue.create",
			trelloCardId: event.cardId,
			title: event.cardName,
			description: event.description,
			dueDate: event.dueDate,
			labels: event.labels,
			priority: parsePriority({
				labels: event.labels,
				description: event.description,
				listName: event.listName,
				config,
			}),
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
			linearStateName: parseStatusFromListName(event.toListName, config),
		};
	}

	if (event.type === "card.deleted") {
		return {
			type: "linear.issue.close",
			trelloCardId: event.cardId,
		};
	}

	if (event.type === "card.archive_status_changed") {
		if (event.archived) {
			return {
				type: "linear.issue.close",
				trelloCardId: event.cardId,
			};
		}

		return {
			type: "noop",
			reason:
				"Trello card was unarchived; Linear reopen is not implemented yet",
		};
	}

	if (event.type === "card.description_changed") {
		return {
			type: "linear.issue.description_update",
			trelloCardId: event.cardId,
			description: event.description,
			priority: parsePriority({
				description: event.description,
				config,
			}),
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

function normalizeMappingKey(value: string) {
	return value
		.toLowerCase()
		.replace(/\\/g, "")
		.replace(/^#+\s*/, "")
		.replace(/^\*+\s*/, "")
		.replace(/\s*\*+$/, "")
		.replace(/[_-]+/g, " ")
		.trim();
}

function parsePriorityFromLabelsWithConfig(
	labels: TrelloLabel[] | undefined,
	config: SyncConfig,
) {
	for (const label of labels ?? []) {
		if (!label.name) {
			continue;
		}

		const priority = config.priorityTokens[normalizeMappingKey(label.name)];

		if (priority) {
			return priority;
		}
	}

	return undefined;
}

function parsePriorityFromDescription(
	description: string | undefined,
	config: SyncConfig,
) {
	if (!description) {
		return undefined;
	}

	for (const line of description.split("\n")) {
		const priority = config.priorityTokens[normalizeMappingKey(line)];

		if (priority) {
			return priority;
		}
	}

	return undefined;
}

function parsePriorityFromListName(
	listName: string | undefined,
	config: SyncConfig,
) {
	if (!listName) {
		return undefined;
	}

	return config.priorityListNames[normalizeMappingKey(listName)];
}

function parsePriority({
	labels,
	description,
	listName,
	config,
}: {
	labels?: TrelloLabel[];
	description?: string;
	listName?: string;
	config: SyncConfig;
}) {
	return (
		parsePriorityFromLabelsWithConfig(labels, config) ??
		parsePriorityFromDescription(description, config) ??
		parsePriorityFromListName(listName, config)
	);
}

function parseStatusFromListName(
	listName: string | undefined,
	config: SyncConfig,
) {
	if (!listName) {
		return undefined;
	}

	return config.statusListNames[normalizeMappingKey(listName)];
}
