/**
 * WYA!? — Real-Time Chat Hook (Alpha)
 * 
 * Purpose: WebSocket-based real-time 1:1 chat
 * 
 * Features:
 * - Real-time message delivery
 * - Presence (online, typing)
 * - Message reactions
 * - Read receipts (subtle)
 * - Offline queue support
 * 
 * UX:
 * - Messages feel alive (motion, grouping)
 * - No message counts, no streaks
 * - No infinite scroll tricks
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useWebSocket from './useWebSocket';

/**
 * Real-time chat hook for 1:1 conversations
 * 
 * @param {string} otherUserId - Other user's ID
 * @returns {object} Chat state and functions
 */
export default function useRealtimeChat(otherUserId) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [presence, setPresence] = useState('offline'); // 'online' | 'away' | 'offline'
  const [queuedMessages, setQueuedMessages] = useState([]); // Offline queue
  const [pendingMessages, setPendingMessages] = useState(new Map()); // Optimistic messages
  
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const messagesEndRef = useRef(null);

  // WebSocket URL for chat
  const wsUrl = typeof window !== 'undefined' && otherUserId
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/chat?user=${otherUserId}`
    : null;

  // WebSocket connection
  const { isConnected: wsConnected, send: wsSend, subscribe } = useWebSocket(wsUrl, {
    autoReconnect: true,
    onOpen: () => {
      setIsConnected(true);
      // Send queued messages when reconnected
      flushQueuedMessages();
    },
    onClose: () => {
      setIsConnected(false);
    },
  });

  // Subscribe to WebSocket messages
  useEffect(() => {
    if (!subscribe) return;

    // Message handler
    const unsubscribeMessage = subscribe('message', (data) => {
      if (data.userId === otherUserId) {
        // New message from other user
        setMessages(prev => {
          // Check if message already exists (idempotent)
          const exists = prev.some(m => m.id === data.messageId);
          if (exists) return prev;
          
          return [...prev, {
            id: data.messageId || `temp-${Date.now()}`,
            sender_id: otherUserId,
            message_text: data.content,
            message_type: data.message_type || 'text',
            media_url: data.media_url,
            created_at: new Date(data.timestamp || Date.now()).toISOString(),
            reactions: data.reactions || {},
            read_by: data.read_by || [],
          }];
        });
      }
    });

    // Typing handler
    const unsubscribeTyping = subscribe('typing', (data) => {
      if (data.userId === otherUserId) {
        setOtherUserTyping(data.isTyping !== false);
        
        // Auto-clear typing after 3 seconds
        if (data.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      }
    });

    // Presence handler
    const unsubscribePresence = subscribe('presence', (data) => {
      if (data.userId === otherUserId) {
        setPresence(data.status || 'offline');
      }
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
      unsubscribePresence?.();
    };
  }, [subscribe, otherUserId]);

  // Load initial messages
  useEffect(() => {
    if (otherUserId) {
      loadMessages();
    }
  }, [otherUserId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Load messages from API
   */
  const loadMessages = useCallback(async () => {
    if (!otherUserId) return;

    try {
      const res = await fetch(`/api/messages/${otherUserId}`);
      if (!res.ok) return;
      
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [otherUserId]);

  /**
   * Send message (optimistic + WebSocket + API)
   */
  const sendMessage = useCallback(async (messageText, messageType = 'text', mediaUrl = null) => {
    if (!messageText.trim() || !otherUserId) return false;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      id: tempId,
      sender_id: 'me', // Will be replaced with actual user ID
      message_text: messageText,
      message_type: messageType,
      media_url: mediaUrl,
      created_at: new Date().toISOString(),
      reactions: {},
      read_by: [],
      status: 'pending', // Optimistic state
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setPendingMessages(prev => new Map(prev).set(tempId, optimisticMessage));

    // Try to send via WebSocket first
    if (isConnected && wsSend) {
      try {
        wsSend({
          type: 'message',
          recipient_id: otherUserId,
          content: messageText,
          message_type: messageType,
          media_url: mediaUrl,
        });
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }

    // Also send via API (fallback and persistence)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: otherUserId,
          message_text: messageText,
          message_type: messageType,
          media_url: mediaUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...data.message, status: 'sent' } : m
        ));
        setPendingMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
        return true;
      } else {
        // Mark as failed
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, status: 'failed' } : m
        ));
        return false;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      // Queue for retry when online
      if (!isConnected) {
        setQueuedMessages(prev => [...prev, { messageText, messageType, mediaUrl }]);
      }
      // Mark as failed
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'failed' } : m
      ));
      return false;
    }
  }, [otherUserId, isConnected, wsSend]);

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback(() => {
    if (!isConnected || !wsSend) return;
    
    const now = Date.now();
    // Throttle typing indicators (max once per 2 seconds)
    if (now - lastTypingSentRef.current < 2000) {
      return;
    }
    
    lastTypingSentRef.current = now;
    
    try {
      wsSend({
        type: 'typing',
        userId: otherUserId,
        isTyping: true,
      });
      
      setIsTyping(true);
      
      // Clear typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (isConnected && wsSend) {
          wsSend({
            type: 'typing',
            userId: otherUserId,
            isTyping: false,
          });
        }
      }, 3000);
    } catch (err) {
      console.error('Failed to send typing:', err);
    }
  }, [otherUserId, isConnected, wsSend]);

  /**
   * Flush queued messages when reconnected
   */
  const flushQueuedMessages = useCallback(async () => {
    if (queuedMessages.length === 0) return;
    
    const messagesToSend = [...queuedMessages];
    setQueuedMessages([]);
    
    for (const queued of messagesToSend) {
      await sendMessage(queued.messageText, queued.messageType, queued.mediaUrl);
    }
  }, [queuedMessages, sendMessage]);

  /**
   * Add reaction to message
   */
  const addReaction = useCallback(async (messageId, emoji) => {
    // Optimistic update
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const reactions = { ...(m.reactions || {}) };
        reactions[emoji] = [...(reactions[emoji] || []), 'me'];
        return { ...m, reactions };
      }
      return m;
    }));

    // TODO: Beta+ - Send reaction via API
    // For Alpha, reactions are client-side only
  }, []);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async () => {
    if (!otherUserId) return;

    try {
      // Mark as read via API
      await fetch(`/api/messages/${otherUserId}/read`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [otherUserId]);

  // Mark as read when messages are visible
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages, markAsRead]);

  return {
    messages,
    isConnected,
    isTyping,
    otherUserTyping,
    presence,
    sendMessage,
    sendTyping,
    addReaction,
    markAsRead,
    loadMessages,
    messagesEndRef,
  };
}

