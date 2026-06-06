import type { LinearWebhook } from "@/schemas/linear";
import type { LinearPriority, ParsedLinearEvent } from "@/types/types";

const linearPriorityByNumber: Record<number, LinearPriority> = {
	0: "No Priority",
	1: "Urgent",
	2: "High",
	3: "Medium",
	4: "Low",
};

function hasUpdatedFromField(
	updatedFrom: Record<string, unknown> | undefined,
	field: string,
) {
	return updatedFrom ? Object.hasOwn(updatedFrom, field) : false;
}

function getPreviousStateName(
	updatedFrom: Record<string, unknown> | undefined,
) {
	const previousState = updatedFrom?.state;

	return typeof previousState === "object" &&
		previousState !== null &&
		"name" in previousState &&
		typeof previousState.name === "string"
		? previousState.name
		: undefined;
}

function parseLinearPriority(priority?: number | null) {
	if (priority === null) {
		return "No Priority" satisfies LinearPriority;
	}

	return priority === undefined ? undefined : linearPriorityByNumber[priority];
}

export function parseLinearEvents(payload: LinearWebhook): ParsedLinearEvent[] {
	const action = payload.action?.toLowerCase();
	const resourceType = payload.type;
	const issue = payload.data;
	const updatedFrom = payload.updatedFrom;

	if (!action || !resourceType) {
		return [{ type: "ignored", reason: "missing Linear action or type" }];
	}

	if (resourceType.toLowerCase() === "comment") {
		if (action !== "create" && action !== "created") {
			return [
				{
					type: "ignored",
					reason: `unhandled Linear comment action: ${action}`,
				},
			];
		}

		if (!issue?.id || !issue.issueId || !issue.body) {
			return [
				{
					type: "ignored",
					reason: "Linear comment is missing id, issue id, or body",
				},
			];
		}

		return [
			{
				type: "issue.commented",
				linearIssueId: issue.issueId,
				linearCommentId: issue.id,
				commentBody: issue.body,
				authorName: payload.actor?.name,
			},
		];
	}

	if (resourceType.toLowerCase() !== "issue") {
		return [
			{
				type: "ignored",
				reason: `unhandled Linear resource type: ${resourceType}`,
			},
		];
	}

	if (!issue?.id) {
		return [{ type: "ignored", reason: "missing Linear issue id" }];
	}

	if (action === "create" || action === "created") {
		if (!issue.title) {
			return [
				{ type: "ignored", reason: "created Linear issue is missing title" },
			];
		}

		return [
			{
				type: "issue.created",
				linearIssueId: issue.id,
				identifier: issue.identifier,
				title: issue.title,
				description: issue.description,
				dueDate: issue.dueDate,
				stateName: issue.state?.name,
				teamId: issue.team?.id,
				priority: parseLinearPriority(issue.priority),
			},
		];
	}

	if (action === "remove" || action === "removed") {
		return [
			{
				type: "issue.archive_status_changed",
				linearIssueId: issue.id,
				archived: true,
			},
		];
	}

	if (action === "update" || action === "updated") {
		const events: ParsedLinearEvent[] = [];
		let archiveEvent: ParsedLinearEvent | undefined;

		if (
			hasUpdatedFromField(updatedFrom, "archivedAt") ||
			hasUpdatedFromField(updatedFrom, "archived")
		) {
			const archived =
				typeof issue.archived === "boolean"
					? issue.archived
					: issue.archivedAt !== undefined
						? typeof issue.archivedAt === "string"
						: updatedFrom?.archived === false;

			archiveEvent = {
				type: "issue.archive_status_changed",
				linearIssueId: issue.id,
				archived,
			};

			if (!archived) {
				events.push(archiveEvent);
				archiveEvent = undefined;
			}
		}

		const previousTitle = updatedFrom?.title;
		if (typeof previousTitle === "string" && issue.title) {
			events.push({
				type: "issue.renamed",
				linearIssueId: issue.id,
				title: issue.title,
				previousTitle,
			});
		}

		if (
			hasUpdatedFromField(updatedFrom, "description") ||
			hasUpdatedFromField(updatedFrom, "priority")
		) {
			const previousDescription = updatedFrom?.description;

			events.push({
				type: "issue.description_changed",
				linearIssueId: issue.id,
				description: issue.description,
				previousDescription:
					typeof previousDescription === "string" ||
					previousDescription === null
						? previousDescription
						: undefined,
				priority: parseLinearPriority(issue.priority),
			});
		}

		if (hasUpdatedFromField(updatedFrom, "dueDate")) {
			const previousDueDate = updatedFrom?.dueDate;

			events.push({
				type: "issue.due_date_changed",
				linearIssueId: issue.id,
				dueDate: issue.dueDate,
				previousDueDate:
					typeof previousDueDate === "string" || previousDueDate === null
						? previousDueDate
						: undefined,
			});
		}

		if (
			(hasUpdatedFromField(updatedFrom, "stateId") ||
				hasUpdatedFromField(updatedFrom, "state")) &&
			issue.state?.name
		) {
			events.push({
				type: "issue.state_changed",
				linearIssueId: issue.id,
				stateName: issue.state.name,
				previousStateName: getPreviousStateName(updatedFrom),
			});
		}

		if (archiveEvent) {
			events.push(archiveEvent);
		}

		if (events.length > 0) {
			return events;
		}
	}

	return [
		{
			type: "ignored",
			reason: `unhandled Linear action: ${action}`,
		},
	];
}
