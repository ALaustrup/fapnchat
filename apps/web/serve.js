import { serve } from "@hono/node-server";
import server from "./build/server/index.js";

const port = Number(process.env.PORT) || 4000;

serve({
  fetch: server.fetch,
  port,
});

