/**
 * WYA!? — Invite-Only Access Gate (Alpha)
 * 
 * Purpose: Enforce invite-only signup during Alpha
 * 
 * Alpha Notes:
 * - Controlled by ALPHA_INVITE_ONLY env var
 * - Validates invite code before allowing signup
 * - Simple, explicit gate (no complex logic)
 */

import sql from "@/app/api/utils/sql";

/**
 * Check if invite-only mode is enabled
 */
export function isInviteOnlyEnabled() {
  return process.env.ALPHA_INVITE_ONLY === 'true';
}

/**
 * Validate an invite code
 * @param {string} code - Invite code to validate
 * @returns {Promise<{valid: boolean, message?: string}>}
 */
export async function validateInviteCode(code) {
  if (!isInviteOnlyEnabled()) {
    // Invite-only disabled, allow all signups
    return { valid: true };
  }

  if (!code || typeof code !== 'string') {
    return {
      valid: false,
      message: "Invite code is required for Alpha access",
    };
  }

  const normalizedCode = code.trim().toUpperCase();

  try {
    // Check if code exists and is unused
    const codes = await sql`
      SELECT id, code, used_by, used_at
      FROM invite_codes
      WHERE code = ${normalizedCode}
    `;

    if (codes.length === 0) {
      return {
        valid: false,
        message: "Invalid invite code",
      };
    }

    const inviteCode = codes[0];

    if (inviteCode.used_by) {
      return {
        valid: false,
        message: "This invite code has already been used",
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Invite code validation error:", error);
    return {
      valid: false,
      message: "Error validating invite code",
    };
  }
}

/**
 * Use an invite code (mark as used)
 * @param {string} code - Invite code
 * @param {string} userId - User ID who is using the code
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function useInviteCode(code, userId) {
  if (!isInviteOnlyEnabled()) {
    return { success: true };
  }

  if (!code || !userId) {
    return {
      success: false,
      message: "Invite code and user ID are required",
    };
  }

  const normalizedCode = code.trim().toUpperCase();

  try {
    // Check if user already used an invite code
    const userInvites = await sql`
      SELECT code FROM invite_codes
      WHERE used_by = ${userId}
    `;

    if (userInvites.length > 0) {
      return {
        success: false,
        message: "You have already used an invite code",
      };
    }

    // Mark code as used
    const result = await sql`
      UPDATE invite_codes
      SET used_by = ${userId}, used_at = NOW()
      WHERE code = ${normalizedCode} AND used_by IS NULL
      RETURNING id
    `;

    if (result.length === 0) {
      return {
        success: false,
        message: "Invalid or already used invite code",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error using invite code:", error);
    return {
      success: false,
      message: "Error using invite code",
    };
  }
}

