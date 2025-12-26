/**
 * WYA!? — Error Tracking Hooks (Alpha)
 * 
 * Purpose: Track errors before they become user-facing problems
 * 
 * Feel: Proactive, informative, non-intrusive
 * - Capture errors at source
 * - Preserve context for debugging
 * - No user disruption
 * - Actionable error information
 */

import { logError } from './logger';

/**
 * Track error with context
 * @param {Error|string} error - Error object or message
 * @param {object} context - Error context
 * @param {object} options - Tracking options
 */
export function trackError(error, context = {}, options = {}) {
  const {
    severity = 'error',
    tags = [],
    userId = null,
    requestId = null,
  } = options;

  const errorData = {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : { message: String(error) },
    context,
    severity,
    tags,
    userId,
    requestId,
    timestamp: new Date().toISOString(),
  };

  // Log error
  logError('Error tracked', errorData, context);

  // TODO: Beta+ - Send to error tracking service (Sentry, etc.)
  // For Alpha, logging is sufficient

  return errorData;
}

/**
 * Track API error
 * @param {Error} error - Error object
 * @param {object} request - Request context
 */
export function trackApiError(error, request = {}) {
  return trackError(error, {
    type: 'api_error',
    method: request.method,
    path: request.path,
    statusCode: request.statusCode,
  }, {
    severity: request.statusCode >= 500 ? 'error' : 'warn',
    tags: ['api', 'error'],
    requestId: request.requestId,
    userId: request.userId,
  });
}

/**
 * Track database error
 * @param {Error} error - Error object
 * @param {object} query - Query context
 */
export function trackDatabaseError(error, query = {}) {
  return trackError(error, {
    type: 'database_error',
    query: query.sql || query.query || 'unknown',
    // Don't log full query in production (security)
    queryPreview: process.env.NODE_ENV === 'production' 
      ? query.sql?.substring(0, 100) 
      : query.sql,
  }, {
    severity: 'error',
    tags: ['database', 'error'],
  });
}

/**
 * Track client-side error (for React error boundaries)
 * @param {Error} error - Error object
 * @param {object} errorInfo - React error info
 */
export function trackClientError(error, errorInfo = {}) {
  return trackError(error, {
    type: 'client_error',
    componentStack: errorInfo.componentStack,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
  }, {
    severity: 'error',
    tags: ['client', 'error'],
  });
}

/**
 * Track validation error
 * @param {Error|string} error - Error object or message
 * @param {object} validation - Validation context
 */
export function trackValidationError(error, validation = {}) {
  return trackError(error, {
    type: 'validation_error',
    field: validation.field,
    value: validation.value,
    rule: validation.rule,
  }, {
    severity: 'warn',
    tags: ['validation', 'error'],
  });
}

/**
 * Track rate limit hit
 * @param {string} userId - User ID
 * @param {string} action - Action being rate limited
 */
export function trackRateLimit(userId, action) {
  logError('Rate limit hit', {
    type: 'rate_limit',
    userId,
    action,
  });
}

/**
 * Track safety violation attempt
 * @param {string} userId - User ID
 * @param {string} violation - Violation type
 * @param {object} context - Violation context
 */
export function trackSafetyViolation(userId, violation, context = {}) {
  trackError(new Error(`Safety violation: ${violation}`), {
    type: 'safety_violation',
    userId,
    violation,
    ...context,
  }, {
    severity: 'warn',
    tags: ['safety', 'violation'],
  });
}

