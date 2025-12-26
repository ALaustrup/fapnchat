/**
 * WYA!? — Guestbook Module (Alpha)
 * 
 * Purpose: Display and add guestbook entries
 */

import { useState, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import useUser from "@/utils/useUser";

export default function GuestbookModule({ roomUserId, isOwner, onUpdate }) {
  const { data: user } = useUser();
  const [entries, setEntries] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [roomUserId]);

  const loadEntries = async () => {
    try {
      const res = await fetch(`/api/profile-rooms/${roomUserId}/guestbook`);
      if (!res.ok) throw new Error("Failed to load guestbook");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/profile-rooms/${roomUserId}/guestbook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add entry");
      }

      setNewMessage("");
      await loadEntries();
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-[#7A5AF8]" />
          <h3 className="font-semibold text-white">Guestbook</h3>
        </div>
        <p className="text-[#8B8B90] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1E] border border-[#27272A] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={20} className="text-[#7A5AF8]" />
        <h3 className="font-semibold text-white">Guestbook</h3>
        <span className="text-xs text-[#8B8B90]">({entries.length})</span>
      </div>

      {/* Entries */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-[#8B8B90] text-sm">No entries yet. Be the first!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {entry.display_name?.[0] || entry.user_id?.[0] || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">
                    {entry.display_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-[#8B8B90]">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-[#D4D4D8] break-words">{entry.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Entry Form */}
      {!isOwner && user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Leave a message..."
            className="flex-1 bg-[#0F0F0F] text-white placeholder-[#555555] border border-[#27272A] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || submitting}
            className="bg-[#7A5AF8] text-white p-2 rounded-lg hover:bg-[#6D4CE5] transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

