import { serve } from "@hono/node-server";
import serverApp from "./build/server/index.js";

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";

const app = await serverApp;
serve({
  fetch: app.fetch,
  port: parseInt(port, 10),
  hostname: host,
}, (info) => {
  console.log(`✅ Server running on http://${info.address}:${info.port}`);
});

