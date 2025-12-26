import { serve } from "@hono/node-server";
import serverModule from "./build/server/index.js";

const port = Number(process.env.PORT) || 4000;

const server = await serverModule.default;

serve({
  fetch: server.fetch,
  port,
});

