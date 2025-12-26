import { serve } from "@hono/node-server";
import handler from "./build/server/index.js";

const port = Number(process.env.PORT) || 4000;

serve({
  fetch: handler,
  port,
});

