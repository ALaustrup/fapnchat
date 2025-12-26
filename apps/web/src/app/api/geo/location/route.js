/**
 * WYA!? — Location Update API (Alpha)
 * 
 * Purpose: Opt-in location sharing for geo-first discovery
 * 
 * Endpoints:
 * - POST /api/geo/location - Update user location (opt-in)
 * - GET /api/geo/location - Get current user's location status
 * - DELETE /api/geo/location - Remove location (opt-out)
 * 
 * Alpha Notes:
 * - Location is opt-in only
 * - Coordinates rounded to ~1km precision
 * - City/neighborhood hashed for privacy
 * - Never expose raw coordinates
 */

import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';
import { 
  hashLocationSync, 
  roundCoordinate, 
  validateCoordinates,
  extractCity 
} from '@/utils/geoLocation';

/**
 * POST /api/geo/location
 * Update user's location (opt-in)
 * 
 * Body:
 * {
 *   latitude: number (required)
 *   longitude: number (required)
 *   city: string (optional, will extract from coordinates if not provided)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { latitude, longitude, city } = body || {};
    
    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }
    
    // Round coordinates to ~1km precision (privacy protection)
    const roundedLat = roundCoordinate(latitude);
    const roundedLon = roundCoordinate(longitude);
    
    // Hash city name (privacy protection)
    let cityHash = null;
    if (city) {
      cityHash = hashLocationSync(city);
    } else {
      // TODO: Beta+ - Reverse geocode to get city from coordinates
      // For Alpha, city must be provided
      return Response.json(
        { error: 'City name is required for Alpha' },
        { status: 400 }
      );
    }
    
    if (!cityHash) {
      return Response.json({ error: 'Invalid city name' }, { status: 400 });
    }
    
    // Check if location already exists
    const existing = await sql`
      SELECT user_id FROM geo_locations WHERE user_id = ${userId}
    `;
    
    if (existing.length > 0) {
      // Update existing location
      await sql`
        UPDATE geo_locations
        SET
          city_hash = ${cityHash},
          latitude = ${roundedLat},
          longitude = ${roundedLon},
          updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } else {
      // Create new location entry
      await sql`
        INSERT INTO geo_locations (user_id, city_hash, latitude, longitude)
        VALUES (${userId}, ${cityHash}, ${roundedLat}, ${roundedLon})
      `;
    }
    
    return Response.json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (err) {
    console.error('POST /api/geo/location error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/geo/location
 * Get current user's location status
 * 
 * Response:
 * {
 *   has_location: boolean,
 *   city_hash: string | null,
 *   // Note: Never expose raw coordinates or city name
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const result = await sql`
      SELECT city_hash, updated_at
      FROM geo_locations
      WHERE user_id = ${userId}
    `;
    
    if (result.length === 0) {
      return Response.json({
        has_location: false,
        city_hash: null,
      });
    }
    
    // Return only hash, never expose city name or coordinates
    return Response.json({
      has_location: true,
      city_hash: result[0].city_hash,
      updated_at: result[0].updated_at,
    });
  } catch (err) {
    console.error('GET /api/geo/location error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/geo/location
 * Remove user's location (opt-out)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export async function DELETE(request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    await sql`
      DELETE FROM geo_locations
      WHERE user_id = ${userId}
    `;
    
    return Response.json({
      success: true,
      message: 'Location removed successfully',
    });
  } catch (err) {
    console.error('DELETE /api/geo/location error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

