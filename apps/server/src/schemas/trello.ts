import { z } from 'zod';

export const trelloWebhookSchema = z.object({
    action: z.object({
        id: z.string().uuid(),
        type: z.string().max(100),
        data: z.object({
            card: z.object({
                id: z.string().uuid(),
                name: z.string().max(200),
            }).optional(),
        }),
    }),
    model: z.unknown().optional(),
    webhook: z.unknown().optional(),
});

export type TrelloWebhook = z.infer<typeof trelloWebhookSchema>;