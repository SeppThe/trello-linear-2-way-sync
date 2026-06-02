import type { LinearWebhook } from "@/schemas/linear";
import type { ParsedLinearEvent } from "@/types/types";

function hasUpdatedFromField(
	updatedFrom: Record<string, unknown> | undefined,
	field: string,
) {
	return updatedFrom ? Object.hasOwn(updatedFrom, field) : false;
}

export function parseLinearEvent(payload: LinearWebhook): ParsedLinearEvent {
	const action = payload.action;
	const resourceType = payload.type;
	const issue = payload.data;
	const updatedFrom = payload.updatedFrom;

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
		const previousTitle = updatedFrom?.title;

		if (typeof previousTitle === "string" && issue.title) {
			return {
				type: "issue.renamed",
				linearIssueId: issue.id,
				title: issue.title,
				previousTitle,
			};
		}

		if (hasUpdatedFromField(updatedFrom, "description")) {
			const previousDescription = updatedFrom?.description;

			return {
				type: "issue.description_changed",
				linearIssueId: issue.id,
				description: issue.description,
				previousDescription:
					typeof previousDescription === "string" ||
					previousDescription === null
						? previousDescription
						: undefined,
			};
		}

		if (hasUpdatedFromField(updatedFrom, "dueDate")) {
			const previousDueDate = updatedFrom?.dueDate;

			return {
				type: "issue.due_date_changed",
				linearIssueId: issue.id,
				dueDate: issue.dueDate,
				previousDueDate:
					typeof previousDueDate === "string" || previousDueDate === null
						? previousDueDate
						: undefined,
			};
		}

		if (
			(hasUpdatedFromField(updatedFrom, "stateId") ||
				hasUpdatedFromField(updatedFrom, "state")) &&
			issue.state?.name
		) {
			const previousState = updatedFrom?.state;
			const previousStateName =
				typeof previousState === "object" &&
				previousState !== null &&
				"name" in previousState &&
				typeof previousState.name === "string"
					? previousState.name
					: undefined;

			return {
				type: "issue.state_changed",
				linearIssueId: issue.id,
				stateName: issue.state.name,
				previousStateName,
			};
		}
	}

	return {
		type: "ignored",
		reason: `unhandled Linear action: ${action}`,
	};
}
