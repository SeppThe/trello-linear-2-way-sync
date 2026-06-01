export type TrelloLabel = {
	id: string;
	name?: string;
	color?: string | null;
};

export type LinearPriority =
	| "No Priority"
	| "Urgent"
	| "High"
	| "Medium"
	| "Low";

export type ParsedTrelloEvent =
	| {
			type: "card.created";
			cardId: string;
			cardName: string;
			description?: string;
			dueDate?: string | null;
			labels?: TrelloLabel[];
			listId?: string;
			listName?: string;
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
			linearStateName?: string;
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
			type: "card.archive_status_changed";
			cardId: string;
			cardName: string;
			archived?: boolean;
			previousArchived: boolean;
	  }
	| {
			type: "card.commented";
			cardId: string;
			cardName: string;
			commentText: string;
			trelloActionId: string;
			authorName?: string;
			authorUsername?: string;
	  }
	| {
			type: "ignored";
			reason: string;
	  };

export type ParsedLinearEvent =
	| {
			type: "issue.renamed";
			linearIssueId: string;
			title: string;
			previousTitle: string;
	  }
	| {
			type: "ignored";
			reason: string;
	  };

export type SyncCommand =
	| {
			type: "linear.issue.create";
			trelloCardId: string;
			title: string;
			description?: string;
			dueDate?: string | null;
			labels?: TrelloLabel[];
			priority?: LinearPriority;
			listId?: string;
			listName?: string;
	  }
	| {
			type: "linear.issue.status_update";
			trelloCardId: string;
			fromListId?: string;
			fromListName?: string;
			toListId?: string;
			toListName?: string;
			linearStateName?: string;
	  }
	| {
			type: "linear.issue.close";
			trelloCardId: string;
	  }
	| {
			type: "linear.issue.description_update";
			trelloCardId: string;
			description?: string;
			priority?: LinearPriority;
	  }
	| {
			type: "linear.issue.due_date_update";
			trelloCardId: string;
			dueDate?: string | null;
	  }
	| {
			type: "linear.issue.renamed";
			trelloCardId: string;
			title: string;
			previousTitle: string;
	  }
	| {
			type: "linear.comment.create";
			trelloCardId: string;
			body: string;
			trelloActionId: string;
	  }
	| {
			type: "noop";
			reason: string;
	  };

export type LinearSyncCommand =
	| {
			type: "trello.card.rename";
			linearIssueId: string;
			title: string;
			previousTitle: string;
	  }
	| {
			type: "noop";
			reason: string;
	  };
