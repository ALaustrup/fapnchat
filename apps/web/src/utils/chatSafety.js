/**
 * WYA!? — Chat Safety Utilities (Alpha)
 * 
 * Purpose: Block checks, rate limiting, content scanning hooks
 * 
 * Rules:
 * - Block checks before delivery
 * - Rate limiting per user
 * - Content scan hook (placeholder for Alpha)
 * - Age layer checks
 */

import sql from '@/app/api/utils/sql';
import { canPerformAction } from './moderationSafety';

// Rate limiting storage (in-memory for Alpha, Redis for Beta+)
const rateLimitStore = new Map(); // userId -> { count, resetAt }

/**
 * Check if user is blocked by recipient
 * @param {string} senderId - Sender user ID
 * @param {string} recipientId - Recipient user ID
 * @returns {Promise<boolean>} True if blocked
 */
export async function isBlocked(senderId, recipientId) {
  if (!senderId || !recipientId) {
    return false;
  }
  
  try {
    const result = await sql`
      SELECT 1 FROM blocks
      WHERE (blocker_id = ${recipientId} AND blocked_id = ${senderId})
         OR (blocker_id = ${senderId} AND blocked_id = ${recipientId})
      LIMIT 1
    `;
    
    return result.length > 0;
  } catch (err) {
    console.error('Error checking block:', err);
    // Fail open for Alpha (don't block messages on error)
    return false;
  }
}

/**
 * Check rate limit for user
 * Alpha: Simple in-memory rate limiting
 * Beta+: Redis-based distributed rate limiting
 * 
 * @param {string} userId - User ID
 * @param {number} maxMessages - Max messages per window (default: 50)
 * @param {number} windowMs - Time window in ms (default: 60000 = 1 minute)
 * @returns {Promise<{ allowed: boolean, remaining: number, resetAt: number }>}
 */
export async function checkRateLimit(userId, maxMessages = 50, windowMs = 60000) {
  if (!userId) {
    return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs };
  }
  
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    // Reset or initialize
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxMessages - 1,
      resetAt: now + windowMs,
    };
  }
  
  if (userLimit.count >= maxMessages) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: userLimit.resetAt,
    };
  }
  
  // Increment count
  userLimit.count++;
  rateLimitStore.set(userId, userLimit);
  
  return {
    allowed: true,
    remaining: maxMessages - userLimit.count,
    resetAt: userLimit.resetAt,
  };
}

/**
 * Scan message content (placeholder for Alpha)
 * Beta+ will integrate with content moderation API
 * 
 * @param {string} messageText - Message text
 * @param {string} userId - User ID
 * @returns {Promise<{ safe: boolean, reason?: string }>}
 */
export async function scanMessageContent(messageText, userId) {
  if (!messageText || typeof messageText !== 'string') {
    return { safe: true };
  }
  
  // Alpha: Simple keyword scanning (placeholder)
  // Beta+ will use proper content moderation API
  
  const blockedKeywords = [
    // Add basic blocked keywords for Alpha
    // Beta+ will use ML-based scanning
  ];
  
  const lowerText = messageText.toLowerCase();
  for (const keyword of blockedKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        safe: false,
        reason: 'Message contains inappropriate content',
      };
    }
  }
  
  // TODO: Beta+ - Integrate with content moderation API
  // For Alpha, basic keyword check is sufficient
  
  return { safe: true };
}

/**
 * Validate message before sending
 * Checks: blocks, rate limit, content scan, age layer
 * 
 * @param {string} senderId - Sender user ID
 * @param {string} recipientId - Recipient user ID
 * @param {string} messageText - Message text
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validateMessage(senderId, recipientId, messageText) {
  // Check block
  const blocked = await isBlocked(senderId, recipientId);
  if (blocked) {
    return {
      valid: false,
      error: 'Cannot send message (user blocked)',
    };
  }
  
  // Check rate limit
  const rateLimit = await checkRateLimit(senderId);
  if (!rateLimit.allowed) {
    return {
      valid: false,
      error: 'Rate limit exceeded. Please wait before sending more messages.',
    };
  }
  
  // Scan content
  const contentScan = await scanMessageContent(messageText, senderId);
  if (!contentScan.safe) {
    return {
      valid: false,
      error: contentScan.reason || 'Message contains inappropriate content',
    };
  }
  
  // Check moderation restrictions
  const restrictionCheck = await canPerformAction(senderId, 'send_message');
  if (!restrictionCheck.allowed) {
    return {
      valid: false,
      error: restrictionCheck.reason || 'You are currently restricted from sending messages',
    };
  }

  // TODO: Beta+ - Add age layer check here
  // For Alpha, age layer is checked at API route level
  
  return { valid: true };
}

/**
 * Get rate limit status for user
 * @param {string} userId - User ID
 * @returns {Promise<{ remaining: number, resetAt: number }>}
 */
export async function getRateLimitStatus(userId) {
  const rateLimit = await checkRateLimit(userId);
  return {
    remaining: rateLimit.remaining,
    resetAt: rateLimit.resetAt,
  };
}

