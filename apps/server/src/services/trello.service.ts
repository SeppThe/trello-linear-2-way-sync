import { handleSyncEventFromTrello } from "../sync/syncEngine";
import type {
	ParsedTrelloEvent,
	TrelloActionType,
	TrelloWebhookPayload,
} from "../types/trello";

const usefulActionTypes = new Set<TrelloActionType>([
	"createCard",
	"updateCard",
	"commentCard",
	"addLabelToCard",
	"removeLabelFromCard",
	"updateCard:idList",
]);

function normalizeTrelloActionType(
	actionType: string | undefined,
	isListMove: boolean,
): TrelloActionType | undefined {
	const normalizedType = isListMove ? "updateCard:idList" : actionType;

	if (
		!normalizedType ||
		!usefulActionTypes.has(normalizedType as TrelloActionType)
	) {
		return undefined;
	}

	return normalizedType as TrelloActionType;
}

export function parseTrelloWebhookPayload(
	payload: TrelloWebhookPayload,
): ParsedTrelloEvent {
	const action = payload.action;
	const actionType = action?.type;
	const card = action?.data?.card;
	const isListMove =
		actionType === "updateCard" && Boolean(action?.data?.old?.idList);
	const normalizedType = normalizeTrelloActionType(actionType, isListMove);

	return {
		actionId: action?.id,
		actionType,
		cardId: card?.id,
		cardName: card?.name,
		cardDescription: card?.desc,
		isUseful: Boolean(normalizedType),
		normalizedType,
	};
}

export async function handleTrelloWebhook(
	payload: TrelloWebhookPayload,
): Promise<void> {
	const event = parseTrelloWebhookPayload(payload);

	if (!event.isUseful) {
		console.log("Ignoring Trello webhook action:", {
			actionType: event.actionType,
			actionId: event.actionId,
		});
		return;
	}

	console.log("Parsed Trello webhook action:", {
		actionType: event.normalizedType,
		actionId: event.actionId,
		cardId: event.cardId,
		cardName: event.cardName,
	});

	await handleSyncEventFromTrello(event);
}
