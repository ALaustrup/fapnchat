import { serve } from "@hono/node-server";
import serverModule from "./build/server/index.js";

const port = Number(process.env.PORT) || 4000;

const handler = await serverModule.default;

serve({
  fetch: handler.fetch,
  port,
});

