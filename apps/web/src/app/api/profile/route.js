import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || session?.user?.id;

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT p.*, u.email, u.name,
        (SELECT balance FROM user_bits WHERE user_id = p.user_id) as bits_balance
      FROM user_profiles p
      JOIN auth_users u ON p.user_id = u.id
      WHERE p.user_id = ${userId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      // Return basic user info if no profile exists
      const user = await sql`SELECT id, email, name FROM auth_users WHERE id = ${userId}`;
      if (user.length === 0) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }
      return Response.json({ profile: null, user: user[0] });
    }

    // Get now playing status
    const nowPlaying = await sql`
      SELECT * FROM user_now_playing WHERE user_id = ${userId}
    `;

    return Response.json({ 
      profile: rows[0],
      nowPlaying: nowPlaying[0] || null,
    });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { 
      display_name, 
      bio, 
      interests, 
      avatar_url,
      banner_url,
      theme_color,
      profile_music_url,
      profile_music_provider,
      location,
      website,
      social_links,
      is_private,
      show_online_status,
      show_now_playing,
    } = body || {};

    // Check if profile already exists
    const existing = await sql`SELECT id FROM user_profiles WHERE user_id = ${userId}`;

    if (existing.length > 0) {
      return Response.json({ error: "Profile already exists, use PUT to update" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO user_profiles (
        user_id, display_name, bio, interests, avatar_url, banner_url,
        theme_color, profile_music_url, profile_music_provider,
        location, website, social_links, is_private, show_online_status, show_now_playing
      )
      VALUES (
        ${userId}, ${display_name || null}, ${bio || null}, ${interests || []}, 
        ${avatar_url || null}, ${banner_url || null}, ${theme_color || '#7A5AF8'},
        ${profile_music_url || null}, ${profile_music_provider || null},
        ${location || null}, ${website || null}, ${JSON.stringify(social_links || {})},
        ${is_private || false}, ${show_online_status !== false}, ${show_now_playing !== false}
      )
      RETURNING *
    `;

    return Response.json({ profile: result[0] });
  } catch (err) {
    console.error("POST /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Check if profile exists, create if not
    const existing = await sql`SELECT id FROM user_profiles WHERE user_id = ${userId}`;
    
    if (existing.length === 0) {
      // Create profile first
      await sql`
        INSERT INTO user_profiles (user_id) VALUES (${userId})
      `;
    }

    const result = await sql`
      UPDATE user_profiles SET
        display_name = COALESCE(${body.display_name}, display_name),
        bio = COALESCE(${body.bio}, bio),
        interests = COALESCE(${body.interests}, interests),
        avatar_url = COALESCE(${body.avatar_url}, avatar_url),
        banner_url = COALESCE(${body.banner_url}, banner_url),
        theme_color = COALESCE(${body.theme_color}, theme_color),
        profile_music_url = COALESCE(${body.profile_music_url}, profile_music_url),
        profile_music_provider = COALESCE(${body.profile_music_provider}, profile_music_provider),
        location = COALESCE(${body.location}, location),
        website = COALESCE(${body.website}, website),
        social_links = COALESCE(${body.social_links ? JSON.stringify(body.social_links) : null}, social_links),
        is_private = COALESCE(${body.is_private}, is_private),
        show_online_status = COALESCE(${body.show_online_status}, show_online_status),
        show_now_playing = COALESCE(${body.show_now_playing}, show_now_playing),
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;

    return Response.json({ profile: result[0] });
  } catch (err) {
    console.error("PUT /api/profile error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
