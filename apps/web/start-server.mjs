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
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load .env file if it exists
 */
function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      // Parse KEY=VALUE
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // Only set if not already set (env vars take precedence)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    // .env file doesn't exist or can't be read - that's okay, use system env
    if (error.code !== 'ENOENT') {
      console.warn('⚠️  Warning: Could not load .env file:', error.message);
    }
  }
}

// Load .env file before validation
loadEnvFile();

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
  
  // Create server with proper error handling
  let serverReady = false;
  try {
    server = serve({
      fetch: app.fetch,
      port,
      hostname: host,
    }, (info) => {
      console.log(`🚀 Server started on port ${info.port}`);
      console.log(`🌍 http://${info.address}:${info.port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 Alpha deployment ready`);
      serverReady = true;
    });
    
    // Wait for server to actually be ready (callback fired)
    // Give it up to 2 seconds to bind
    for (let i = 0; i < 20 && !serverReady; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!serverReady) {
      console.warn('⚠️  Server callback not fired within 2 seconds, but continuing...');
    }
  } catch (bindError) {
    if (bindError.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
      console.error(`   Please stop any other process using port ${port}`);
      console.error(`   Or change the PORT environment variable`);
      process.exit(1);
    }
    throw bindError;
  }
} catch (error) {
  console.error("❌ Failed to start server:", error);
  console.error("Stack:", error.stack);
  process.exit(1);
}

