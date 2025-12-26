import { serve } from "@hono/node-server";
import serverModule from "./build/server/index.js";

const port = Number(process.env.PORT) || 4000;

try {
  const server = await serverModule.default;
  console.log("Server type:", typeof server);
  console.log("Server keys:", Object.keys(server || {}));
  
  if (!server || typeof server.fetch !== 'function') {
    console.error("Server does not have fetch method");
    console.error("Server:", server);
    process.exit(1);
  }
  
  console.log("Starting server on port", port);
  serve({
    fetch: server.fetch,
    port,
  });
} catch (error) {
  console.error("Error starting server:", error);
  console.error(error.stack);
  process.exit(1);
}

