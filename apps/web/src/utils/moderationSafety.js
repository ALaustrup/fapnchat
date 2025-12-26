/**
 * WYA!? — Moderation Safety Utilities (Alpha)
 * 
 * Purpose: Safety middleware hooks for checking restrictions
 * 
 * Rules:
 * - No automated bans
 * - No shadow actions
 * - Every check is explicit
 * - Users can see why they're restricted
 */

import sql from '@/app/api/utils/sql';

/**
 * Check if user has active restrictions
 * @param {string} userId - User ID to check
 * @returns {Promise<{ restricted: boolean, restrictions: Array }>}
 */
export async function checkUserRestrictions(userId) {
  if (!userId) {
    return { restricted: false, restrictions: [] };
  }

  try {
    const now = new Date();
    
    // Get active, non-reversed restrictions
    const restrictions = await sql`
      SELECT 
        ma.*,
        up_moderator.display_name as moderator_display_name
      FROM moderation_actions ma
      LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
      WHERE ma.target_user_id = ${userId}
        AND ma.is_reversed = false
        AND (
          ma.expires_at IS NULL 
          OR ma.expires_at > ${now.toISOString()}
        )
        AND ma.action_type IN ('mute', 'restrict', 'escalate')
      ORDER BY ma.created_at DESC
    `;

    return {
      restricted: restrictions.length > 0,
      restrictions: restrictions,
    };
  } catch (err) {
    console.error('Error checking user restrictions:', err);
    // Fail open for Alpha (don't block on error)
    return { restricted: false, restrictions: [] };
  }
}

/**
 * Check if user is muted
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function isUserMuted(userId) {
  const { restricted, restrictions } = await checkUserRestrictions(userId);
  if (!restricted) return false;
  
  return restrictions.some(r => r.action_type === 'mute');
}

/**
 * Check if user is restricted
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>}
 */
export async function isUserRestricted(userId) {
  const { restricted, restrictions } = await checkUserRestrictions(userId);
  if (!restricted) return false;
  
  return restrictions.some(r => r.action_type === 'restrict' || r.action_type === 'escalate');
}

/**
 * Get user's moderation history (visible to user)
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getUserModerationHistory(userId) {
  if (!userId) {
    return [];
  }

  try {
    const actions = await sql`
      SELECT 
        ma.*,
        up_moderator.display_name as moderator_display_name
      FROM moderation_actions ma
      LEFT JOIN user_profiles up_moderator ON ma.moderator_id = up_moderator.user_id
      WHERE ma.target_user_id = ${userId}
      ORDER BY ma.created_at DESC
      LIMIT 50
    `;

    return actions;
  } catch (err) {
    console.error('Error getting moderation history:', err);
    return [];
  }
}

/**
 * Middleware: Check if user can perform action
 * Returns restriction info if user is restricted
 * @param {string} userId - User ID
 * @param {string} action - Action being attempted ('send_message', 'create_room', etc.)
 * @returns {Promise<{ allowed: boolean, reason?: string, restrictions?: Array }>}
 */
export async function canPerformAction(userId, action) {
  const { restricted, restrictions } = await checkUserRestrictions(userId);
  
  if (!restricted) {
    return { allowed: true };
  }

  // Check specific restrictions
  const muteRestriction = restrictions.find(r => r.action_type === 'mute');
  const restrictRestriction = restrictions.find(r => r.action_type === 'restrict' || r.action_type === 'escalate');

  // Muted users can't send messages
  if (action === 'send_message' && muteRestriction) {
    return {
      allowed: false,
      reason: muteRestriction.reason || 'You are currently muted',
      restrictions: [muteRestriction],
    };
  }

  // Restricted users have limited capabilities
  if (restrictRestriction) {
    // Restricted users can't create rooms or send messages
    if (action === 'create_room' || action === 'send_message') {
      return {
        allowed: false,
        reason: restrictRestriction.reason || 'Your account is currently restricted',
        restrictions: [restrictRestriction],
      };
    }
  }

  // Escalated users have all actions restricted
  const escalateRestriction = restrictions.find(r => r.action_type === 'escalate');
  if (escalateRestriction) {
    return {
      allowed: false,
      reason: escalateRestriction.reason || 'Your account has been escalated for review',
      restrictions: [escalateRestriction],
    };
  }

  return { allowed: true };
}

