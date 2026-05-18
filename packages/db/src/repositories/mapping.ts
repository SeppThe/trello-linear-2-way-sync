import { eq } from "drizzle-orm";
import { db } from "../index";
import { trelloLinearMap } from "../schema";

export type TrelloLinearMapping = typeof trelloLinearMap.$inferSelect;

export type CreateMappingInput = {
	trelloCardId: string;
	linearIssueId?: string | null;
	lastSyncSource?: string | null;
};

export type UpdateMappingInput = Partial<{
	linearIssueId: string | null;
	lastSyncSource: string | null;
}>;

export async function getMappingByTrelloCardId(
	trelloCardId: string,
): Promise<TrelloLinearMapping | undefined> {
	const [mapping] = await db
		.select()
		.from(trelloLinearMap)
		.where(eq(trelloLinearMap.trelloCardId, trelloCardId))
		.limit(1);

	return mapping;
}

export async function getMappingByLinearIssueId(
	linearIssueId: string,
): Promise<TrelloLinearMapping | undefined> {
	const [mapping] = await db
		.select()
		.from(trelloLinearMap)
		.where(eq(trelloLinearMap.linearIssueId, linearIssueId))
		.limit(1);

	return mapping;
}

export async function createMapping(
	input: CreateMappingInput,
): Promise<TrelloLinearMapping> {
	const [mapping] = await db
		.insert(trelloLinearMap)
		.values({
			trelloCardId: input.trelloCardId,
			linearIssueId: input.linearIssueId ?? null,
			lastSyncSource: input.lastSyncSource ?? null,
		})
		.returning();

	if (!mapping) {
		throw new Error("Failed to create Trello/Linear mapping");
	}

	return mapping;
}

export async function updateMapping(
	trelloCardId: string,
	input: UpdateMappingInput,
): Promise<TrelloLinearMapping | undefined> {
	const [mapping] = await db
		.update(trelloLinearMap)
		.set({
			...input,
			updatedAt: new Date(),
		})
		.where(eq(trelloLinearMap.trelloCardId, trelloCardId))
		.returning();

	return mapping;
}
