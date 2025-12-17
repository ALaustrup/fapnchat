import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { recipient_id, message, media_url } = body || {};

    if (!recipient_id || !message) {
      return Response.json(
        { error: "Recipient and message required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO private_messages (sender_id, recipient_id, message, media_url)
      VALUES (${userId}, ${recipient_id}, ${message}, ${media_url || null})
      RETURNING *
    `;

    return Response.json({ message: result[0] });
  } catch (err) {
    console.error("POST /api/messages error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
