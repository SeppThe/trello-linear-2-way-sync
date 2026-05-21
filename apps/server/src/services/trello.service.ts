import { buildSyncCommand } from "@/sync/trello-sync-command";
import type { ParsedTrelloEvent } from "@/types/types";

export async function handleTrelloWebhook(event: ParsedTrelloEvent) {
	const command = buildSyncCommand(event);
	console.log("Built sync command:", command);

	switch (event.type) {
		case "card.created":
			console.log("Would create Linear issue:", event);
			return;
		case "card.renamed":
		case "card.description_changed":
		case "card.due_date_changed":
		case "card.moved":
		case "card.label_added":
		case "card.label_removed":
		case "card.archive_status_changed":
			console.log("Would update Linear issue:", event);
			return;

		case "card.deleted":
			console.log("Would close/delete Linear issue:", event);
			return;

		case "ignored":
			console.log("Ignoring Trello event:", event.reason);
			return;
	}
}
