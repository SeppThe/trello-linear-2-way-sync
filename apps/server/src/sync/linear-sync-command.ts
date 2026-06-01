import type { LinearSyncCommand, ParsedLinearEvent } from "@/types/types";

export function buildLinearSyncCommand(
	event: ParsedLinearEvent,
): LinearSyncCommand {
	if (event.type === "issue.renamed") {
		return {
			type: "trello.card.rename",
			linearIssueId: event.linearIssueId,
			title: event.title,
			previousTitle: event.previousTitle,
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
