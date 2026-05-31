CREATE TABLE "comment_mappings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"trello_action_id" text NOT NULL,
	"trello_card_id" text NOT NULL,
	"linear_issue_id" text NOT NULL,
	"linear_comment_id" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_mappings_trello_action_id_unique" UNIQUE("trello_action_id"),
	CONSTRAINT "comment_mappings_linear_comment_id_unique" UNIQUE("linear_comment_id")
);
--> statement-breakpoint
ALTER TABLE "comment_mappings" ADD CONSTRAINT "comment_mappings_trello_card_id_trello_cards_id_fk" FOREIGN KEY ("trello_card_id") REFERENCES "public"."trello_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_mappings" ADD CONSTRAINT "comment_mappings_linear_issue_id_linear_issues_id_fk" FOREIGN KEY ("linear_issue_id") REFERENCES "public"."linear_issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_mappings_trello_action_id_idx" ON "comment_mappings" USING btree ("trello_action_id");--> statement-breakpoint
CREATE INDEX "comment_mappings_trello_card_id_idx" ON "comment_mappings" USING btree ("trello_card_id");--> statement-breakpoint
CREATE INDEX "comment_mappings_linear_issue_id_idx" ON "comment_mappings" USING btree ("linear_issue_id");