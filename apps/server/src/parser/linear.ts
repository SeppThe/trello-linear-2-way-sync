import type { LinearWebhook } from "@/schemas/linear";
import type { ParsedLinearEvent } from "@/types/types";

export function parseLinearEvent(payload: LinearWebhook): ParsedLinearEvent {
	const action = payload.action;
	const resourceType = payload.type;
	const issue = payload.data;

	if (!action || !resourceType) {
		return {
			type: "ignored",
			reason: "missing Linear action or type",
		};
	}

	if (resourceType.toLowerCase() !== "issue") {
		return {
			type: "ignored",
			reason: `unhandled Linear resource type: ${resourceType}`,
		};
	}

	if (!issue?.id) {
		return {
			type: "ignored",
			reason: "missing Linear issue id",
		};
	}

	if (action === "update" || action === "updated") {
		const previousTitle = payload.updatedFrom?.title;

		if (typeof previousTitle === "string" && issue.title) {
			return {
				type: "issue.renamed",
				linearIssueId: issue.id,
				title: issue.title,
				previousTitle,
			};
		}
	}

	return {
		type: "ignored",
		reason: `unhandled Linear action: ${action}`,
	};
}
