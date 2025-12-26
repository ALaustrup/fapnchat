/**
 * WYA!? — Health Check Endpoint (Alpha)
 * 
 * Purpose: Simple health check for deployment monitoring
 * 
 * Endpoint: GET /api/health
 * 
 * Alpha-Only Decisions:
 * 
 * 1. Basic database connectivity check only
 *    - Why: Simple SELECT 1 query is sufficient for Alpha
 *    - Future: Connection pool status, query performance, replication lag
 * 
 * 2. No memory/CPU checks
 *    - Why: PM2 handles memory limits, no need to duplicate
 *    - Future: Memory usage, CPU load, disk space
 * 
 * 3. No dependency health checks
 *    - Why: Alpha has minimal external dependencies
 *    - Future: Redis, CDN, external APIs, WebSocket status
 * 
 * 4. Simple response format
 *    - Why: Easy to parse, sufficient for monitoring
 *    - Future: Detailed metrics, historical data, alerts
 */

import sql from "@/app/api/utils/sql";

/**
 * GET /api/health
 * 
 * Response:
 * {
 *   status: "healthy" | "unhealthy",
 *   timestamp: ISO string,
 *   version: "alpha",
 *   uptime: seconds
 * }
 */
export async function GET() {
  const startTime = Date.now();
  let healthy = true;
  const checks = {
    server: true,
    database: false,
  };

  try {
    // Basic database connectivity check
    // Alpha: Simple query to verify DB connection
    await sql`SELECT 1 as health_check`;
    checks.database = true;
  } catch (error) {
    console.error("Health check: Database check failed", error);
    healthy = false;
  }

  const responseTime = Date.now() - startTime;

  const status = healthy ? 200 : 503;
  const body = {
    status: healthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: "alpha",
    checks,
    responseTime: `${responseTime}ms`,
  };

  return Response.json(body, { status });
}

