# WYA!? — Safety & Moderation Subsystem (Alpha)

**Purpose**: Protection without killing fun

**Philosophy**: Moderation is care work, not punishment. All actions are transparent and reversible.

---

## Features

### 1. Block User
- Users can block other users
- Prevents all interaction
- Mutual blocking enforced at application layer
- Blocked users are filtered from UI

**API**: `POST /api/users/[userId]/block`

### 2. Report System
- Report users, messages, chats, or rooms
- Context snapshots preserved at time of report
- Manual review required (no automated bans)
- Reports visible in moderation queue

**APIs**:
- `POST /api/reports` - Create report
- `GET /api/reports` - List reports (moderator)
- `GET /api/reports/[reportId]` - Get report details
- `PATCH /api/reports/[reportId]` - Update report status

### 3. Moderation Queue
- Prioritized list of pending reports
- Status tracking: pending → reviewing → resolved/dismissed
- Contextual review with full context snapshots
- Human review required for all actions

**UI**: `ModerationDashboard` component

### 4. Moderation Actions
- **Warn**: Educational prompt (no restrictions)
- **Mute**: Temporary mute (can't send messages)
- **Restrict**: Limited capabilities (can't create rooms, send messages)
- **Escalate**: Full restriction pending review

**APIs**:
- `POST /api/moderation/actions` - Create action
- `GET /api/moderation/actions` - List actions
- `POST /api/moderation/actions/[actionId]/reverse` - Reverse action

---

## Constraints Enforced

### ✅ No Automated Bans
- All actions require human review
- No automatic actions based on reports

### ✅ No Shadow Actions
- All actions logged in `moderation_actions` table
- Users can see their moderation history
- No hidden scores or secret restrictions

### ✅ Every Action Logged
- All moderation actions recorded
- Includes moderator ID, reason, duration
- Reversible actions tracked

### ✅ Users Can See Outcomes
- Users can view their moderation history
- Reasons visible to users
- No hidden restrictions

---

## Safety Middleware Hooks

### `moderationSafety.js`

**Functions**:
- `checkUserRestrictions(userId)` - Check active restrictions
- `isUserMuted(userId)` - Check if user is muted
- `isUserRestricted(userId)` - Check if user is restricted
- `canPerformAction(userId, action)` - Check if user can perform action
- `getUserModerationHistory(userId)` - Get user's moderation history

**Integration**:
- Integrated into `chatSafety.js` for message validation
- Can be used in any API route to check restrictions

---

## Moderation Dashboard

**Component**: `ModerationDashboard.jsx`

**Features**:
- Report queue with status filters
- Detailed report view with context
- Action modal for taking moderation actions
- All actions logged and visible

**Usage**:
```jsx
import ModerationDashboard from '@/components/ModerationDashboard';

<ModerationDashboard />
```

---

## Report Types

- `harassment` - Harassment or bullying
- `spam` - Spam or unwanted messages
- `inappropriate` - Inappropriate content
- `abuse` - Abuse or threats
- `scam` - Scam or fraud
- `other` - Other issues

---

## Action Types

### Warn
- Educational prompt only
- No restrictions applied
- Logged for record

### Mute
- User cannot send messages
- Duration-based (temporary)
- Can be reversed

### Restrict
- Limited capabilities
- Cannot create rooms or send messages
- Duration-based (temporary)

### Escalate
- Full restriction pending review
- Can be permanent (requires escalation)
- Highest severity

---

## User-Facing Features

### Moderation History
Users can view their own moderation history:

**API**: `GET /api/users/[userId]/moderation-history`

Shows:
- All actions taken against user
- Reasons for each action
- Duration and expiration
- Reversal status

**No Shadow Actions**: Everything is visible to the user.

---

## Alpha Constraints

- ✅ Manual review required for all actions
- ✅ No automated bans
- ✅ All actions logged
- ✅ Users can see outcomes
- ✅ Reversible actions (duration-based)
- ✅ Context snapshots preserved

---

## Post-Alpha Expansion

Future enhancements (not in Alpha):
- Moderator role/permission system
- Appeal system
- Pattern detection (assistive, not automated)
- Advanced analytics
- Automated content scanning (assistive only)

---

## Usage Examples

### Check if user can send message:
```javascript
import { canPerformAction } from '@/utils/moderationSafety';

const check = await canPerformAction(userId, 'send_message');
if (!check.allowed) {
  return { error: check.reason };
}
```

### Create moderation action:
```javascript
const res = await fetch('/api/moderation/actions', {
  method: 'POST',
  body: JSON.stringify({
    target_user_id: userId,
    action_type: 'mute',
    reason: 'Spam messages',
    duration_minutes: 1440, // 24 hours
  }),
});
```

### Get user moderation history:
```javascript
const res = await fetch(`/api/users/${userId}/moderation-history`);
const { history } = await res.json();
```

