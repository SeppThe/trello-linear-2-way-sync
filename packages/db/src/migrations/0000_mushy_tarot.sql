CREATE TABLE "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"event_type" text NOT NULL,
	"trello_card_id" text,
	"linear_issue_id" text,
	"status" text NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trello_linear_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"trello_card_id" text NOT NULL,
	"linear_issue_id" text,
	"last_sync_source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trello_linear_map_trello_card_id_unique" UNIQUE("trello_card_id"),
	CONSTRAINT "trello_linear_map_linear_issue_id_unique" UNIQUE("linear_issue_id")
);
