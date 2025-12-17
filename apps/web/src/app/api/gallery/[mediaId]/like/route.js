import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mediaId } = params;

    // Check if user already liked
    const existing = await sql`
      SELECT id FROM gallery_likes 
      WHERE media_id = ${mediaId} AND user_id = ${session.user.id}
    `;

    if (existing.length > 0) {
      // Unlike
      await sql`
        DELETE FROM gallery_likes 
        WHERE media_id = ${mediaId} AND user_id = ${session.user.id}
      `;
      await sql`
        UPDATE gallery 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = ${mediaId}
      `;
    } else {
      // Like
      await sql`
        INSERT INTO gallery_likes (media_id, user_id)
        VALUES (${mediaId}, ${session.user.id})
      `;
      await sql`
        UPDATE gallery 
        SET likes_count = likes_count + 1
        WHERE id = ${mediaId}
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error toggling like:", error);
    return Response.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
