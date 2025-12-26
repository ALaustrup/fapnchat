import { serve } from "@hono/node-server";

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";

try {
  console.log("Importing server module...");
  const serverApp = await import("./build/server/index.js");
  console.log("Server module imported, default export type:", typeof serverApp.default);
  
  const app = await serverApp.default;
  console.log("App resolved, type:", typeof app);
  console.log("App keys:", Object.keys(app || {}));
  
  if (!app || typeof app.fetch !== 'function') {
    console.error("Invalid server export. Expected object with fetch method.");
    console.error("Got:", typeof app);
    process.exit(1);
  }
  
  console.log("Starting server on", host + ":" + port);
  serve({
    fetch: app.fetch,
    port: parseInt(port, 10),
    hostname: host,
  }, (info) => {
    console.log(`✅ Server running on http://${info.address}:${info.port}`);
  });
} catch (error) {
  console.error("Failed to start server:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
}

