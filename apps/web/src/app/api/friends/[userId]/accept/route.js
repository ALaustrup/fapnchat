import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const requestUserId = params.userId;

    // Update the friendship status
    await sql`
      UPDATE friendships 
      SET status = 'accepted'
      WHERE user_id = ${requestUserId} AND friend_id = ${currentUserId} AND status = 'pending'
    `;

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/friends/[userId]/accept error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
