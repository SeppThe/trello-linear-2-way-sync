import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	TRELLO_API_KEY: z.string().min(1),
	TRELLO_TOKEN: z.string().min(1),
	TRELLO_WEBHOOK_CALLBACK_URL: z
		.string()
		.url()
		.default("https://trello-linear-sync.onrender.com/webhooks/trello"),
	TRELLO_BOARD_ID: z.string().min(1).default("69fccdca1ade3ad28e81581b"),
});

const env = envSchema.parse(process.env);

const formData = new URLSearchParams({
	description: "Trello Linear Sync",
	callbackURL: env.TRELLO_WEBHOOK_CALLBACK_URL,
	idModel: env.TRELLO_BOARD_ID,
});

const url = new URL(
	`https://api.trello.com/1/tokens/${env.TRELLO_TOKEN}/webhooks/`,
);
url.searchParams.set("key", env.TRELLO_API_KEY);

const response = await fetch(url, {
	method: "POST",
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	},
	body: formData,
});

const responseBody = await response.text();

if (!response.ok) {
	console.error("Failed to register Trello webhook:", {
		status: response.status,
		statusText: response.statusText,
		body: responseBody,
	});
	process.exit(1);
}

console.log("Registered Trello webhook:", responseBody);
