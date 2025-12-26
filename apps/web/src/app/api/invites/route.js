/**
 * WYA!? — Invite Codes API (Alpha)
 * 
 * Purpose: Simple invite-only access gate for Alpha
 * 
 * Endpoints:
 * - POST /api/invites/validate - Validate invite code (public, for signup)
 * - POST /api/invites/use - Use invite code (during signup)
 * - GET /api/invites/generate - Generate new invite codes (admin only)
 * 
 * Alpha-Only Decisions:
 * 
 * 1. Single-use codes only
 *    - Why: Simple to implement, prevents code sharing abuse
 *    - Future: Multi-use codes, expiration dates, usage limits
 * 
 * 2. No automatic expiration
 *    - Why: Manual control for Alpha, simpler codebase
 *    - Future: TTL-based expiration, scheduled cleanup
 * 
 * 3. Simple 8-char alphanumeric format
 *    - Why: Easy to type, no special characters to confuse
 *    - Future: Custom formats, QR codes, magic links
 * 
 * 4. Email-based admin check
 *    - Why: No role system yet, quick to implement
 *    - Future: Proper RBAC, permission system
 * 
 * 5. No usage analytics
 *    - Why: Alpha doesn't need tracking, keep it simple
 *    - Future: Track who generated codes, usage patterns
 * 
 * 6. No rate limiting on generation
 *    - Why: Trusted admins only for Alpha
 *    - Future: Rate limits, audit logs
 */

import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import crypto from "node:crypto";

/**
 * Generate a random invite code
 * Format: 8 uppercase alphanumeric characters
 */
function generateInviteCode() {
  // Generate 8 random bytes, convert to base36, uppercase, take first 8 chars
  const bytes = crypto.randomBytes(6);
  const code = bytes.toString('base36').toUpperCase().substring(0, 8);
  return code;
}

/**
 * POST /api/invites/validate
 * Validate an invite code (check if it exists and is unused)
 * 
 * Body:
 * {
 *   code: string (required)
 * }
 * 
 * Response:
 * {
 *   valid: boolean,
 *   message?: string
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, action } = body;

    if (!code || typeof code !== 'string') {
      return Response.json(
        { valid: false, message: "Invite code is required" },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check if code exists
    const codes = await sql`
      SELECT id, code, used_by, used_at
      FROM invite_codes
      WHERE code = ${normalizedCode}
    `;

    if (codes.length === 0) {
      return Response.json({
        valid: false,
        message: "Invalid invite code",
      });
    }

    const inviteCode = codes[0];

    // Check if already used
    if (inviteCode.used_by) {
      return Response.json({
        valid: false,
        message: "This invite code has already been used",
      });
    }

    // If action is 'use', require authentication
    if (action === 'use') {
      const session = await auth();
      if (!session?.user?.id) {
        return Response.json(
          { valid: false, message: "Authentication required to use invite code" },
          { status: 401 }
        );
      }

      const userId = session.user.id;

      // Check if user already used an invite code
      const userInvites = await sql`
        SELECT code FROM invite_codes
        WHERE used_by = ${userId}
      `;

      if (userInvites.length > 0) {
        return Response.json({
          valid: false,
          message: "You have already used an invite code",
        });
      }

      // Mark code as used
      await sql`
        UPDATE invite_codes
        SET used_by = ${userId}, used_at = NOW()
        WHERE id = ${inviteCode.id} AND used_by IS NULL
      `;

      return Response.json({
        valid: true,
        message: "Invite code used successfully",
      });
    }

    // Just validate (for signup form)
    return Response.json({
      valid: true,
      message: "Invite code is valid",
    });
  } catch (error) {
    console.error("POST /api/invites error:", error);
    return Response.json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invites/generate
 * Generate new invite codes (admin only)
 * 
 * Query params:
 * - count: number (default: 1, max: 10 for Alpha)
 * 
 * Response:
 * {
 *   codes: string[],
 *   message: string
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Alpha: Simple admin check via environment variable
    // In production, use proper admin role system
    const adminEmails = (process.env.ALPHA_ADMIN_EMAILS || '').split(',').map(e => e.trim());
    const userEmail = session.user.email;

    if (!adminEmails.includes(userEmail)) {
      return Response.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const count = Math.min(parseInt(url.searchParams.get('count') || '1', 10), 10);

    const newCodes = [];
    for (let i = 0; i < count; i++) {
      let code = generateInviteCode();
      let attempts = 0;
      
      // Ensure uniqueness
      while (attempts < 10) {
        const existing = await sql`
          SELECT id FROM invite_codes WHERE code = ${code}
        `;
        if (existing.length === 0) {
          break;
        }
        code = generateInviteCode();
        attempts++;
      }

      await sql`
        INSERT INTO invite_codes (code, created_by)
        VALUES (${code}, ${session.user.id})
      `;

      newCodes.push(code);
    }

    return Response.json({
      codes: newCodes,
      message: `Generated ${newCodes.length} invite code(s)`,
    });
  } catch (error) {
    console.error("GET /api/invites/generate error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

