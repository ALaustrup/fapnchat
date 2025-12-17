import { useState, useEffect, useRef, useCallback } from "react";

const WS_RECONNECT_DELAY = 3000;
const WS_HEARTBEAT_INTERVAL = 30000;

export default function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const messageHandlersRef = useRef(new Map());

  const { autoReconnect = true, onOpen, onClose, onError } = options;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        onOpen?.();

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "ping" }));
          }
        }, WS_HEARTBEAT_INTERVAL);
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        clearInterval(heartbeatIntervalRef.current);
        onClose?.(event);

        // Auto reconnect
        if (autoReconnect && !event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(connect, WS_RECONNECT_DELAY);
        }
      };

      wsRef.current.onerror = (event) => {
        setError("WebSocket error");
        onError?.(event);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);

          // Call registered handlers
          const handler = messageHandlersRef.current.get(data.type);
          if (handler) {
            handler(data);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };
    } catch (err) {
      setError(err.message);
    }
  }, [url, autoReconnect, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimeoutRef.current);
    clearInterval(heartbeatIntervalRef.current);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((type, handler) => {
    messageHandlersRef.current.set(type, handler);
    return () => messageHandlersRef.current.delete(type);
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    send,
    subscribe,
    connect,
    disconnect,
  };
}

// Polling-based fallback for when WebSocket isn't available
export function usePollingMessages(roomId, interval = 2000) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastIdRef = useRef(0);
  const pollIntervalRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;

    try {
      const res = await fetch(`/api/chatrooms/${roomId}/messages?since=${lastIdRef.current}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.messages?.length > 0) {
        setMessages((prev) => {
          const newMessages = data.messages.filter(
            (m) => !prev.find((p) => p.id === m.id)
          );
          if (newMessages.length > 0) {
            lastIdRef.current = Math.max(...newMessages.map((m) => m.id));
            return [...prev, ...newMessages];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Polling error:", err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const startPolling = useCallback(() => {
    fetchMessages();
    pollIntervalRef.current = setInterval(fetchMessages, interval);
  }, [fetchMessages, interval]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (roomId) {
      setMessages([]);
      lastIdRef.current = 0;
      startPolling();
    }
    return stopPolling;
  }, [roomId, startPolling, stopPolling]);

  return {
    messages,
    loading,
    refetch: fetchMessages,
  };
}

// Real-time chat hook combining WebSocket with polling fallback
export function useRealtimeChat(roomId, userId) {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsUrl = typeof window !== "undefined" 
    ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/ws/chat?room=${roomId}`
    : null;

  // For now, use polling since WebSocket requires server setup
  const pollingInterval = useRef(null);
  const lastMessageId = useRef(0);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/chatrooms/${roomId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      
      if (data.messages) {
        const newMessages = data.messages.filter(m => m.id > lastMessageId.current);
        if (newMessages.length > 0) {
          lastMessageId.current = Math.max(...data.messages.map(m => m.id));
          setMessages(data.messages);
        } else if (messages.length === 0) {
          setMessages(data.messages);
          if (data.messages.length > 0) {
            lastMessageId.current = Math.max(...data.messages.map(m => m.id));
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [roomId, messages.length]);

  const sendMessage = useCallback(async (content) => {
    if (!roomId || !content.trim()) return false;

    try {
      const res = await fetch(`/api/chatrooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) return false;

      // Immediately fetch new messages
      await fetchMessages();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [roomId, fetchMessages]);

  const sendTyping = useCallback(() => {
    // Would send typing indicator via WebSocket
    // For polling, this is not implemented
  }, []);

  useEffect(() => {
    if (roomId) {
      setMessages([]);
      lastMessageId.current = 0;
      fetchMessages();
      
      // Poll every 2 seconds
      pollingInterval.current = setInterval(fetchMessages, 2000);
      setIsConnected(true);
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      setIsConnected(false);
    };
  }, [roomId]);

  return {
    messages,
    participants,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping,
    refetch: fetchMessages,
  };
}

