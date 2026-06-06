import { defaultSyncConfig, type SyncConfig } from "@/sync/sync-config";
import type {
	LinearPriority,
	LinearSyncCommand,
	ParsedLinearEvent,
} from "@/types/types";

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

function descriptionWithPriority(
	description: string | null | undefined,
	priority: LinearPriority | undefined,
	config: SyncConfig,
) {
	if (!priority) {
		return description;
	}

	const descriptionWithoutPriority = (description ?? "")
		.split("\n")
		.filter((line) => !config.priorityTokens[normalizeMappingKey(line)])
		.join("\n")
		.trim();

	if (priority === "No Priority") {
		return descriptionWithoutPriority;
	}

	const priorityMarker = `** ${priority}`;

	return descriptionWithoutPriority
		? `${priorityMarker}\n\n${descriptionWithoutPriority}`
		: priorityMarker;
}

function formatLinearComment(
	event: Extract<ParsedLinearEvent, { type: "issue.commented" }>,
) {
	const author = event.authorName ?? "Unknown Linear user";

	return `Linear comment from ${author}:\n\n${event.commentBody}`;
}

export function buildLinearSyncCommand(
	event: ParsedLinearEvent,
	config: SyncConfig = defaultSyncConfig,
): LinearSyncCommand {
	if (event.type === "issue.created") {
		return {
			type: "trello.card.create",
			linearIssueId: event.linearIssueId,
			identifier: event.identifier,
			title: event.title,
			description: descriptionWithPriority(
				event.description,
				event.priority,
				config,
			),
			linearDescription: event.description,
			dueDate: event.dueDate,
			linearStateName: event.stateName,
			trelloListName: event.stateName
				? (config.linearStateListNames[normalizeMappingKey(event.stateName)] ??
					config.defaultTrelloListName)
				: config.defaultTrelloListName,
			teamId: event.teamId,
			priority: event.priority,
		};
	}

	if (event.type === "issue.renamed") {
		return {
			type: "trello.card.rename",
			linearIssueId: event.linearIssueId,
			title: event.title,
			previousTitle: event.previousTitle,
		};
	}

	if (event.type === "issue.description_changed") {
		return {
			type: "trello.card.description_update",
			linearIssueId: event.linearIssueId,
			description: descriptionWithPriority(
				event.description,
				event.priority,
				config,
			),
			linearDescription: event.description,
			priority: event.priority,
		};
	}

	if (event.type === "issue.due_date_changed") {
		return {
			type: "trello.card.due_date_update",
			linearIssueId: event.linearIssueId,
			dueDate: event.dueDate,
		};
	}

	if (event.type === "issue.state_changed") {
		return {
			type: "trello.card.status_update",
			linearIssueId: event.linearIssueId,
			linearStateName: event.stateName,
			trelloListName:
				config.linearStateListNames[normalizeMappingKey(event.stateName)] ??
				event.stateName,
		};
	}

	if (event.type === "issue.archive_status_changed") {
		return {
			type: event.archived ? "trello.card.archive" : "trello.card.reopen",
			linearIssueId: event.linearIssueId,
		};
	}

	if (event.type === "issue.commented") {
		return {
			type: "trello.comment.create",
			linearIssueId: event.linearIssueId,
			linearCommentId: event.linearCommentId,
			body: formatLinearComment(event),
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
		reason: "No sync command defined for Linear event",
	};
}
