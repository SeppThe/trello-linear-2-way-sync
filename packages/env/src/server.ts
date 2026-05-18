import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		CORS_ORIGIN: z.url(),
		TRELLO_API_KEY: z.string().min(1).optional(),
		TRELLO_TOKEN: z.string().min(1).optional(),
		TRELLO_SECRET: z.string().min(1).optional(),
		LINEAR_API_KEY: z.string().min(1).optional(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
