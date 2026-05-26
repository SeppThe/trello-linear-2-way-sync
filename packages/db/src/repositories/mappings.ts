import { eq } from "drizzle-orm";

import { db } from "../client";
import { trelloLinearMappings } from "../schema";

export type TrelloLinearMapping = typeof trelloLinearMappings.$inferSelect;
export type NewTrelloLinearMapping = typeof trelloLinearMappings.$inferInsert;
export type TrelloLinearMappingUpdate = Partial<
	Omit<NewTrelloLinearMapping, "id" | "createdAt" | "updatedAt">
>;

export async function getMappingById(id: number) {
	const [mapping] = await db
		.select()
		.from(trelloLinearMappings)
		.where(eq(trelloLinearMappings.id, id))
		.limit(1);

	return mapping ?? null;
}

export async function getMappingByTrelloCardId(trelloCardId: string) {
	const [mapping] = await db
		.select()
		.from(trelloLinearMappings)
		.where(eq(trelloLinearMappings.trelloCardId, trelloCardId))
		.limit(1);

	return mapping ?? null;
}

export async function getMappingByLinearIssueId(linearIssueId: string) {
	const [mapping] = await db
		.select()
		.from(trelloLinearMappings)
		.where(eq(trelloLinearMappings.linearIssueId, linearIssueId))
		.limit(1);

	return mapping ?? null;
}

export async function createMapping(mapping: NewTrelloLinearMapping) {
	const [created] = await db
		.insert(trelloLinearMappings)
		.values(mapping)
		.returning();

	return created;
}

export async function updateMappingById(
	id: number,
	updates: TrelloLinearMappingUpdate,
) {
	const [updated] = await db
		.update(trelloLinearMappings)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(trelloLinearMappings.id, id))
		.returning();

	return updated ?? null;
}

export async function updateMappingByTrelloCardId(
	trelloCardId: string,
	updates: TrelloLinearMappingUpdate,
) {
	const [updated] = await db
		.update(trelloLinearMappings)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(trelloLinearMappings.trelloCardId, trelloCardId))
		.returning();

	return updated ?? null;
}

export async function updateMappingByLinearIssueId(
	linearIssueId: string,
	updates: TrelloLinearMappingUpdate,
) {
	const [updated] = await db
		.update(trelloLinearMappings)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(trelloLinearMappings.linearIssueId, linearIssueId))
		.returning();

	return updated ?? null;
}

export async function upsertMappingByTrelloCardId(
	mapping: NewTrelloLinearMapping,
) {
	const { id, createdAt, updatedAt, ...updates } = mapping;

	const [upserted] = await db
		.insert(trelloLinearMappings)
		.values(mapping)
		.onConflictDoUpdate({
			target: trelloLinearMappings.trelloCardId,
			set: {
				...updates,
				updatedAt: new Date(),
			},
		})
		.returning();

	return upserted;
}

export async function deleteMappingByTrelloCardId(trelloCardId: string) {
	const [deleted] = await db
		.delete(trelloLinearMappings)
		.where(eq(trelloLinearMappings.trelloCardId, trelloCardId))
		.returning();

	return deleted ?? null;
}

export async function deleteMappingByLinearIssueId(linearIssueId: string) {
	const [deleted] = await db
		.delete(trelloLinearMappings)
		.where(eq(trelloLinearMappings.linearIssueId, linearIssueId))
		.returning();

	return deleted ?? null;
}
