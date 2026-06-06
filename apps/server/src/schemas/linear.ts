import { z } from "zod";

const linearStateSchema = z.looseObject({
	id: z.string().optional(),
	name: z.string().optional(),
	type: z.string().optional(),
});

const linearTeamSchema = z.looseObject({
	id: z.string().optional(),
	name: z.string().optional(),
	key: z.string().optional(),
});

const linearIssueSchema = z.looseObject({
	id: z.string(),
	identifier: z.string().optional(),
	title: z.string().optional(),
	description: z.string().nullable().optional(),
	priority: z.number().nullable().optional(),
	dueDate: z.string().nullable().optional(),
	archived: z.boolean().optional(),
	archivedAt: z.string().nullable().optional(),
	state: linearStateSchema.nullable().optional(),
	team: linearTeamSchema.nullable().optional(),
});

export const linearWebhookSchema = z.looseObject({
	action: z.string().optional(),
	type: z.string().optional(),
	data: linearIssueSchema.optional(),
	updatedFrom: z.record(z.string(), z.unknown()).optional(),
	createdAt: z.string().optional(),
	url: z.string().optional(),
	organizationId: z.string().optional(),
	webhookTimestamp: z.number().optional(),
	webhookId: z.string().optional(),
	actor: z
		.looseObject({
			id: z.string().optional(),
			type: z.string().optional(),
			name: z.string().optional(),
			email: z.string().optional(),
			url: z.string().optional(),
		})
		.optional(),
});

export type LinearWebhook = z.infer<typeof linearWebhookSchema>;
