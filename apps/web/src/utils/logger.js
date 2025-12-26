/**
 * WYA!? — Structured Logging Utilities (Alpha)
 * 
 * Purpose: See problems before users leave
 * 
 * Feel: Calm, informative, actionable
 * - Structured logs for easy parsing
 * - Context preserved for debugging
 * - No noise, only signal
 * - Respects log levels
 * 
 * Log Levels:
 * - error: Critical errors requiring attention
 * - warn: Warnings that might indicate issues
 * - info: Informational messages (important events)
 * - debug: Debug information (development only)
 */

/**
 * Log levels (from most to least severe)
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Current log level (from env or default)
 */
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;

/**
 * Create structured log entry
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} context - Additional context
 * @returns {object} Structured log entry
 */
function createLogEntry(level, message, context = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    // Add environment context
    env: process.env.NODE_ENV || 'development',
    // Add request context if available (set by middleware)
    requestId: global.requestId || null,
    userId: global.userId || null,
  };
}

/**
 * Log error
 * @param {string} message - Error message
 * @param {Error|object} error - Error object or context
 * @param {object} context - Additional context
 */
export function logError(message, error = {}, context = {}) {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.error) return;

  const errorContext = {
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  };

  const logEntry = createLogEntry('error', message, errorContext);

  // Console output (structured)
  console.error(JSON.stringify(logEntry));

  // TODO: Beta+ - Send to error tracking service (Sentry, etc.)
  // For Alpha, console is sufficient
}

/**
 * Log warning
 * @param {string} message - Warning message
 * @param {object} context - Additional context
 */
export function logWarn(message, context = {}) {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.warn) return;

  const logEntry = createLogEntry('warn', message, context);
  console.warn(JSON.stringify(logEntry));
}

/**
 * Log info
 * @param {string} message - Info message
 * @param {object} context - Additional context
 */
export function logInfo(message, context = {}) {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.info) return;

  const logEntry = createLogEntry('info', message, context);
  console.log(JSON.stringify(logEntry));
}

/**
 * Log debug (development only)
 * @param {string} message - Debug message
 * @param {object} context - Additional context
 */
export function logDebug(message, context = {}) {
  if (CURRENT_LOG_LEVEL > LOG_LEVELS.debug) return;
  if (process.env.NODE_ENV === 'production') return; // Never log debug in production

  const logEntry = createLogEntry('debug', message, context);
  console.debug(JSON.stringify(logEntry));
}

/**
 * Log API request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 * @param {object} context - Additional context
 */
export function logApiRequest(method, path, statusCode, duration, context = {}) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  const logEntry = createLogEntry(level, 'API Request', {
    method,
    path,
    statusCode,
    duration,
    ...context,
  });

  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Log user action (for analytics/debugging)
 * @param {string} action - Action name
 * @param {string} userId - User ID
 * @param {object} context - Additional context
 */
export function logUserAction(action, userId, context = {}) {
  logInfo(`User Action: ${action}`, {
    action,
    userId,
    ...context,
  });
}

/**
 * Log performance metric
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {string} unit - Unit (ms, bytes, etc.)
 * @param {object} context - Additional context
 */
export function logMetric(metric, value, unit = 'ms', context = {}) {
  logInfo(`Metric: ${metric}`, {
    metric,
    value,
    unit,
    ...context,
  });
}

/**
 * Set request context (call in middleware)
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID
 */
export function setRequestContext(requestId, userId) {
  global.requestId = requestId;
  global.userId = userId;
}

/**
 * Clear request context (call after request)
 */
export function clearRequestContext() {
  global.requestId = null;
  global.userId = null;
}

