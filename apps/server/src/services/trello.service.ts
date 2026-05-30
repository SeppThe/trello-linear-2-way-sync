import {
	createMapping,
	getMappingByTrelloCardId,
	updateLinearIssue,
	updateMappingByTrelloCardId,
	updateTrelloCard,
	upsertLinearIssue,
	upsertTrelloCard,
} from "@Trello-Linear-2-way-sync/db";
import {
	closeLinearIssue,
	createLinearComment,
	createLinearIssueFromCommand,
	updateLinearIssueDescriptionFromCommand,
	updateLinearIssueDueDateFromCommand,
	updateLinearIssueStateByName,
	updateLinearIssueTitleFromCommand,
} from "@/services/linear.service";
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

		case "linear.comment.create": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);

			if (!existingMapping?.linearIssueId) {
				console.log("No mapping found, skipping Linear comment create:", {
					trelloCardId: command.trelloCardId,
					trelloActionId: command.trelloActionId,
				});
				return;
			}

			const comment = await createLinearComment(
				existingMapping.linearIssueId,
				command.body,
			);

			const syncDate = new Date();
			await updateMappingByTrelloCardId(command.trelloCardId, {
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log("Created Linear comment from Trello comment:", {
				trelloCardId: command.trelloCardId,
				linearIssueId: existingMapping.linearIssueId,
				linearCommentId: comment.id,
				trelloActionId: command.trelloActionId,
			});
			return;
		}

		case "linear.issue.renamed": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);

			if (!existingMapping?.linearIssueId) {
				console.log("No mapping found, skipping Linear issue title update:", {
					trelloCardId: command.trelloCardId,
					title: command.title,
				});
				return;
			}

			const linearIssue = await updateLinearIssueTitleFromCommand(
				existingMapping.linearIssueId,
				command,
			);
			const syncDate = new Date();

			await updateTrelloCard(command.trelloCardId, {
				name: command.title,
			});

			await updateLinearIssue(linearIssue.id, {
				title: linearIssue.title,
			});

			await updateMappingByTrelloCardId(command.trelloCardId, {
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log("Updated Linear issue title from Trello rename:", {
				trelloCardId: command.trelloCardId,
				linearIssueId: linearIssue.id,
				linearIdentifier: linearIssue.identifier,
				title: linearIssue.title,
			});
			return;
		}

		case "linear.issue.description_update": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);
			if (!existingMapping?.linearIssueId) {
				console.log(
					"No mapping found, skipping Linear issue description update:",
					{
						trelloCardId: command.trelloCardId,
						description: command.description,
					},
				);
				return;
			}
			const linearIssue = await updateLinearIssueDescriptionFromCommand(
				existingMapping.linearIssueId,
				command.description,
				command.priority,
			);
			const syncDate = new Date();

			await updateTrelloCard(command.trelloCardId, {
				description: command.description,
			});

			await updateLinearIssue(linearIssue.id, {
				description: linearIssue.description,
				priority: command.priority,
			});

			await updateMappingByTrelloCardId(command.trelloCardId, {
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log(
				"Updated Linear issue description from Trello description change:",
				{
					trelloCardId: command.trelloCardId,
					linearIssueId: linearIssue.id,
					linearIdentifier: linearIssue.identifier,
					description: linearIssue.description,
					priority: command.priority,
				},
			);
			return;
		}

		case "linear.issue.due_date_update": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);
			if (!existingMapping?.linearIssueId) {
				console.log(
					"No mapping found, skipping Linear issue due date update:",
					{
						trelloCardId: command.trelloCardId,
						dueDate: command.dueDate,
					},
				);
				return;
			}
			const linearIssue = await updateLinearIssueDueDateFromCommand(
				existingMapping.linearIssueId,
				command.dueDate,
			);
			const syncDate = new Date();

			await updateTrelloCard(command.trelloCardId, {
				dueDate: command.dueDate ? new Date(command.dueDate) : null,
			});

			await updateLinearIssue(linearIssue.id, {
				dueDate: linearIssue.dueDate ? new Date(linearIssue.dueDate) : null,
			});

			await updateMappingByTrelloCardId(command.trelloCardId, {
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log(
				"Updated Linear issue due date from Trello due date change:",
				{
					trelloCardId: command.trelloCardId,
					linearIssueId: linearIssue.id,
					linearIdentifier: linearIssue.identifier,
					dueDate: linearIssue.dueDate,
				},
			);
			return;
		}

		case "linear.issue.close": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);
			if (!existingMapping?.linearIssueId) {
				console.log("No mapping found, skipping Linear issue close:", {
					trelloCardId: command.trelloCardId,
				});
				return;
			}

			await closeLinearIssue(existingMapping.linearIssueId);

			await updateTrelloCard(command.trelloCardId, {
				archived: true,
			});

			await updateLinearIssue(existingMapping.linearIssueId, {
				archived: true,
				stateName: "Closed",
			});

			const syncDate = new Date();
			await updateMappingByTrelloCardId(command.trelloCardId, {
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log("Closed Linear issue from Trello card deletion:", {
				trelloCardId: command.trelloCardId,
				linearIssueId: existingMapping.linearIssueId,
			});
			return;
		}

		case "linear.issue.status_update": {
			const existingMapping = await getMappingByTrelloCardId(
				command.trelloCardId,
			);
			if (!existingMapping?.linearIssueId) {
				console.log("No mapping found, skipping Linear issue status update:", {
					trelloCardId: command.trelloCardId,
					toListName: command.toListName,
				});
				return;
			}

			if (!command.linearStateName) {
				console.log("No Linear state mapping found for Trello list:", {
					trelloCardId: command.trelloCardId,
					toListName: command.toListName,
				});
				return;
			}

			const linearIssue = await updateLinearIssueStateByName(
				existingMapping.linearIssueId,
				command.linearStateName,
			);

			await updateTrelloCard(command.trelloCardId, {
				listId: command.toListId,
				listName: command.toListName,
			});

			await updateLinearIssue(existingMapping.linearIssueId, {
				stateName: linearIssue.stateName,
			});

			const syncDate = new Date();
			await updateMappingByTrelloCardId(command.trelloCardId, {
				lastSyncSource: "trello",
				lastSyncedAt: syncDate,
			});

			console.log("Updated Linear issue status from Trello card move:", {
				trelloCardId: command.trelloCardId,
				linearIssueId: existingMapping.linearIssueId,
				toListName: command.toListName,
				linearStateName: linearIssue.stateName,
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
