import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await sql`
      SELECT 
        g.id,
        g.user_id,
        g.media_url,
        g.media_type,
        g.caption,
        g.likes_count,
        g.created_at,
        up.display_name,
        au.email
      FROM gallery g
      LEFT JOIN user_profiles up ON g.user_id = up.user_id
      LEFT JOIN auth_users au ON g.user_id = au.id
      ORDER BY g.created_at DESC
    `;

    return Response.json({ media });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return Response.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { media_url, media_type, caption } = await request.json();

    if (!media_url) {
      return Response.json({ error: "Media URL is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO gallery (user_id, media_url, media_type, caption)
      VALUES (${session.user.id}, ${media_url}, ${media_type}, ${caption})
      RETURNING id
    `;

    return Response.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error creating gallery item:", error);
    return Response.json(
      { error: "Failed to create gallery item" },
      { status: 500 },
    );
  }
}
