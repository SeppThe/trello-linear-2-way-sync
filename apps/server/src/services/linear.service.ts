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

type LinearIssueUpdateResponse = {
	data?: {
		issueUpdate?: {
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

type LinearIssueArchiveResponse = {
	data?: {
		issueArchive?: {
			success: boolean;
		};
	};
	errors?: Array<{ message: string }>;
};

type LinearWorkflowState = {
	id: string;
	name: string;
	type?: string | null;
};

type LinearWorkflowStatesResponse = {
	data?: {
		team?: {
			states?: {
				nodes?: LinearWorkflowState[];
			};
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
	"No Priority": 0,
	Urgent: 1,
	High: 2,
	Medium: 3,
	Low: 4,
};

function toLinearDueDate(dueDate?: string | null) {
	if (dueDate === null) {
		return null;
	}

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

async function getLinearWorkflowStates() {
	const query = `
		query TeamStates($teamId: String!, $first: Int) {
			team(id: $teamId) {
				states(first: $first) {
					nodes {
						id
						name
						type
					}
				}
			}
		}
	`;

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				teamId: env.LINEAR_TEAM_ID,
				first: 100,
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearWorkflowStatesResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear team states query failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	return payload.data?.team?.states?.nodes ?? [];
}

async function getLinearStateIdByName(stateName: string) {
	const states = await getLinearWorkflowStates();
	const state = states.find(
		(state) => state.name.toLowerCase() === stateName.toLowerCase(),
	);

	if (!state) {
		throw new Error(
			`Linear workflow state not found: ${stateName}. Available states: ${states
				.map((availableState) => availableState.name)
				.join(", ")}`,
		);
	}

	return state?.id;
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

export async function updateLinearIssueTitleFromCommand(
	linearIssueId: string,
	command: Extract<SyncCommand, { type: "linear.issue.renamed" }>,
): Promise<CreatedLinearIssue> {
	const query = `
		mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
			issueUpdate(id: $id, input: $input) {
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

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				id: linearIssueId,
				input: {
					title: command.title,
				},
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearIssueUpdateResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear issueUpdate failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	const updatedIssue = payload.data?.issueUpdate?.issue;

	if (!payload.data?.issueUpdate?.success || !updatedIssue) {
		throw new Error("Linear issueUpdate did not return an updated issue");
	}

	return {
		id: updatedIssue.id,
		identifier: updatedIssue.identifier,
		title: updatedIssue.title,
		description: updatedIssue.description,
		priority: updatedIssue.priority,
		dueDate: updatedIssue.dueDate,
		stateName: updatedIssue.state?.name,
	};
}

export async function updateLinearIssueDescriptionFromCommand(
	linearIssueId: string,
	description?: string,
) {
	const query = `
		mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
			issueUpdate(id: $id, input: $input) {
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

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				id: linearIssueId,
				input: {
					description,
				},
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearIssueUpdateResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear issueUpdate failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	const updatedIssue = payload.data?.issueUpdate?.issue;

	if (!payload.data?.issueUpdate?.success || !updatedIssue) {
		throw new Error("Linear issueUpdate did not return an updated issue");
	}

	return {
		id: updatedIssue.id,
		identifier: updatedIssue.identifier,
		title: updatedIssue.title,
		description: updatedIssue.description,
		priority: updatedIssue.priority,
		dueDate: updatedIssue.dueDate,
		stateName: updatedIssue.state?.name,
	};
}

export async function updateLinearIssueDueDateFromCommand(
	linearIssueId: string,
	dueDate?: string | null,
) {
	const query = `
		mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
			issueUpdate(id: $id, input: $input) {
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

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				id: linearIssueId,
				input: {
					dueDate: toLinearDueDate(dueDate),
				},
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearIssueUpdateResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear issueUpdate failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	const updatedIssue = payload.data?.issueUpdate?.issue;

	if (!payload.data?.issueUpdate?.success || !updatedIssue) {
		throw new Error("Linear issueUpdate did not return an updated issue");
	}

	return {
		id: updatedIssue.id,
		identifier: updatedIssue.identifier,
		title: updatedIssue.title,
		description: updatedIssue.description,
		priority: updatedIssue.priority,
		dueDate: updatedIssue.dueDate,
		stateName: updatedIssue.state?.name,
	};
}

export async function updateLinearIssueStateByName(
	linearIssueId: string,
	stateName: string,
): Promise<CreatedLinearIssue> {
	const stateId = await getLinearStateIdByName(stateName);
	const query = `
		mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
			issueUpdate(id: $id, input: $input) {
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

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: {
				id: linearIssueId,
				input: {
					stateId,
				},
			},
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearIssueUpdateResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear issueUpdate failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	const updatedIssue = payload.data?.issueUpdate?.issue;

	if (!payload.data?.issueUpdate?.success || !updatedIssue) {
		throw new Error("Linear issueUpdate did not return an updated issue");
	}

	return {
		id: updatedIssue.id,
		identifier: updatedIssue.identifier,
		title: updatedIssue.title,
		description: updatedIssue.description,
		priority: updatedIssue.priority,
		dueDate: updatedIssue.dueDate,
		stateName: updatedIssue.state?.name,
	};
}

export async function closeLinearIssue(linearIssueId: string) {
	const query = `
		mutation IssueArchive($id: String!) {
			issueArchive(id: $id) {
				success
			}
		}
	`;

	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: env.LINEAR_API_KEY,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query,
			variables: { id: linearIssueId },
		}),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with status ${response.status}`);
	}

	const payload = (await response.json()) as LinearIssueArchiveResponse;

	if (payload.errors?.length) {
		throw new Error(
			`Linear issueArchive failed: ${payload.errors
				.map((error) => error.message)
				.join("; ")}`,
		);
	}

	if (!payload.data?.issueArchive?.success) {
		throw new Error("Linear issueArchive was not successful");
	}
}
