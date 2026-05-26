import {
	createMapping,
	getMappingByTrelloCardId,
	upsertLinearIssue,
	upsertTrelloCard,
} from "@Trello-Linear-2-way-sync/db";
import { createLinearIssueFromCommand } from "@/services/linear.service";
import { buildSyncCommand } from "@/sync/trello-sync-command";
import type { ParsedTrelloEvent, SyncCommand } from "@/types/types";

async function executeSyncCommand(command: SyncCommand) {
	switch (command.type) {
		case "linear.issue.create": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);

			if (existingMapping) {
				console.log("Mapping already exists, skipping Linear issue create:", {
					trelloCardId: command.trelloCardId,
					linearIssueId: existingMapping.linearIssueId,
				});
				return;
			}

			const linearIssue = await createLinearIssueFromCommand(command);
			const syncDate = new Date();

			await upsertTrelloCard({
				id: command.trelloCardId,
				listId: command.listId,
				listName: command.listName,
				name: command.title,
				description: command.description,
				dueDate: command.dueDate ? new Date(command.dueDate) : null,
				labels: command.labels,
			});

			await upsertLinearIssue({
				id: linearIssue.id,
				identifier: linearIssue.identifier,
				title: linearIssue.title,
				description: linearIssue.description,
				priority: command.priority,
				dueDate: linearIssue.dueDate ? new Date(linearIssue.dueDate) : null,
				stateName: linearIssue.stateName,
			});

			await createMapping({
				trelloCardId: command.trelloCardId,
				linearIssueId: linearIssue.id,
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log("Created Linear issue and saved mapping:", {
				trelloCardId: command.trelloCardId,
				linearIssueId: linearIssue.id,
				linearIdentifier: linearIssue.identifier,
			});
			return;
		}

		case "noop":
			console.log("No sync action:", command.reason);
			return;

		default:
			console.log("Command not implemented yet:", command);
			return;
	}
}

export async function handleTrelloWebhook(event: ParsedTrelloEvent) {
	const command = buildSyncCommand(event);
	console.log("Built sync command:", command);

	try {
		await executeSyncCommand(command);
	} catch (error) {
		console.error("Failed to execute Trello sync command:", error);
	}
}
