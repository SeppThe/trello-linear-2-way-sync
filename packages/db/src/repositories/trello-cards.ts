import { eq } from "drizzle-orm";

import { db } from "../client";
import { trelloCards } from "../schema";

export type TrelloCard = typeof trelloCards.$inferSelect;
export type NewTrelloCard = typeof trelloCards.$inferInsert;
export type TrelloCardUpdate = Partial<
	Omit<NewTrelloCard, "id" | "createdAt" | "updatedAt">
>;

export async function getTrelloCardById(id: string) {
	const [card] = await db
		.select()
		.from(trelloCards)
		.where(eq(trelloCards.id, id))
		.limit(1);

	return card ?? null;
}

export async function createTrelloCard(card: NewTrelloCard) {
	const [created] = await db.insert(trelloCards).values(card).returning();

	return created;
}

export async function updateTrelloCard(id: string, updates: TrelloCardUpdate) {
	const [updated] = await db
		.update(trelloCards)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(trelloCards.id, id))
		.returning();

	return updated ?? null;
}

export async function upsertTrelloCard(card: NewTrelloCard) {
	const { id, createdAt, updatedAt, ...updates } = card;

	const [upserted] = await db
		.insert(trelloCards)
		.values(card)
		.onConflictDoUpdate({
			target: trelloCards.id,
			set: {
				...updates,
				updatedAt: new Date(),
			},
		})
		.returning();

	return upserted;
}

export async function deleteTrelloCard(id: string) {
	const [deleted] = await db
		.delete(trelloCards)
		.where(eq(trelloCards.id, id))
		.returning();

	return deleted ?? null;
}
