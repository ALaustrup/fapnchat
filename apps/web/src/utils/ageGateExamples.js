/**
 * WYA!? — Age Gate Middleware Usage Examples
 * 
 * This file shows how to apply age gate middleware to API routes.
 * Copy these patterns to your actual route files.
 */

import { requireAgeLayer, requireAgeLayerMatch, requireChatAgeLayerMatch, filterResultsByAgeLayer } from './ageGateMiddleware';

// ============================================================================
// Example 1: Discovery Endpoint (Filter by Age Layer)
// ============================================================================

/**
 * GET /api/discovery
 * Returns users in same age layer only
 */
export async function exampleDiscoveryRoute(request) {
  // Require age layer for current user
  const authResult = await requireAgeLayer(request);
  if (authResult.error) {
    return authResult.error; // 401 or 403
  }
  
  const viewerAgeLayer = authResult.ageLayer;
  
  // Query users (with age layer filter)
  // In your actual query, add: WHERE up.age_layer = ${viewerAgeLayer}
  const users = await sql`
    SELECT up.*, u.email
    FROM user_profiles up
    JOIN auth_users u ON up.user_id = u.id
    WHERE up.age_layer = ${viewerAgeLayer}
    LIMIT 50
  `;
  
  // Double-check filter (defense in depth)
  const filteredUsers = await filterResultsByAgeLayer(users, viewerAgeLayer);
  
  return Response.json({ users: filteredUsers });
}

// ============================================================================
// Example 2: Profile View Endpoint (Check Age Layer Match)
// ============================================================================

/**
 * GET /api/profile/[userId]
 * Returns profile only if age layers match
 */
export async function exampleProfileRoute(request, { params }) {
  const targetUserId = params.userId;
  
  // Check age layer match
  const authResult = await requireAgeLayerMatch(request, targetUserId);
  if (authResult.error) {
    return authResult.error; // 403 if age layers don't match
  }
  
  // Proceed with profile fetch
  const profile = await sql`
    SELECT * FROM user_profiles WHERE user_id = ${targetUserId}
  `;
  
  return Response.json({ profile: profile[0] });
}

// ============================================================================
// Example 3: Chat Endpoint (Check Chat Eligibility)
// ============================================================================

/**
 * POST /api/messages
 * Send message only if age layers match
 */
export async function exampleChatRoute(request) {
  const body = await request.json();
  const { recipient_id } = body;
  
  // Check chat eligibility
  const authResult = await requireChatAgeLayerMatch(request, recipient_id);
  if (authResult.error) {
    return authResult.error; // 403 if age layers don't match
  }
  
  // Proceed with message send
  // ... message sending logic ...
  
  return Response.json({ success: true });
}

// ============================================================================
// Example 4: Chat List Endpoint (Filter Conversations)
// ============================================================================

/**
 * GET /api/messages/conversations
 * Returns conversations only with users in same age layer
 */
export async function exampleConversationsRoute(request) {
  // Require age layer
  const authResult = await requireAgeLayer(request);
  if (authResult.error) {
    return authResult.error;
  }
  
  const viewerAgeLayer = authResult.ageLayer;
  const userId = authResult.userId;
  
  // Query conversations
  const conversations = await sql`
    SELECT DISTINCT
      CASE 
        WHEN pm.sender_id = ${userId} THEN pm.recipient_id
        ELSE pm.sender_id
      END as id,
      up.display_name,
      u.email,
      up.age_layer
    FROM private_messages pm
    LEFT JOIN user_profiles up ON (
      CASE WHEN pm.sender_id = ${userId} THEN pm.recipient_id ELSE pm.sender_id END
    ) = up.user_id
    LEFT JOIN auth_users u ON (
      CASE WHEN pm.sender_id = ${userId} THEN pm.recipient_id ELSE pm.sender_id END
    ) = u.id
    WHERE (pm.sender_id = ${userId} OR pm.recipient_id = ${userId})
      AND up.age_layer = ${viewerAgeLayer} -- Age layer filter
    ORDER BY pm.created_at DESC
  `;
  
  return Response.json({ conversations });
}

// ============================================================================
// Example 5: SQL WHERE Clause Helper
// ============================================================================

/**
 * GET /api/users/search
 * Search users with age layer filter
 */
export async function exampleSearchRoute(request) {
  const authResult = await requireAgeLayer(request);
  if (authResult.error) {
    return authResult.error;
  }
  
  const viewerAgeLayer = authResult.ageLayer;
  const searchTerm = new URL(request.url).searchParams.get('q');
  
  // Use WHERE clause helper
  const whereClause = getAgeLayerWhereClause(viewerAgeLayer, 'up');
  
  const users = await sql`
    SELECT up.*, u.email
    FROM user_profiles up
    JOIN auth_users u ON up.user_id = u.id
    WHERE ${sql.raw(whereClause)}
      AND (up.display_name ILIKE ${`%${searchTerm}%`} OR u.email ILIKE ${`%${searchTerm}%`})
    LIMIT 20
  `;
  
  return Response.json({ users });
}

// ============================================================================
// Enforcement Checklist
// ============================================================================

/**
 * Apply age gate middleware to these endpoints:
 * 
 * ✅ Discovery endpoints
 *   - GET /api/discovery
 *   - GET /api/users/search
 *   - GET /api/users/suggestions
 * 
 * ✅ Profile endpoints
 *   - GET /api/profile/[userId]
 *   - GET /api/profile/[userId]/room
 * 
 * ✅ Chat endpoints
 *   - POST /api/messages
 *   - GET /api/messages/[userId]
 *   - GET /api/messages/conversations
 *   - POST /api/chatrooms/[roomId]/messages
 *   - GET /api/chatrooms/[roomId]/members
 * 
 * ✅ Room endpoints
 *   - GET /api/chatrooms
 *   - POST /api/chatrooms
 *   - GET /api/chatrooms/[roomId]
 * 
 * ✅ Friend/Social endpoints
 *   - GET /api/friends
 *   - GET /api/friends/suggestions
 *   - POST /api/friends/[userId]/accept
 */

