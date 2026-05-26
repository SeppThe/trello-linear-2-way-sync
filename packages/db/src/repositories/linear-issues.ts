import { eq } from "drizzle-orm";

import { db } from "../client";
import { linearIssues } from "../schema";

export type LinearIssue = typeof linearIssues.$inferSelect;
export type NewLinearIssue = typeof linearIssues.$inferInsert;
export type LinearIssueUpdate = Partial<
	Omit<NewLinearIssue, "id" | "createdAt" | "updatedAt">
>;

export async function getLinearIssueById(id: string) {
	const [issue] = await db
		.select()
		.from(linearIssues)
		.where(eq(linearIssues.id, id))
		.limit(1);

	return issue ?? null;
}

export async function createLinearIssue(issue: NewLinearIssue) {
	const [created] = await db.insert(linearIssues).values(issue).returning();

	return created;
}

export async function updateLinearIssue(
	id: string,
	updates: LinearIssueUpdate,
) {
	const [updated] = await db
		.update(linearIssues)
		.set({
			...updates,
			updatedAt: new Date(),
		})
		.where(eq(linearIssues.id, id))
		.returning();

	return updated ?? null;
}

export async function upsertLinearIssue(issue: NewLinearIssue) {
	const { id, createdAt, updatedAt, ...updates } = issue;

	const [upserted] = await db
		.insert(linearIssues)
		.values(issue)
		.onConflictDoUpdate({
			target: linearIssues.id,
			set: {
				...updates,
				updatedAt: new Date(),
			},
		})
		.returning();

	return upserted;
}

export async function deleteLinearIssue(id: string) {
	const [deleted] = await db
		.delete(linearIssues)
		.where(eq(linearIssues.id, id))
		.returning();

	return deleted ?? null;
}
