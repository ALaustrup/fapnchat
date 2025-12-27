import { useState, useEffect } from "react";
import { Send, Search } from "lucide-react";
import useUser from "@/utils/useUser";
import { GlassPanel, GlowButton } from "@/components/ui";

export default function MessagesView() {
  const { data: user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const res = await fetch(`/api/messages/${userId}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: selectedConversation.id,
          message: newMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setNewMessage("");
      await loadMessages(selectedConversation.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-[#121218] to-[#1A1B25]">
      {/* Conversations List */}
      <div className="w-80 flex flex-col bg-gradient-to-br from-[#121218] to-[#1A1B25]">
        <GlassPanel className="p-4 border-b border-[rgba(255,255,255,0.1)]" variant="default">
          <h2 className="font-poppins font-semibold text-white text-lg mb-3">
            Messages
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B8B90]"
            />
          </div>
        </GlassPanel>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-[#8B8B90]">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-[#8B8B90]">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <GlassPanel
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                variant={selectedConversation?.id === conv.id ? "active" : "hover"}
                className="p-4 mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {conv.display_name?.[0] || conv.email?.[0] || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins font-semibold text-white text-sm truncate">
                      {conv.display_name || conv.email}
                    </h3>
                    <p className="text-xs text-[#8B8B90] truncate">
                      {conv.last_message || "No messages yet"}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <GlassPanel className="p-4 border-b border-[rgba(255,255,255,0.1)]" variant="default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {selectedConversation.display_name?.[0] ||
                      selectedConversation.email?.[0] ||
                      "U"}
                  </span>
                </div>
                <h3 className="font-poppins font-semibold text-white">
                  {selectedConversation.display_name ||
                    selectedConversation.email}
                </h3>
              </div>
            </GlassPanel>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <GlassPanel
                    className={`max-w-md px-4 py-2 ${
                      msg.sender_id === user?.id
                        ? "bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white border-0"
                        : "text-white"
                    }`}
                    variant="default"
                  >
                    <p className="text-sm font-poppins">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </GlassPanel>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <GlassPanel className="p-4 border-t border-[rgba(255,255,255,0.1)]" variant="default">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[rgba(30,30,31,0.3)] backdrop-blur-sm text-white placeholder-[#8B8B90] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                />
                <GlowButton
                  glow="purple"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3"
                >
                  <Send size={20} />
                </GlowButton>
              </div>
            </GlassPanel>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#8B8B90] font-poppins">
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}
