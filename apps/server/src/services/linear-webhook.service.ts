import {
	getMappingByLinearIssueId,
	updateLinearIssue,
	updateMappingByLinearIssueId,
	updateTrelloCard,
} from "@Trello-Linear-2-way-sync/db";
import { updateTrelloCardName } from "@/services/trello-api.service";
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

async function executeLinearSyncCommand(command: LinearSyncCommand) {
	switch (command.type) {
		case "trello.card.rename": {
			const existingMapping = await getMappingByLinearIssueId(
				command.linearIssueId,
			);

			if (!existingMapping?.trelloCardId) {
				console.log("No mapping found, skipping Trello card rename:", {
					linearIssueId: command.linearIssueId,
					title: command.title,
				});
				return;
			}

			if (
				isLikelyTrelloEcho(
					existingMapping.lastSyncSource,
					existingMapping.lastSyncedAt,
				)
			) {
				console.log(
					"Skipping Linear title webhook that looks like a Trello echo:",
					{
						linearIssueId: command.linearIssueId,
						trelloCardId: existingMapping.trelloCardId,
					},
				);
				return;
			}

			const trelloCard = await updateTrelloCardName(
				existingMapping.trelloCardId,
				command.title,
			);
			const syncDate = new Date();

			await updateTrelloCard(existingMapping.trelloCardId, {
				name: trelloCard.name,
			});

			await updateLinearIssue(command.linearIssueId, {
				title: command.title,
			});

			await updateMappingByLinearIssueId(command.linearIssueId, {
				lastSyncSource: "linear",
				lastSyncedAt: syncDate,
			});

			console.log("Updated Trello card name from Linear issue title:", {
				linearIssueId: command.linearIssueId,
				trelloCardId: existingMapping.trelloCardId,
				title: trelloCard.name,
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
