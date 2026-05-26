import { buildSyncCommand } from "@/sync/trello-sync-command";
import type { ParsedTrelloEvent, SyncCommand } from "@/types/types";
import { getMappingByTrelloCardId } from "@Trello-Linear-2-way-sync/db";

async function executeSyncCommand(command: SyncCommand) {
	switch (command.type) {
		case "linear.issue.create": {
			const existingMapping = await getMappingByTrelloCardId(command.trelloCardId);

			if (existingMapping) {
				console.log("Mapping already exists, skipping Linear issue create:", {
					trelloCardId: command.trelloCardId,
					linearIssueId: existingMapping.linearIssueId,
				});
				return;
			}

			console.log("No mapping found, would create Linear issue:", command);
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

	await executeSyncCommand(command);

}
