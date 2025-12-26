/**
 * WebSocket Chat Gateway - Alpha Implementation
 * 
 * Handles real-time chat messages for rooms and 1:1 conversations
 * 
 * Endpoints:
 * - ws://host/api/ws/chat?room={roomId} - Room chat
 * - ws://host/api/ws/chat?user={userId} - 1:1 chat
 * 
 * Message Format:
 * {
 *   type: 'message' | 'typing' | 'read',
 *   roomId?: string,
 *   userId?: string,
 *   content?: string,
 *   messageId?: string
 * }
 */

// This is a placeholder for WebSocket route
// WebSocket upgrade handling needs to be done at server level
// See apps/web/__create/websocket-gateway.js for implementation

export async function GET(request) {
  // WebSocket upgrade should happen before this route
  // Return 426 Upgrade Required if accessed via HTTP
  return new Response("WebSocket upgrade required", {
    status: 426,
    headers: {
      "Upgrade": "websocket",
      "Connection": "Upgrade",
    },
  });
}

