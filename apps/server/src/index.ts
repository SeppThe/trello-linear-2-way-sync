import { env } from "@Trello-Linear-2-way-sync/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import trelloRoutes from "./routes/trello";
import linearRoutes from "./routes/linear";

const app = new Hono();

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

import { serve } from "@hono/node-server";

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
