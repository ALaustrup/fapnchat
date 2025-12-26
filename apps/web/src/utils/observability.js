/**
 * WYA!? — Observability Utilities (Alpha)
 * 
 * Purpose: Central observability helpers
 * 
 * Combines logging, error tracking, and feature flags
 * for easy use throughout the application.
 */

export * from './logger';
export * from './errorTracking';
export * from './featureFlags';

/**
 * Middleware helper: Wrap API route with observability
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withObservability(handler) {
  return async (request, context) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const { setRequestContext, clearRequestContext, logApiRequest, trackApiError } = await import('./observability');

    try {
      // Set request context
      const session = await import('@/auth').then(m => m.auth());
      setRequestContext(requestId, session?.user?.id || null);

      // Call handler
      const response = await handler(request, context);

      // Log successful request
      const duration = Date.now() - startTime;
      logApiRequest(
        request.method,
        new URL(request.url).pathname,
        response.status,
        duration
      );

      return response;
    } catch (error) {
      // Track error
      const duration = Date.now() - startTime;
      trackApiError(error, {
        method: request.method,
        path: new URL(request.url).pathname,
        requestId,
        duration,
      });

      // Return error response
      return Response.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    } finally {
      // Clear request context
      clearRequestContext();
    }
  };
}

