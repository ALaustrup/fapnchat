/**
 * WebSocket Gateway - Alpha Implementation
 * 
 * Handles WebSocket connections for:
 * - /ws/chat - Real-time chat (rooms and 1:1)
 * - /ws/presence - Presence updates (online/typing)
 * 
 * Integrates with Hono server via upgrade handling
 */

import { WebSocketServer } from 'ws';
import { auth } from '@/auth';

// Connection storage
const chatConnections = new Map(); // roomId/userId -> Set<WebSocket>
const presenceConnections = new Map(); // userId -> WebSocket
const userSockets = new Map(); // userId -> Set<WebSocket>

/**
 * Initialize WebSocket gateway
 * @param {http.Server} server - HTTP server instance
 */
export function initWebSocketGateway(server) {
  const wss = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false, // Disable compression for lower latency
  });

  // Handle WebSocket upgrade requests
  server.on('upgrade', async (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = url.pathname;

    // Route to appropriate handler
    if (pathname === '/api/ws/chat') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        handleChatConnection(ws, request, url);
      });
    } else if (pathname === '/api/ws/presence') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        handlePresenceConnection(ws, request, url);
      });
    } else {
      socket.destroy();
    }
  });

  // Cleanup on close
  process.on('SIGTERM', () => {
    wss.close();
  });

  return wss;
}

/**
 * Handle chat WebSocket connection
 */
async function handleChatConnection(ws, request, url) {
  // Extract auth from cookies/headers
  const session = await getSessionFromRequest(request);
  if (!session?.user?.id) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  const userId = session.user.id;
  const roomId = url.searchParams.get('room');
  const targetUserId = url.searchParams.get('user');

  if (!roomId && !targetUserId) {
    ws.close(1008, 'Missing room or user parameter');
    return;
  }

  const channelId = roomId || `dm:${userId}:${targetUserId}`;

  // Store connection
  if (!chatConnections.has(channelId)) {
    chatConnections.set(channelId, new Set());
  }
  chatConnections.get(channelId).add(ws);

  // Store user socket for presence
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(ws);

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    channelId,
    userId,
  }));

  // Handle messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleChatMessage(ws, userId, channelId, message);
    } catch (err) {
      console.error('WebSocket message error:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
    }
  });

  // Handle close
  ws.on('close', () => {
    chatConnections.get(channelId)?.delete(ws);
    userSockets.get(userId)?.delete(ws);
    
    if (chatConnections.get(channelId)?.size === 0) {
      chatConnections.delete(channelId);
    }
    if (userSockets.get(userId)?.size === 0) {
      userSockets.delete(userId);
    }
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
}

/**
 * Handle presence WebSocket connection
 */
async function handlePresenceConnection(ws, request, url) {
  const session = await getSessionFromRequest(request);
  if (!session?.user?.id) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  const userId = session.user.id;

  // Store presence connection
  presenceConnections.set(userId, ws);

  // Send initial presence
  ws.send(JSON.stringify({
    type: 'presence',
    userId,
    status: 'online',
  }));

  // Broadcast presence update
  broadcastPresenceUpdate(userId, 'online');

  // Handle messages (typing indicators, etc.)
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'typing') {
        broadcastTyping(userId, message.roomId || message.userId, true);
      }
    } catch (err) {
      console.error('Presence WebSocket error:', err);
    }
  });

  // Handle close
  ws.on('close', () => {
    presenceConnections.delete(userId);
    broadcastPresenceUpdate(userId, 'offline');
  });

  // Heartbeat
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);
}

/**
 * Handle incoming chat message
 */
async function handleChatMessage(ws, userId, channelId, message) {
  if (message.type === 'message') {
    // Broadcast to all connections in channel
    const connections = chatConnections.get(channelId);
    if (connections) {
      const broadcast = JSON.stringify({
        type: 'message',
        userId,
        channelId,
        content: message.content,
        timestamp: Date.now(),
      });

      connections.forEach((conn) => {
        if (conn !== ws && conn.readyState === ws.OPEN) {
          conn.send(broadcast);
        }
      });
    }
  } else if (message.type === 'typing') {
    // Broadcast typing indicator
    const connections = chatConnections.get(channelId);
    if (connections) {
      const broadcast = JSON.stringify({
        type: 'typing',
        userId,
        channelId,
        isTyping: message.isTyping !== false,
      });

      connections.forEach((conn) => {
        if (conn !== ws && conn.readyState === ws.OPEN) {
          conn.send(broadcast);
        }
      });
    }
  }
}

/**
 * Broadcast presence update to relevant users
 */
function broadcastPresenceUpdate(userId, status) {
  // Broadcast to user's connections
  const userConnections = userSockets.get(userId);
  if (userConnections) {
    const message = JSON.stringify({
      type: 'presence',
      userId,
      status,
    });

    userConnections.forEach((conn) => {
      if (conn.readyState === conn.OPEN) {
        conn.send(message);
      }
    });
  }
}

/**
 * Broadcast typing indicator
 */
function broadcastTyping(userId, channelId, isTyping) {
  const connections = chatConnections.get(channelId);
  if (connections) {
    const message = JSON.stringify({
      type: 'typing',
      userId,
      channelId,
      isTyping,
    });

    connections.forEach((conn) => {
      if (conn.readyState === conn.OPEN) {
        conn.send(message);
      }
    });
  }
}

/**
 * Get session from request (simplified for Alpha)
 * TODO: Implement proper auth extraction
 */
async function getSessionFromRequest(request) {
  // Extract cookies from request
  const cookies = request.headers.cookie || '';
  // TODO: Parse session cookie and validate with auth
  // For Alpha, this is a placeholder
  return null;
}

/**
 * Broadcast message to channel
 */
export function broadcastToChannel(channelId, message) {
  const connections = chatConnections.get(channelId);
  if (connections) {
    const data = JSON.stringify(message);
    connections.forEach((conn) => {
      if (conn.readyState === conn.OPEN) {
        conn.send(data);
      }
    });
  }
}

