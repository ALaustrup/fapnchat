/**
 * WYA!? — Server Entry Point (Alpha)
 * 
 * Purpose: Production server startup with validation and graceful shutdown
 * 
 * Alpha-Only Decisions:
 * 
 * 1. Inline environment validation
 *    - Why: Runs before build, simpler than separate module
 *    - Future: Move to shared validation module if needed elsewhere
 * 
 * 2. 10s shutdown timeout
 *    - Why: Alpha has minimal cleanup (DB connections, WebSockets)
 *    - Future: Tune based on actual cleanup time, add progress reporting
 * 
 * 3. Basic error handling
 *    - Why: Fail fast, clear errors, sufficient for Alpha
 *    - Future: Retry logic, circuit breakers, health checks during shutdown
 * 
 * 4. No connection draining
 *    - Why: Alpha traffic is low, simple shutdown is fine
 *    - Future: Stop accepting new requests, wait for active to finish
 */

import { serve } from "@hono/node-server";

/**
 * Validate required environment variables
 * Alpha: Fail fast on missing critical vars
 */
function validateEnv() {
  const required = ['DATABASE_URL', 'AUTH_SECRET', 'NEXT_PUBLIC_APP_URL'];
  const errors = [];

  for (const varName of required) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
      continue;
    }

    // Specific validations
    if (varName === 'DATABASE_URL') {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        errors.push(`Invalid DATABASE_URL: must start with postgresql:// or postgres://`);
      }
    }

    if (varName === 'AUTH_SECRET' && value.length < 32) {
      errors.push(`AUTH_SECRET must be at least 32 characters long`);
    }

    if (varName === 'NEXT_PUBLIC_APP_URL') {
      try {
        new URL(value);
      } catch {
        errors.push(`Invalid NEXT_PUBLIC_APP_URL: must be a valid URL`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('❌ Environment variable validation failed:');
    errors.forEach(error => console.error(`   - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  console.log('✅ Environment variables validated');
}

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  console.error("❌ Environment validation failed:", error.message);
  process.exit(1);
}

const port = parseInt(process.env.PORT || "4000", 10);
const host = process.env.HOST || "0.0.0.0";

let server = null;
let shutdownInProgress = false;

/**
 * Graceful shutdown handler
 * Closes server and cleans up resources
 */
async function gracefulShutdown(signal) {
  if (shutdownInProgress) {
    console.log(`Received ${signal} again, forcing exit...`);
    process.exit(1);
  }

  shutdownInProgress = true;
  console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

  // Give connections 10 seconds to close
  const shutdownTimeout = setTimeout(() => {
    console.error("⚠️  Shutdown timeout exceeded, forcing exit");
    process.exit(1);
  }, 10000);

  try {
    // Close server (stops accepting new connections)
    if (server) {
      console.log("Closing server...");
      await new Promise((resolve) => {
        server.close(() => {
          console.log("✅ Server closed");
          resolve();
        });
      });
    }

    // TODO: Close database connections
    // TODO: Close WebSocket connections
    // These should be handled by the app's cleanup handlers

    clearTimeout(shutdownTimeout);
    console.log("✅ Graceful shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
try {
  console.log("📦 Importing server module...");
  const serverApp = await import("./build/server/index.js");
  console.log("✅ Server module imported");
  
  const app = await serverApp.default;
  
  if (!app || typeof app.fetch !== 'function') {
    console.error("❌ Invalid server export. Expected object with fetch method.");
    console.error("Got:", typeof app);
    process.exit(1);
  }
  
  console.log(`🚀 Starting server on ${host}:${port}...`);
  server = serve({
    fetch: app.fetch,
    port,
    hostname: host,
  }, (info) => {
    console.log(`✅ Server running on http://${info.address}:${info.port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Alpha deployment ready`);
  });
} catch (error) {
  console.error("❌ Failed to start server:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
}

