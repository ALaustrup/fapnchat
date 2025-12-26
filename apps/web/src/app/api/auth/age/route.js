/**
 * WYA!? — Age Verification API (Alpha)
 * 
 * Purpose: Set age layer during signup (self-declared for Alpha)
 * 
 * Endpoints:
 * - POST /api/auth/age - Set age layer (signup/onboarding)
 * 
 * Alpha: Self-declared birth date
 * Beta+: External verification required (TODO)
 */

import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';
import { validateBirthDateForSignup, getAgeLayerFromBirthDate } from '@/utils/ageSegmentation';

/**
 * POST /api/auth/age
 * Set user's age layer (called during signup/onboarding)
 * 
 * Body:
 * {
 *   birth_date: "YYYY-MM-DD" (required)
 * }
 * 
 * Response:
 * {
 *   age_layer: "minor" | "transitional" | "adult",
 *   age: number
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
    const { birth_date } = body || {};
    
    if (!birth_date) {
      return Response.json({ error: 'Birth date is required' }, { status: 400 });
    }
    
    // Validate birth date
    const validation = validateBirthDateForSignup(birth_date);
    
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }
    
    // Check if age layer already set (immutable)
    const existing = await sql`
      SELECT age_layer 
      FROM user_profiles 
      WHERE user_id = ${userId}
    `;
    
    if (existing.length > 0 && existing[0].age_layer) {
      return Response.json(
        { error: 'Age layer cannot be changed after signup' },
        { status: 403 }
      );
    }
    
    // Set age layer (create or update profile)
    const ageLayer = validation.layer;
    const age = validation.age;
    
    // Check if profile exists
    const profileExists = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;
    
    if (profileExists.length > 0) {
      // Update existing profile
      await sql`
        UPDATE user_profiles
        SET 
          age_layer = ${ageLayer},
          birth_date = ${birth_date}::DATE,
          age_verified_at = NULL
        WHERE user_id = ${userId}
      `;
    } else {
      // Create profile with age layer
      await sql`
        INSERT INTO user_profiles (user_id, age_layer, birth_date, age_verified_at)
        VALUES (${userId}, ${ageLayer}, ${birth_date}::DATE, NULL)
      `;
    }
    
    return Response.json({
      age_layer: ageLayer,
      age,
      message: 'Age layer set successfully',
    });
  } catch (err) {
    console.error('POST /api/auth/age error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/auth/age
 * Get current user's age layer
 * 
 * Response:
 * {
 *   age_layer: "minor" | "transitional" | "adult" | null,
 *   age: number | null,
 *   verified: boolean
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
      SELECT age_layer, birth_date, age_verified_at
      FROM user_profiles
      WHERE user_id = ${userId}
    `;
    
    if (result.length === 0) {
      return Response.json({
        age_layer: null,
        age: null,
        verified: false,
      });
    }
    
    const profile = result[0];
    
    // Calculate age if birth_date exists
    let age = null;
    if (profile.birth_date) {
      const today = new Date();
      const birth = new Date(profile.birth_date);
      age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
    }
    
    return Response.json({
      age_layer: profile.age_layer || null,
      age,
      verified: profile.age_verified_at !== null,
    });
  } catch (err) {
    console.error('GET /api/auth/age error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

