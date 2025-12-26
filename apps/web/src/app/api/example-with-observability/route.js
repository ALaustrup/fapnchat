/**
 * WYA!? — Example API Route with Observability
 * 
 * Purpose: Demonstrate proper observability integration
 * 
 * This is an example file showing how to use:
 * - Structured logging
 * - Error tracking
 * - Feature flags
 * - Kill switches
 */

import { withObservability } from '@/middleware/observability';
import {
  logInfo,
  logError,
  logUserAction,
  logMetric,
  trackError,
  isFeatureEnabled,
  isFeatureSafe,
  requireFeature,
} from '@/utils/observability';

/**
 * Example API route with full observability
 */
export const GET = withObservability(async (request) => {
  const startTime = Date.now();

  try {
    // Check feature flag
    if (!isFeatureEnabled('group_rooms')) {
      logError('Feature disabled', new Error('group_rooms feature disabled'));
      return Response.json({ error: 'Feature disabled' }, { status: 503 });
    }

    // Check kill switch
    if (!isFeatureSafe('realtime_chat')) {
      logError('Kill switch active', new Error('realtime_chat killed'));
      return Response.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    // Log user action
    logUserAction('example_action', null, {
      path: new URL(request.url).pathname,
    });

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 100));

    // Log success
    logInfo('Example action completed', {
      duration: Date.now() - startTime,
    });

    // Log performance metric
    logMetric('example_action', Date.now() - startTime, 'ms');

    return Response.json({ success: true });
  } catch (error) {
    // Error is automatically tracked by middleware
    // But you can add additional context
    trackError(error, {
      context: 'example_api',
      path: new URL(request.url).pathname,
    });

    throw error; // Re-throw to let middleware handle response
  }
});

/**
 * Example with feature requirement
 */
export const POST = withObservability(async (request) => {
  try {
    // Require feature (throws if disabled)
    requireFeature('profile_rooms');

    const body = await request.json();
    
    logInfo('Processing request', {
      action: 'create_profile_room',
      data: body,
    });

    // Your logic here
    return Response.json({ success: true });
  } catch (error) {
    // Feature requirement errors are tracked automatically
    throw error;
  }
});

