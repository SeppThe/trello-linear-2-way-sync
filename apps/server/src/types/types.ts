export type TrelloLabel = {
	id: string;
	name?: string;
	color?: string | null;
};

export type ParsedTrelloEvent =
	| {
			type: "card.created";
			cardId: string;
			cardName: string;
			description?: string;
			dueDate?: string | null;
			labels?: TrelloLabel[];
	  }
	| {
			type: "card.renamed";
			cardId: string;
			cardName: string;
			previousName: string;
	  }
	| {
			type: "card.description_changed";
			cardId: string;
			cardName: string;
			description?: string;
			previousDescription?: string;
	  }
	| {
			type: "card.moved";
			cardId: string;
			cardName: string;
			fromListId?: string;
			fromListName?: string;
			toListId?: string;
			toListName?: string;
	  }
	| {
			type: "card.due_date_changed";
			cardId: string;
			cardName: string;
			dueDate?: string | null;
			previousDueDate?: string | null;
	  }
	| {
			type: "card.label_added";
			cardId: string;
			cardName: string;
			label: TrelloLabel;
	  }
	| {
			type: "card.label_removed";
			cardId: string;
			cardName: string;
			label: TrelloLabel;
	  }
	| {
			type: "card.deleted";
			cardId: string;
	  }
	| {
			type: "ignored";
			reason: string;
	  };
