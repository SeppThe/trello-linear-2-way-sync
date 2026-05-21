import { z } from "zod";

const trelloLabelSchema = z.looseObject({
	id: z.string().optional(),
	name: z.string().optional(),
	color: z.string().nullable().optional(),
});

const trelloCardSchema = z.looseObject({
	id: z.string().optional(),
	name: z.string().optional(),
	desc: z.string().optional(),
	due: z.string().nullable().optional(),
	closed: z.boolean().optional(),
	labels: z.array(trelloLabelSchema).optional(),
	idShort: z.number().optional(),
	shortLink: z.string().optional(),
	idList: z.string().optional(),
	pos: z.number().optional(),
});

const trelloListSchema = z.looseObject({
	id: z.string().optional(),
	name: z.string().optional(),
});

const trelloActionSchema = z.looseObject({
	id: z.string().optional(),
	type: z.string().optional(),
	date: z.string().optional(),
	data: z
		.looseObject({
			card: trelloCardSchema.optional(),
			label: trelloLabelSchema.optional(),
			list: trelloListSchema.optional(),
			board: z
				.looseObject({
					id: z.string().optional(),
					name: z.string().optional(),
					shortLink: z.string().optional(),
				})
				.optional(),
			old: z.record(z.string(), z.unknown()).optional(),
			listBefore: trelloListSchema.optional(),
			listAfter: trelloListSchema.optional(),
		})
		.optional(),
});

export const trelloWebhookSchema = z.looseObject({
	action: trelloActionSchema.optional(),
	model: z.unknown().optional(),
	webhook: z.unknown().optional(),
});

export type TrelloWebhook = z.infer<typeof trelloWebhookSchema>;
