import { eq } from "drizzle-orm";

import { db } from "../client";
import { commentMappings } from "../schema";

export type CommentMapping = typeof commentMappings.$inferSelect;
export type NewCommentMapping = typeof commentMappings.$inferInsert;

export async function getCommentMappingByTrelloActionId(
	trelloActionId: string,
) {
	const [mapping] = await db
		.select()
		.from(commentMappings)
		.where(eq(commentMappings.trelloActionId, trelloActionId))
		.limit(1);

	return mapping ?? null;
}

export async function getCommentMappingByLinearCommentId(
	linearCommentId: string,
) {
	const [mapping] = await db
		.select()
		.from(commentMappings)
		.where(eq(commentMappings.linearCommentId, linearCommentId))
		.limit(1);

	return mapping ?? null;
}

export async function createCommentMapping(mapping: NewCommentMapping) {
	const [created] = await db
		.insert(commentMappings)
		.values(mapping)
		.returning();

	return created;
}

export async function deleteCommentMappingByTrelloActionId(
	trelloActionId: string,
) {
	const [deleted] = await db
		.delete(commentMappings)
		.where(eq(commentMappings.trelloActionId, trelloActionId))
		.returning();

	return deleted ?? null;
}
