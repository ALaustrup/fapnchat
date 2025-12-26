import { serve } from "@hono/node-server";
import { f as fetchHandler } from "./build/server/index.js";

const port = Number(process.env.PORT) || 4000;

serve({
  fetch: fetchHandler,
  port,
});

