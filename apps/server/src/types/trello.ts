export type TrelloActionType =
	| "addLabelToCard"
	| "commentCard"
	| "createCard"
	| "removeLabelFromCard"
	| "updateCard"
	| "updateCard:idList";

export type TrelloWebhookPayload = {
	action?: {
		id?: string;
		type?: string;
		data?: {
			card?: {
				id?: string;
				name?: string;
				desc?: string;
				idList?: string;
			};
			listAfter?: {
				id?: string;
				name?: string;
			};
			listBefore?: {
				id?: string;
				name?: string;
			};
			old?: {
				name?: string;
				desc?: string;
				idList?: string;
			};
			[key: string]: unknown;
		};
		[key: string]: unknown;
	};
	model?: {
		id?: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
};

export type ParsedTrelloEvent = {
	actionId?: string;
	actionType?: string;
	cardId?: string;
	cardName?: string;
	cardDescription?: string;
	isUseful: boolean;
	normalizedType?: TrelloActionType;
};
