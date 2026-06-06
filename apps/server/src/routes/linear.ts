import { env } from "@Trello-Linear-2-way-sync/env/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { parseLinearEvents } from "@/parser/linear";
import { linearWebhookSchema } from "@/schemas/linear";
import { handleLinearWebhook } from "@/services/linear-webhook.service";

const linearRoutes = new Hono();
const LINEAR_REPLAY_WINDOW_MS = 60_000;

function verifyLinearSignature(rawBody: string, signatureHeader?: string) {
	if (!env.LINEAR_WEBHOOK_SECRET) {
		return true;
	}

	if (!signatureHeader) {
		return false;
	}

	if (!/^[\da-f]+$/i.test(signatureHeader)) {
		return false;
	}

	const headerSignature = Buffer.from(signatureHeader, "hex");
	const computedSignature = createHmac("sha256", env.LINEAR_WEBHOOK_SECRET)
		.update(rawBody)
		.digest();

	if (headerSignature.length !== computedSignature.length) {
		return false;
	}

	return timingSafeEqual(computedSignature, headerSignature);
}

function isCurrentLinearWebhook(timestamp?: number) {
	if (!env.LINEAR_WEBHOOK_SECRET) {
		return true;
	}

	if (typeof timestamp !== "number") {
		return false;
	}

	return Math.abs(Date.now() - timestamp) <= LINEAR_REPLAY_WINDOW_MS;
}

linearRoutes.post("/", async (c) => {
	const rawBody = await c.req.text();
	const signature = c.req.header("Linear-Signature");
	const deliveryId = c.req.header("Linear-Delivery");
	const linearEvent = c.req.header("Linear-Event");

	if (!verifyLinearSignature(rawBody, signature)) {
		console.warn("Invalid Linear webhook signature:", {
			deliveryId,
			linearEvent,
		});
		return c.json({ ok: false }, 401);
	}

	let rawPayload: unknown;

	try {
		rawPayload = JSON.parse(rawBody);
	} catch (error) {
		console.error("Invalid Linear webhook JSON:", error);
		return c.json({ ok: true });
	}

	const result = linearWebhookSchema.safeParse(rawPayload);

	if (!result.success) {
		console.error("Invalid Linear webhook:", result.error.issues);
		return c.json({ ok: true });
	}

	const body = result.data;
	const issue = body.data;

	if (!isCurrentLinearWebhook(body.webhookTimestamp)) {
		console.warn("Stale Linear webhook timestamp:", {
			deliveryId,
			linearEvent,
			webhookTimestamp: body.webhookTimestamp,
		});
		return c.json({ ok: false }, 401);
	}

	console.log("Linear webhook received:", {
		deliveryId,
		linearEvent,
		webhookId: body.webhookId,
		action: body.action,
		type: body.type,
		issueId: issue?.id,
		linkedIssueId: issue?.issueId,
		identifier: issue?.identifier,
		title: issue?.title,
		commentBody: issue?.body,
		url: body.url,
		updatedFrom: body.updatedFrom,
		actor: body.actor,
	});

	const events = parseLinearEvents(body);
	console.log("Parsed Linear events:", events);
	await handleLinearWebhook(events);

	return c.json({ ok: true });
});

export default linearRoutes;
