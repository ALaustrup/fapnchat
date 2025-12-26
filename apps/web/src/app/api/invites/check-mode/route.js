/**
 * WYA!? — Check Invite-Only Mode (Alpha)
 * 
 * Purpose: Allow frontend to check if invite-only mode is enabled
 * 
 * Endpoint: GET /api/invites/check-mode
 * 
 * Response:
 * {
 *   inviteOnly: boolean
 * }
 */
export async function GET() {
  const inviteOnly = process.env.ALPHA_INVITE_ONLY === 'true';
  return Response.json({ inviteOnly });
}

