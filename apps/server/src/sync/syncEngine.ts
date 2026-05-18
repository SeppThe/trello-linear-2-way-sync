import type { ParsedTrelloEvent } from "../types/trello";
import { handleTrelloToLinearEvent } from "./trelloToLinear";

export async function handleSyncEventFromTrello(
	event: ParsedTrelloEvent,
): Promise<void> {
	await handleTrelloToLinearEvent(event);
}
