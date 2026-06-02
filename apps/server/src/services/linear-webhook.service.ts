import {
	getMappingByLinearIssueId,
	updateLinearIssue,
	updateMappingByLinearIssueId,
	updateTrelloCard,
} from "@Trello-Linear-2-way-sync/db";
import {
	getTrelloListByName,
	moveTrelloCardToList,
	updateTrelloCardDescription,
	updateTrelloCardDueDate,
	updateTrelloCardName,
} from "@/services/trello-api.service";
import { buildLinearSyncCommand } from "@/sync/linear-sync-command";
import type { LinearSyncCommand, ParsedLinearEvent } from "@/types/types";

const ECHO_WINDOW_MS = 30_000;

function isLikelyTrelloEcho(
	lastSyncSource?: string | null,
	lastSyncedAt?: Date | null,
) {
	if (lastSyncSource !== "trello" || !lastSyncedAt) {
		return false;
	}

	return Date.now() - lastSyncedAt.getTime() < ECHO_WINDOW_MS;
}

async function markLinearSyncStarted(linearIssueId: string) {
	const syncDate = new Date();

	await updateMappingByLinearIssueId(linearIssueId, {
		lastSyncSource: "linear",
		lastSyncedAt: syncDate,
	});

	return syncDate;
}

function logMissingMapping(command: LinearSyncCommand) {
	if (command.type === "noop") {
		return;
	}

	console.log("No mapping found, skipping Trello sync command:", {
		commandType: command.type,
		linearIssueId: command.linearIssueId,
	});
}

function shouldSkipTrelloEcho(
	command: Exclude<LinearSyncCommand, { type: "noop" }>,
	lastSyncSource?: string | null,
	lastSyncedAt?: Date | null,
) {
	if (!isLikelyTrelloEcho(lastSyncSource, lastSyncedAt)) {
		return false;
	}

	console.log("Skipping Linear webhook that looks like a Trello echo:", {
		commandType: command.type,
		linearIssueId: command.linearIssueId,
	});

	return true;
}

async function executeLinearSyncCommand(command: LinearSyncCommand) {
	switch (command.type) {
		case "trello.card.rename": {
			const existingMapping = await getMappingByLinearIssueId(
				command.linearIssueId,
			);

			if (!existingMapping?.trelloCardId) {
				logMissingMapping(command);
				return;
			}

			if (
				shouldSkipTrelloEcho(
					command,
					existingMapping.lastSyncSource,
					existingMapping.lastSyncedAt,
				)
			) {
				return;
			}

			await markLinearSyncStarted(command.linearIssueId);

			const trelloCard = await updateTrelloCardName(
				existingMapping.trelloCardId,
				command.title,
			);

			await updateTrelloCard(existingMapping.trelloCardId, {
				name: trelloCard.name ?? command.title,
			});

			await updateLinearIssue(command.linearIssueId, {
				title: command.title,
			});

			console.log("Updated Trello card name from Linear issue title:", {
				linearIssueId: command.linearIssueId,
				trelloCardId: existingMapping.trelloCardId,
				title: trelloCard.name ?? command.title,
			});
			return;
		}

		case "trello.card.description_update": {
			const existingMapping = await getMappingByLinearIssueId(
				command.linearIssueId,
			);

			if (!existingMapping?.trelloCardId) {
				logMissingMapping(command);
				return;
			}

			if (
				shouldSkipTrelloEcho(
					command,
					existingMapping.lastSyncSource,
					existingMapping.lastSyncedAt,
				)
			) {
				return;
			}

			await markLinearSyncStarted(command.linearIssueId);

			const trelloCard = await updateTrelloCardDescription(
				existingMapping.trelloCardId,
				command.description,
			);

			await updateTrelloCard(existingMapping.trelloCardId, {
				description: trelloCard.desc ?? command.description ?? "",
			});

			await updateLinearIssue(command.linearIssueId, {
				description: command.description,
			});

			console.log("Updated Trello card description from Linear issue:", {
				linearIssueId: command.linearIssueId,
				trelloCardId: existingMapping.trelloCardId,
			});
			return;
		}

		case "trello.card.due_date_update": {
			const existingMapping = await getMappingByLinearIssueId(
				command.linearIssueId,
			);

			if (!existingMapping?.trelloCardId) {
				logMissingMapping(command);
				return;
			}

			if (
				shouldSkipTrelloEcho(
					command,
					existingMapping.lastSyncSource,
					existingMapping.lastSyncedAt,
				)
			) {
				return;
			}

			await markLinearSyncStarted(command.linearIssueId);

			const trelloCard = await updateTrelloCardDueDate(
				existingMapping.trelloCardId,
				command.dueDate,
			);

			await updateTrelloCard(existingMapping.trelloCardId, {
				dueDate: trelloCard.due ? new Date(trelloCard.due) : null,
			});

			await updateLinearIssue(command.linearIssueId, {
				dueDate: command.dueDate ? new Date(command.dueDate) : null,
			});

			console.log("Updated Trello card due date from Linear issue:", {
				linearIssueId: command.linearIssueId,
				trelloCardId: existingMapping.trelloCardId,
				dueDate: command.dueDate,
			});
			return;
		}

		case "trello.card.status_update": {
			const existingMapping = await getMappingByLinearIssueId(
				command.linearIssueId,
			);

			if (!existingMapping?.trelloCardId) {
				logMissingMapping(command);
				return;
			}

			if (!command.trelloListName) {
				console.log("No Trello list mapping found for Linear state:", {
					linearIssueId: command.linearIssueId,
					linearStateName: command.linearStateName,
				});
				return;
			}

			if (
				shouldSkipTrelloEcho(
					command,
					existingMapping.lastSyncSource,
					existingMapping.lastSyncedAt,
				)
			) {
				return;
			}

			const trelloList = await getTrelloListByName(command.trelloListName);

			if (!trelloList) {
				console.log("Configured Trello list was not found on board:", {
					linearIssueId: command.linearIssueId,
					linearStateName: command.linearStateName,
					trelloListName: command.trelloListName,
				});
				return;
			}

			await markLinearSyncStarted(command.linearIssueId);

			await moveTrelloCardToList(existingMapping.trelloCardId, trelloList.id);

			await updateTrelloCard(existingMapping.trelloCardId, {
				listId: trelloList.id,
				listName: trelloList.name,
			});

			await updateLinearIssue(command.linearIssueId, {
				stateName: command.linearStateName,
			});

			console.log("Moved Trello card from Linear issue state:", {
				linearIssueId: command.linearIssueId,
				trelloCardId: existingMapping.trelloCardId,
				linearStateName: command.linearStateName,
				trelloListName: trelloList.name,
			});
			return;
		}

		case "noop":
			console.log("No Linear sync action:", command.reason);
			return;

		default:
			console.log("Linear command not implemented yet:", command);
			return;
	}
}

export async function handleLinearWebhook(event: ParsedLinearEvent) {
	const command = buildLinearSyncCommand(event);
	console.log("Built Linear sync command:", command);

	try {
		await executeLinearSyncCommand(command);
	} catch (error) {
		console.error("Failed to execute Linear sync command:", error);
	}
}
