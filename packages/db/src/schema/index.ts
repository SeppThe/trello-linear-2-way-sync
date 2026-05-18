import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const trelloLinearMap = pgTable("trello_linear_map", {
	id: serial("id").primaryKey(),
	trelloCardId: text("trello_card_id").notNull().unique(),
	linearIssueId: text("linear_issue_id").unique(),
	lastSyncSource: text("last_sync_source"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
	id: serial("id").primaryKey(),
	source: text("source").notNull(),
	eventType: text("event_type").notNull(),
	trelloCardId: text("trello_card_id"),
	linearIssueId: text("linear_issue_id"),
	status: text("status").notNull(),
	error: text("error"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});
