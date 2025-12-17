import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const postId = params.id;

    // Check if already liked
    const existing = await sql`
      SELECT id FROM post_likes WHERE post_id = ${postId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Unlike
      await sql`DELETE FROM post_likes WHERE post_id = ${postId} AND user_id = ${userId}`;
      await sql`UPDATE posts SET likes_count = likes_count - 1 WHERE id = ${postId}`;
    } else {
      // Like
      await sql`INSERT INTO post_likes (post_id, user_id) VALUES (${postId}, ${userId})`;
      await sql`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ${postId}`;
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/posts/[id]/like error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
