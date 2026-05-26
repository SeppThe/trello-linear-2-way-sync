import {
	bigserial,
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

type StoredTrelloLabel = {
	id: string;
	name?: string;
	color?: string | null;
};

export const trelloCards = pgTable("trello_cards", {
	id: text("id").primaryKey(),
	boardId: text("board_id"),
	listId: text("list_id"),
	listName: text("list_name"),
	name: text("name").notNull(),
	description: text("description"),
	dueDate: timestamp("due_date", { withTimezone: true }),
	labels: jsonb("labels").$type<StoredTrelloLabel[]>().default([]).notNull(),
	archived: boolean("archived").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const linearIssues = pgTable("linear_issues", {
	id: text("id").primaryKey(),
	identifier: text("identifier"),
	teamId: text("team_id"),
	title: text("title").notNull(),
	description: text("description"),
	priority: text("priority"),
	dueDate: timestamp("due_date", { withTimezone: true }),
	stateName: text("state_name"),
	archived: boolean("archived").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const trelloLinearMappings = pgTable(
	"trello_linear_mappings",
	{
		id: bigserial("id", { mode: "number" }).primaryKey(),
		trelloCardId: text("trello_card_id")
			.notNull()
			.unique()
			.references(() => trelloCards.id, { onDelete: "cascade" }),
		linearIssueId: text("linear_issue_id")
			.unique()
			.references(() => linearIssues.id, { onDelete: "set null" }),
		lastSyncSource: text("last_sync_source"),
		lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("trello_linear_mappings_trello_card_id_idx").on(table.trelloCardId),
		index("trello_linear_mappings_linear_issue_id_idx").on(table.linearIssueId),
	],
);
