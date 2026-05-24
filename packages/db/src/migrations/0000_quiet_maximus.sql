CREATE TABLE "linear_issues" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text,
	"team_id" text,
	"title" text NOT NULL,
	"description" text,
	"priority" text,
	"due_date" timestamp with time zone,
	"state_name" text,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trello_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text,
	"list_id" text,
	"list_name" text,
	"name" text NOT NULL,
	"description" text,
	"due_date" timestamp with time zone,
	"labels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trello_linear_mappings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"trello_card_id" text NOT NULL,
	"linear_issue_id" text,
	"last_sync_source" text,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trello_linear_mappings_trello_card_id_unique" UNIQUE("trello_card_id"),
	CONSTRAINT "trello_linear_mappings_linear_issue_id_unique" UNIQUE("linear_issue_id")
);
--> statement-breakpoint
ALTER TABLE "trello_linear_mappings" ADD CONSTRAINT "trello_linear_mappings_trello_card_id_trello_cards_id_fk" FOREIGN KEY ("trello_card_id") REFERENCES "public"."trello_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trello_linear_mappings" ADD CONSTRAINT "trello_linear_mappings_linear_issue_id_linear_issues_id_fk" FOREIGN KEY ("linear_issue_id") REFERENCES "public"."linear_issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trello_linear_mappings_trello_card_id_idx" ON "trello_linear_mappings" USING btree ("trello_card_id");--> statement-breakpoint
CREATE INDEX "trello_linear_mappings_linear_issue_id_idx" ON "trello_linear_mappings" USING btree ("linear_issue_id");