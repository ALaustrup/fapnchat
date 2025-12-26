/**
 * WYA!? — Geo-First Discovery API (Alpha)
 * 
 * Purpose: Proximity-first discovery with explanations
 * 
 * Rules:
 * - Discovery sorted FIRST by proximity
 * - Distance tiers only (no exact distances)
 * - Manual refresh only (no infinite feeds)
 * - No algorithmic black boxes
 * - Must explain WHY users are shown
 * 
 * Endpoints:
 * - GET /api/discovery - Get discovery results (proximity-first)
 * 
 * Alpha Notes:
 * - Proximity > everything
 * - Age layer filtering applied
 * - Simple ranking (no ML, no boosts)
 */

import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';
import { requireAgeLayer, filterResultsByAgeLayer } from '@/utils/ageGateMiddleware';
import { 
  calculateDistance, 
  getDistanceTier, 
  getDistanceTierDisplayName 
} from '@/utils/geoLocation';

/**
 * GET /api/discovery
 * Get discovery results sorted by proximity
 * 
 * Query Params:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * 
 * Response:
 * {
 *   users: [
 *     {
 *       user_id: string,
 *       display_name: string,
 *       avatar_url: string,
 *       bio: string,
 *       distance_tier: 'immediate' | 'nearby' | 'local' | 'city',
 *       explanation: string, // Why this user is shown
 *       // ... other profile fields
 *     }
 *   ],
 *   total: number,
 *   has_more: boolean
 * }
 */
export async function GET(request) {
  try {
    // Require age layer
    const authResult = await requireAgeLayer(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const viewerUserId = authResult.userId;
    const viewerAgeLayer = authResult.ageLayer;
    
    // Get viewer's location
    const viewerLocation = await sql`
      SELECT city_hash, latitude, longitude
      FROM geo_locations
      WHERE user_id = ${viewerUserId}
    `;
    
    if (viewerLocation.length === 0) {
      // Viewer has no location - return empty results
      // Discovery requires location to be opt-in
      return Response.json({
        users: [],
        total: 0,
        has_more: false,
        message: 'Enable location sharing to discover users nearby',
      });
    }
    
    const viewerCityHash = viewerLocation[0].city_hash;
    const viewerLat = viewerLocation[0].latitude;
    const viewerLon = viewerLocation[0].longitude;
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Query users with same age layer and location data
    // Sort by: same city first, then by distance
    const users = await sql`
      SELECT 
        up.user_id,
        up.display_name,
        up.bio,
        up.avatar_url,
        up.theme_color,
        gl.city_hash,
        gl.latitude,
        gl.longitude,
        gl.updated_at as location_updated_at
      FROM user_profiles up
      JOIN geo_locations gl ON up.user_id = gl.user_id
      WHERE 
        up.user_id != ${viewerUserId}
        AND up.age_layer = ${viewerAgeLayer}
        AND up.is_private = false
        AND gl.city_hash IS NOT NULL
      ORDER BY
        CASE WHEN gl.city_hash = ${viewerCityHash} THEN 0 ELSE 1 END, -- Same city first
        gl.updated_at DESC -- Most recent locations first
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    
    // Calculate distance tiers and explanations
    const enrichedUsers = users.map(user => {
      // Calculate distance if both have coordinates
      let distanceKm = null;
      if (viewerLat && viewerLon && user.latitude && user.longitude) {
        distanceKm = calculateDistance(
          viewerLat,
          viewerLon,
          user.latitude,
          user.longitude
        );
      }
      
      // Determine distance tier
      const distanceTier = getDistanceTier(
        distanceKm,
        viewerCityHash,
        user.city_hash
      );
      
      // Generate explanation
      let explanation = '';
      if (distanceTier === 'immediate') {
        explanation = 'Same location as you';
      } else if (distanceTier === 'nearby') {
        explanation = 'Very close to you';
      } else if (distanceTier === 'local') {
        explanation = 'Close by';
      } else if (distanceTier === 'city') {
        explanation = 'Same city';
      } else {
        explanation = 'Nearby area';
      }
      
      // Add age layer to explanation
      explanation += ` • Your age group`;
      
      return {
        user_id: user.user_id,
        display_name: user.display_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        theme_color: user.theme_color,
        distance_tier: distanceTier,
        distance_tier_display: getDistanceTierDisplayName(distanceTier),
        explanation,
        // Never expose raw coordinates or city hash
      };
    });
    
    // Sort by distance tier priority (immediate > nearby > local > city)
    const tierPriority = {
      immediate: 0,
      nearby: 1,
      local: 2,
      city: 3,
    };
    
    enrichedUsers.sort((a, b) => {
      const priorityA = tierPriority[a.distance_tier] ?? 999;
      const priorityB = tierPriority[b.distance_tier] ?? 999;
      return priorityA - priorityB;
    });
    
    // Get total count for pagination
    const totalResult = await sql`
      SELECT COUNT(*) as total
      FROM user_profiles up
      JOIN geo_locations gl ON up.user_id = gl.user_id
      WHERE 
        up.user_id != ${viewerUserId}
        AND up.age_layer = ${viewerAgeLayer}
        AND up.is_private = false
        AND gl.city_hash IS NOT NULL
    `;
    
    const total = parseInt(totalResult[0].total || 0);
    const hasMore = offset + limit < total;
    
    return Response.json({
      users: enrichedUsers,
      total,
      has_more: hasMore,
      limit,
      offset,
    });
  } catch (err) {
    console.error('GET /api/discovery error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

