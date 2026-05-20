import type { ParsedTrelloEvent } from "@/types/types";

export async function handleTrelloWebhook(event: ParsedTrelloEvent) {
    switch (event.type) {
        case "card.created":
            // Handle card created event
            break;
        case "card.renamed":
            // Handle card renamed event
            break;
        case "card.moved":
            // Handle card moved event
            break;
        default:
            console.warn("Unhandled Trello event type:", event.type);
    }
}
