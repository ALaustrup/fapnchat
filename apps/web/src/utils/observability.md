# WYA!? — Observability & Feature Flags (Alpha)

**Purpose**: See problems before users leave

**Philosophy**: Calm, informative, actionable

---

## Structured Logging

### Log Levels

- **error**: Critical errors requiring attention
- **warn**: Warnings that might indicate issues
- **info**: Informational messages (important events)
- **debug**: Debug information (development only)

### Usage

```javascript
import { logError, logWarn, logInfo, logDebug } from '@/utils/logger';

// Log error
logError('Failed to create room', error, {
  room_name: 'My Room',
  user_id: userId,
});

// Log warning
logWarn('Rate limit approaching', {
  userId,
  remaining: 5,
});

// Log info
logInfo('User logged in', {
  userId,
  method: 'credentials',
});

// Log debug (development only)
logDebug('Cache hit', {
  key: 'user_profile',
  userId,
});
```

### API Request Logging

```javascript
import { logApiRequest } from '@/utils/logger';

logApiRequest('POST', '/api/groups', 201, 150, {
  userId,
  room_id: 123,
});
```

### User Action Logging

```javascript
import { logUserAction } from '@/utils/logger';

logUserAction('create_group_room', userId, {
  room_name: 'My Room',
  max_participants: 10,
});
```

### Performance Metrics

```javascript
import { logMetric } from '@/utils/logger';

logMetric('database_query', 45, 'ms', {
  query: 'SELECT * FROM users',
});
```

---

## Error Tracking

### Track Errors

```javascript
import { trackError, trackApiError, trackDatabaseError } from '@/utils/errorTracking';

// General error
trackError(error, {
  context: 'room_creation',
  userId,
});

// API error
trackApiError(error, {
  method: 'POST',
  path: '/api/groups',
  statusCode: 500,
});

// Database error
trackDatabaseError(error, {
  sql: 'SELECT * FROM users',
  userId,
});
```

### Client-Side Errors

```javascript
import { trackClientError } from '@/utils/errorTracking';

// In React error boundary
componentDidCatch(error, errorInfo) {
  trackClientError(error, errorInfo);
}
```

### Safety Violations

```javascript
import { trackSafetyViolation } from '@/utils/errorTracking';

trackSafetyViolation(userId, 'blocked_user_message_attempt', {
  recipient_id: recipientId,
});
```

---

## Feature Flags

### Environment Variables

Set feature flags via environment variables:

```bash
# Enable features
ENABLE_GROUP_ROOMS=true
ENABLE_PROFILE_ROOMS=true
ENABLE_GUESTBOOK=true

# Disable risky features (kill switches)
ENABLE_REALTIME_CHAT=false
ENABLE_FILE_UPLOADS=false

# Kill switch (disables all risky features)
KILL_SWITCH=true
```

### Usage

```javascript
import { isFeatureEnabled, requireFeature, isFeatureSafe } from '@/utils/featureFlags';

// Check if feature is enabled
if (isFeatureEnabled('group_rooms')) {
  // Feature code
}

// Require feature (throws if disabled)
try {
  requireFeature('profile_rooms');
  // Feature code
} catch (error) {
  // Feature disabled
}

// Safe check (respects kill switch)
if (isFeatureSafe('realtime_chat')) {
  // Feature code
}
```

### Available Feature Flags

- `group_rooms` - Group chat rooms
- `profile_rooms` - Profile rooms
- `guestbook` - Guestbook module
- `realtime_chat` - Real-time chat (risky)
- `file_uploads` - File uploads (risky)
- `music_player` - Music player
- `drag_drop_modules` - Drag-and-drop modules
- `reactions` - Message reactions
- `content_moderation` - Content moderation
- `auto_moderation` - Auto moderation (risky)

---

## Kill Switches

### Global Kill Switch

```bash
# Disable all risky features
KILL_SWITCH=true
```

### Feature-Specific Kill Switches

```bash
# Disable specific risky features
ENABLE_REALTIME_CHAT=false
ENABLE_FILE_UPLOADS=false
ENABLE_AUTO_MODERATION=false
```

### Usage

```javascript
import { isKilled, isKillSwitchActive } from '@/utils/featureFlags';

// Check if kill switch is active
if (isKillSwitchActive()) {
  // Disable all risky features
}

// Check if specific feature is killed
if (isKilled('realtime_chat')) {
  return Response.json({ error: 'Service unavailable' }, { status: 503 });
}
```

---

## Middleware Integration

### API Routes

```javascript
import { withObservability } from '@/middleware/observability';

export async function GET(request) {
  return withObservability(async (req) => {
    // Your handler code
    // Request context is automatically set
    // Errors are automatically tracked
    return Response.json({ data: 'success' });
  })(request);
}
```

---

## Environment Variables

### Logging

- `LOG_LEVEL` - Log level (error, warn, info, debug)
- Default: `info`

### Feature Flags

- `ENABLE_*` - Feature flags (see featureFlags.js)
- `KILL_SWITCH` - Global kill switch

### Example .env

```bash
# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_GROUP_ROOMS=true
ENABLE_PROFILE_ROOMS=true
ENABLE_GUESTBOOK=true
ENABLE_REALTIME_CHAT=true
ENABLE_FILE_UPLOADS=false
ENABLE_MUSIC_PLAYER=true

# Kill Switch (disable all risky features)
KILL_SWITCH=false
```

---

## Alpha Constraints

- ✅ Structured logging (JSON format)
- ✅ Error tracking hooks
- ✅ Feature flags via env
- ✅ Kill switches for risky features
- ✅ No external services (console only for Alpha)
- ✅ No performance overhead (async where possible)

---

## Post-Alpha Expansion

Future enhancements (not in Alpha):
- Error tracking service integration (Sentry, etc.)
- Metrics aggregation service
- Real-time alerting
- Performance monitoring dashboard
- Advanced feature flag system (per-user, gradual rollout)

