export type ParsedTrelloEvent =
    | {
        type: "card.created";
        cardId: string;
        cardName: string;
    }
    | {
        type: "card.renamed";
        cardId: string;
        cardName: string;
        previousName: string;
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
        type: "ignored";
        reason: string;
    };