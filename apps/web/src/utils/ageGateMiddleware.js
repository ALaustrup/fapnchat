/**
 * WYA!? — Age Gate Middleware (Alpha)
 * 
 * Purpose: Server-side enforcement of age layer isolation
 * 
 * This middleware ensures:
 * - Users can only see/interact with same age layer
 * - Age layer checks happen on EVERY request
 * - Client cannot override age logic
 * 
 * Usage:
 * - Apply to all discovery endpoints
 * - Apply to all chat endpoints
 * - Apply to all profile visibility endpoints
 */

import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';
import { canAgeLayersInteract, canSeeUser, canChat } from './ageSegmentation';

/**
 * Get user's age layer from database
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Age layer or null if not found
 */
export async function getUserAgeLayer(userId) {
  if (!userId) {
    return null;
  }
  
  try {
    const result = await sql`
      SELECT age_layer 
      FROM user_profiles 
      WHERE user_id = ${userId}
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0].age_layer;
  } catch (err) {
    console.error('Error getting user age layer:', err);
    return null;
  }
}

/**
 * Middleware: Require age layer for current user
 * Returns 403 if user has no age layer (not completed signup)
 */
export async function requireAgeLayer(request) {
  const session = await auth();
  
  if (!session || !session.user?.id) {
    return {
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
      ageLayer: null,
    };
  }
  
  const ageLayer = await getUserAgeLayer(session.user.id);
  
  if (!ageLayer) {
    return {
      error: Response.json(
        { error: 'Age verification required. Please complete your profile.' },
        { status: 403 }
      ),
      ageLayer: null,
    };
  }
  
  return {
    error: null,
    ageLayer,
    userId: session.user.id,
  };
}

/**
 * Middleware: Check if user can see target user
 * Returns 403 if age layers don't match
 */
export async function requireAgeLayerMatch(request, targetUserId) {
  const authResult = await requireAgeLayer(request);
  
  if (authResult.error) {
    return authResult;
  }
  
  const targetAgeLayer = await getUserAgeLayer(targetUserId);
  
  if (!targetAgeLayer) {
    return {
      error: Response.json({ error: 'User not found' }, { status: 404 }),
      ageLayer: null,
    };
  }
  
  if (!canSeeUser(authResult.ageLayer, targetAgeLayer)) {
    return {
      error: Response.json(
        { error: 'Cannot view this user (age layer mismatch)' },
        { status: 403 }
      ),
      ageLayer: null,
    };
  }
  
  return {
    error: null,
    ageLayer: authResult.ageLayer,
    targetAgeLayer,
    userId: authResult.userId,
  };
}

/**
 * Middleware: Check if users can chat
 * Returns 403 if age layers don't match
 */
export async function requireChatAgeLayerMatch(request, otherUserId) {
  const authResult = await requireAgeLayer(request);
  
  if (authResult.error) {
    return authResult;
  }
  
  const otherAgeLayer = await getUserAgeLayer(otherUserId);
  
  if (!otherAgeLayer) {
    return {
      error: Response.json({ error: 'User not found' }, { status: 404 }),
      ageLayer: null,
    };
  }
  
  if (!canChat(authResult.ageLayer, otherAgeLayer)) {
    return {
      error: Response.json(
        { error: 'Cannot chat with this user (age layer mismatch)' },
        { status: 403 }
      ),
      ageLayer: null,
    };
  }
  
  return {
    error: null,
    ageLayer: authResult.ageLayer,
    otherAgeLayer,
    userId: authResult.userId,
  };
}

/**
 * Filter query results by age layer
 * @param {Array} results - Query results with user_id or user_id field
 * @param {string} viewerAgeLayer - Viewer's age layer
 * @returns {Promise<Array>} Filtered results
 */
export async function filterResultsByAgeLayer(results, viewerAgeLayer) {
  if (!viewerAgeLayer || !results || results.length === 0) {
    return [];
  }
  
  // Get all unique user IDs from results
  const userIds = [...new Set(results.map(r => r.user_id || r.userId || r.sender_id || r.recipient_id).filter(Boolean))];
  
  if (userIds.length === 0) {
    return results;
  }
  
  // Batch fetch age layers
  const ageLayers = await sql`
    SELECT user_id, age_layer 
    FROM user_profiles 
    WHERE user_id IN ${sql(userIds)}
  `;
  
  const ageLayerMap = new Map(ageLayers.map(a => [a.user_id, a.age_layer]));
  
  // Filter results
  return results.filter(result => {
    const userId = result.user_id || result.userId || result.sender_id || result.recipient_id;
    const userAgeLayer = ageLayerMap.get(userId);
    
    if (!userAgeLayer) {
      return false; // Hide users without age layer
    }
    
    return canAgeLayersInteract(viewerAgeLayer, userAgeLayer);
  });
}

/**
 * Add age layer check to SQL query
 * This is a helper to add WHERE clause for age layer filtering
 * 
 * @param {string} viewerAgeLayer - Viewer's age layer
 * @param {string} tableAlias - Table alias in query (default: 'up')
 * @returns {string} SQL WHERE clause fragment
 */
export function getAgeLayerWhereClause(viewerAgeLayer, tableAlias = 'up') {
  if (!viewerAgeLayer) {
    return 'FALSE'; // Hide everything if no age layer
  }
  
  return `${tableAlias}.age_layer = '${viewerAgeLayer}'`;
}

