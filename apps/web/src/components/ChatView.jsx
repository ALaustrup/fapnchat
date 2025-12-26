/**
 * WYA!? — Chat View Component (Alpha)
 * 
 * Purpose: Real-time 1:1 chat UI with glass-style design
 * 
 * Features:
 * - Real-time messaging via WebSocket
 * - Presence indicators (online, typing)
 * - Message reactions
 * - Read receipts (subtle)
 * - Message grouping
 * - Motion animations
 * 
 * UX Constraints:
 * - Messages feel alive (motion, grouping)
 * - No message counts, no streaks
 * - No infinite scroll tricks
 */

import { useState, useEffect, useRef } from "react";
import { Send, Smile, Image as ImageIcon, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import useRealtimeChat from "@/utils/useRealtimeChat";
import useUser from "@/utils/useUser";
import { GlassPanel, PresenceDot } from "@/components/glass";

export default function ChatView({ otherUserId, otherUserName, otherUserAvatar }) {
  const { data: currentUser } = useUser();
  const {
    messages,
    isConnected,
    otherUserTyping,
    presence,
    sendMessage,
    sendTyping,
    addReaction,
    messagesEndRef,
  } = useRealtimeChat(otherUserId);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsTyping(true);
    sendTyping();

    // Clear typing after 3 seconds of no input
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  // Handle send
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue("");
    setIsTyping(false);
    
    await sendMessage(text, 'text');
  };

  // Group messages by sender and time
  const groupedMessages = [];
  let currentGroup = null;

  messages.forEach((msg, index) => {
    const isMe = msg.sender_id === currentUser?.id || msg.sender_id === 'me';
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const timeDiff = prevMsg 
      ? new Date(msg.created_at) - new Date(prevMsg.created_at)
      : Infinity;
    const sameSender = prevMsg && prevMsg.sender_id === msg.sender_id;
    const shouldGroup = sameSender && timeDiff < 60000; // 1 minute

    if (shouldGroup && currentGroup) {
      currentGroup.messages.push(msg);
    } else {
      currentGroup = {
        id: `group-${index}`,
        senderId: msg.sender_id,
        isMe,
        messages: [msg],
        timestamp: msg.created_at,
      };
      groupedMessages.push(currentGroup);
    }
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#121218] to-[#1A1B25]">
      {/* Header */}
      <GlassPanel
        opacity={0.15}
        blur="md"
        className="p-4 border-b border-[#27272A] flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {otherUserAvatar ? (
            <img
              src={otherUserAvatar}
              alt={otherUserName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {otherUserName?.[0] || "U"}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white text-sm font-poppins">
              {otherUserName || "Unknown"}
            </h3>
            <div className="flex items-center gap-2">
              <PresenceDot status={presence} size={8} />
              <span className="text-xs text-[#8B8B90]">
                {presence === 'online' ? 'Online' : 
                 presence === 'away' ? 'Away' : 
                 'Offline'}
              </span>
              {otherUserTyping && (
                <span className="text-xs text-[#7A5AF8] animate-pulse">
                  typing...
                </span>
              )}
            </div>
          </div>
        </div>
        {!isConnected && (
          <div className="text-xs text-[#FFB800] flex items-center gap-1">
            <div className="w-2 h-2 bg-[#FFB800] rounded-full animate-pulse" />
            Offline
          </div>
        )}
      </GlassPanel>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {groupedMessages.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${group.isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex flex-col ${group.isMe ? "items-end" : "items-start"} max-w-md`}>
                {group.messages.map((msg, msgIndex) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: msgIndex * 0.05 }}
                    className={`mb-1 ${group.isMe ? "ml-auto" : "mr-auto"}`}
                  >
                    <GlassPanel
                      opacity={group.isMe ? 0.25 : 0.15}
                      blur="md"
                      glow={msg.status === 'pending'}
                      className={`px-4 py-2 rounded-lg ${
                        group.isMe
                          ? "bg-gradient-to-r from-[#7A5AF8]/30 to-[#9F7AEA]/30"
                          : ""
                      }`}
                    >
                      {msg.message_type === 'text' && (
                        <p className="text-sm text-white font-poppins whitespace-pre-wrap">
                          {msg.message_text}
                        </p>
                      )}
                      {msg.message_type === 'image' && msg.media_url && (
                        <img
                          src={msg.media_url}
                          alt="Shared image"
                          className="max-w-xs rounded-lg mt-1"
                        />
                      )}
                      {msg.message_type === 'audio' && msg.media_url && (
                        <audio controls src={msg.media_url} className="mt-1" />
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#8B8B90]">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.status === 'pending' && (
                          <span className="text-xs text-[#8B8B90]">•</span>
                        )}
                        {msg.status === 'failed' && (
                          <span className="text-xs text-[#FF5656]">Failed</span>
                        )}
                        {msg.status === 'sent' && group.isMe && (
                          <span className="text-xs text-[#8B8B90]">✓</span>
                        )}
                      </div>
                    </GlassPanel>
                  </motion.div>
                ))}
                {group.messages.length > 1 && (
                  <span className="text-xs text-[#8B8B90] mt-1 px-2">
                    {new Date(group.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <GlassPanel
        opacity={0.15}
        blur="md"
        className="p-4 border-t border-[#27272A]"
      >
        <div className="flex items-end gap-3">
          {/* Media buttons (Alpha: image, audio only) */}
          <div className="flex gap-2">
            <button
              className="p-2 text-[#8B8B90] hover:text-[#7A5AF8] transition-colors"
              title="Send image"
              onClick={() => {
                // TODO: Implement image upload
                alert("Image upload coming soon");
              }}
            >
              <ImageIcon size={20} />
            </button>
            <button
              className="p-2 text-[#8B8B90] hover:text-[#7A5AF8] transition-colors"
              title="Send audio"
              onClick={() => {
                // TODO: Implement audio upload
                alert("Audio upload coming soon");
              }}
            >
              <Mic size={20} />
            </button>
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-[#1E1E1F]/50 text-white placeholder-[#555555] border border-[#242424]/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all backdrop-blur-sm"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConnected}
            className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white p-3 rounded-lg hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </GlassPanel>

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}

