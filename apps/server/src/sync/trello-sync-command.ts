import type { ParsedTrelloEvent, SyncCommand } from "@/types/types";

export function buildSyncCommand(event: ParsedTrelloEvent): SyncCommand {
    if (event.type === "card.created") {
        return {
            type: "linear.issue.create",
            trelloCardId: event.cardId,
            title: event.cardName,
            description: event.description,
            dueDate: event.dueDate,
            labels: event.labels
                ?.map((label) => label.name || "")
                .filter((name) => name !== ""),
            priority: parsePriority(event.description),
        };
    }

    if (event.type === "ignored") {
        return {
            type: "noop",
            reason: event.reason,
        };
    }

    return {
        type: "noop",
        reason: `No sync command defined for event type ${event.type}`,
    };
}

function parsePriority(description?: string) {
    if (!description) return undefined;

    if (description.includes("## Urgent")) return "Urgent";
    if (description.includes("## High")) return "High";
    if (description.includes("## Medium")) return "Medium";
    if (description.includes("## Low")) return "Low";

    return undefined;
}
