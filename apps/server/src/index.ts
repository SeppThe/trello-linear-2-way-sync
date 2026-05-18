import { env } from "@Trello-Linear-2-way-sync/env/server";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import linearRoutes from "./routes/linear";
import trelloRoutes from "./routes/trello";

const app = new Hono();
const port = Number(process.env.PORT) || 3000;

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

app.route("/webhooks/trello", trelloRoutes);
app.route("/webhooks/linear", linearRoutes);

serve(
	{
		fetch: app.fetch,
		port: port,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
