/**
 * WYA!? — Observability Usage Examples
 * 
 * Purpose: Demonstrate proper usage of observability utilities
 * 
 * This file shows how to use logging, error tracking, and feature flags
 * throughout the application.
 */

import {
  logInfo,
  logError,
  logWarn,
  logDebug,
  logApiRequest,
  logUserAction,
  logMetric,
  trackError,
  trackApiError,
  trackDatabaseError,
  trackClientError,
  isFeatureEnabled,
  requireFeature,
  isKilled,
  isFeatureSafe,
} from './observability';

// ============================================================================
// Example 1: API Route with Observability
// ============================================================================

export async function exampleApiRoute(request) {
  const startTime = Date.now();

  try {
    // Check feature flag
    if (!isFeatureEnabled('group_rooms')) {
      return Response.json({ error: 'Feature disabled' }, { status: 503 });
    }

    // Check kill switch
    if (isKilled('realtime_chat')) {
      logWarn('Realtime chat disabled by kill switch');
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Log user action
    logUserAction('create_group_room', request.userId, {
      room_name: request.body.room_name,
    });

    // Your API logic here
    const result = await createGroupRoom(request.body);

    // Log success
    logInfo('Group room created', {
      room_id: result.id,
      user_id: request.userId,
    });

    // Log performance metric
    const duration = Date.now() - startTime;
    logMetric('group_room_creation', duration, 'ms');

    return Response.json({ room: result });
  } catch (error) {
    // Track error
    trackApiError(error, {
      method: request.method,
      path: request.path,
      userId: request.userId,
    });

    return Response.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

// ============================================================================
// Example 2: Database Operation with Error Tracking
// ============================================================================

export async function exampleDatabaseOperation(userId) {
  try {
    const result = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;
    return result;
  } catch (error) {
    // Track database error
    trackDatabaseError(error, {
      sql: 'SELECT * FROM user_profiles WHERE user_id = ?',
      userId,
    });
    throw error;
  }
}

// ============================================================================
// Example 3: Feature Flag Usage
// ============================================================================

export function exampleComponent() {
  // Check if feature is enabled
  if (!isFeatureEnabled('profile_rooms')) {
    return <div>Feature not available</div>;
  }

  // Safe feature check (respects kill switch)
  if (!isFeatureSafe('realtime_chat')) {
    return <div>Service temporarily unavailable</div>;
  }

  // Require feature (throws if disabled)
  try {
    requireFeature('guestbook');
    return <GuestbookComponent />;
  } catch (error) {
    return <div>Feature disabled</div>;
  }
}

// ============================================================================
// Example 4: React Error Boundary Integration
// ============================================================================

export class ExampleErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Track client-side error
    trackClientError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

// ============================================================================
// Example 5: Validation with Error Tracking
// ============================================================================

import { trackValidationError } from './errorTracking';

export function validateInput(data) {
  if (!data.email) {
    trackValidationError('Email required', {
      field: 'email',
      rule: 'required',
    });
    throw new Error('Email required');
  }

  if (!data.email.includes('@')) {
    trackValidationError('Invalid email format', {
      field: 'email',
      value: data.email,
      rule: 'email_format',
    });
    throw new Error('Invalid email');
  }
}

// ============================================================================
// Example 6: Rate Limiting with Tracking
// ============================================================================

import { trackRateLimit } from './errorTracking';

export async function checkRateLimit(userId, action) {
  const limit = await getRateLimit(userId, action);
  if (!limit.allowed) {
    trackRateLimit(userId, action);
    throw new Error('Rate limit exceeded');
  }
}

// ============================================================================
// Example 7: Safety Violation Tracking
// ============================================================================

import { trackSafetyViolation } from './errorTracking';

export async function checkBlockStatus(senderId, recipientId) {
  const blocked = await isBlocked(senderId, recipientId);
  if (blocked) {
    trackSafetyViolation(senderId, 'blocked_user_message_attempt', {
      recipient_id: recipientId,
    });
    throw new Error('User blocked');
  }
}

// ============================================================================
// Example 8: Performance Monitoring
// ============================================================================

export async function exampleSlowOperation() {
  const startTime = Date.now();

  try {
    const result = await expensiveOperation();
    
    const duration = Date.now() - startTime;
    logMetric('expensive_operation', duration, 'ms');

    // Warn if operation is slow
    if (duration > 1000) {
      logWarn('Slow operation detected', {
        operation: 'expensive_operation',
        duration,
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Operation failed', error, {
      operation: 'expensive_operation',
      duration,
    });
    throw error;
  }
}

