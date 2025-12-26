/**
 * WYA!? — Observability Middleware (Alpha)
 * 
 * Purpose: Add observability to all API routes
 * 
 * Features:
 * - Request ID generation
 * - Request context setting
 * - API request logging
 * - Error tracking
 * 
 * Note: This is a utility, not actual middleware.
 * Wrap your API handlers with this function.
 */

import { setRequestContext, clearRequestContext, logApiRequest, trackApiError } from '@/utils/observability';

/**
 * Observability middleware
 * Adds request context and logging to API routes
 * 
 * Usage:
 * export async function GET(request) {
 *   return withObservability(async (req) => {
 *     // Your handler code
 *   })(request);
 * }
 */
export function withObservability(handler) {
  return async (request, context) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Import auth to get user ID
    let userId = null;
    try {
      const { auth } = await import('@/auth');
      const session = await auth();
      userId = session?.user?.id || null;
    } catch (err) {
      // Auth might fail, continue without user ID
    }

    // Set request context
    setRequestContext(requestId, userId);

    try {
      // Call handler
      const response = await handler(request, context);

      // Log successful request
      const duration = Date.now() - startTime;
      const url = new URL(request.url);
      
      logApiRequest(
        request.method,
        url.pathname,
        response.status || 200,
        duration,
        {
          requestId,
          userId,
        }
      );

      return response;
    } catch (error) {
      // Track error
      const duration = Date.now() - startTime;
      const url = new URL(request.url);
      
      trackApiError(error, {
        method: request.method,
        path: url.pathname,
        requestId,
        userId,
        duration,
      });

      // Re-throw to let error boundary handle it
      throw error;
    } finally {
      // Clear request context
      clearRequestContext();
    }
  };
}

