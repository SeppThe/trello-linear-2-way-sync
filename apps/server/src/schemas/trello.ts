import { z } from "zod";

const trelloActionSchema = z.looseObject({
	id: z.string().optional(),
	type: z.string().optional(),
	date: z.string().optional(),
	data: z
		.looseObject({
			card: z
				.looseObject({
					id: z.string().optional(),
					name: z.string().optional(),
					idShort: z.number().optional(),
					shortLink: z.string().optional(),
					idList: z.string().optional(),
					pos: z.number().optional(),
				})
				.optional(),

			list: z
				.looseObject({
					id: z.string().optional(),
					name: z.string().optional(),
				})
				.optional(),

			board: z
				.looseObject({
					id: z.string().optional(),
					name: z.string().optional(),
					shortLink: z.string().optional(),
				})
				.optional(),

			old: z.record(z.string(), z.unknown()).optional(),
			listBefore: z
				.looseObject({
					id: z.string().optional(),
					name: z.string().optional(),
				})
				.optional(),

			listAfter: z
				.looseObject({
					id: z.string().optional(),
					name: z.string().optional(),
				})
				.optional(),
		})
		.optional(),
});

export const trelloWebhookSchema = z.looseObject({
	action: trelloActionSchema.optional(),
	model: z.unknown().optional(),
	webhook: z.unknown().optional(),
});

export type TrelloWebhook = z.infer<typeof trelloWebhookSchema>;
