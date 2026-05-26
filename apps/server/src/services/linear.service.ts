import { env } from "@Trello-Linear-2-way-sync/env/server";
import type { SyncCommand } from "@/types/types";

type LinearPriority = NonNullable<
	Extract<SyncCommand, { type: "linear.issue.create" }>["priority"]
>;

type LinearIssueCreateResponse = {
	data?: {
		issueCreate?: {
			success: boolean;
			issue?: {
				id: string;
				identifier?: string;
				title: string;
				description?: string | null;
				priority?: number | null;
				dueDate?: string | null;
				state?: {
					name?: string | null;
				} | null;
			} | null;
		};
	};
	errors?: Array<{ message: string }>;
};

export type CreatedLinearIssue = {
	id: string;
	identifier?: string;
	title: string;
	description?: string | null;
	priority?: number | null;
	dueDate?: string | null;
	stateName?: string | null;
};

const linearPriorityByName: Record<LinearPriority, number> = {
	Urgent: 1,
	High: 2,
	Medium: 3,
	Low: 4,
};

function toLinearDueDate(dueDate?: string | null) {
	if (!dueDate) {
		return undefined;
	}

	return dueDate.slice(0, 10);
}

function toLinearPriority(priority?: LinearPriority) {
	if (!priority) {
		return undefined;
	}

	return linearPriorityByName[priority];
}

export async function createLinearIssueFromCommand(
	command: Extract<SyncCommand, { type: "linear.issue.create" }>,
): Promise<CreatedLinearIssue> {
	const query = `
		mutation CreateIssue($input: IssueCreateInput!) {
			issueCreate(input: $input) {
				success
				issue {
					id
					identifier
					title
					description
					priority
					dueDate
					state {
						name
					}
				}
			}
		}
	`;

	const input = {
		teamId: env.LINEAR_TEAM_ID,
		title: command.title,
		description: command.description,
		priority: toLinearPriority(command.priority),
		dueDate: toLinearDueDate(command.dueDate),
	};

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: { input },
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearIssueCreateResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear issueCreate failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	const createdIssue = payload.data?.issueCreate?.issue;

	if (!payload.data?.issueCreate?.success || !createdIssue) {
		throw new Error("Linear issueCreate did not return a created issue");
	}

	return {
		id: createdIssue.id,
		identifier: createdIssue.identifier,
		title: createdIssue.title,
		description: createdIssue.description,
		priority: createdIssue.priority,
		dueDate: createdIssue.dueDate,
		stateName: createdIssue.state?.name,
	};
}
