import { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserX, MessageCircle } from "lucide-react";

export default function FriendsView() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
    loadSuggestions();
  }, []);

  const loadFriends = async () => {
    try {
      const res = await fetch("/api/friends");
      if (!res.ok) throw new Error("Failed to load friends");
      const data = await res.json();
      setFriends(data.friends || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const res = await fetch("/api/friends/pending");
      if (!res.ok) throw new Error("Failed to load pending requests");
      const data = await res.json();
      setPendingRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const res = await fetch("/api/friends/suggestions");
      if (!res.ok) throw new Error("Failed to load suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_id: userId }),
      });
      if (!res.ok) throw new Error("Failed to send friend request");
      await loadSuggestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const res = await fetch(`/api/friends/${userId}/accept`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to accept request");
      await loadPendingRequests();
      await loadFriends();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#121218] to-[#1A1B25] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h2 className="font-poppins font-semibold text-white text-2xl mb-6">
          Friends
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#27272A]">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 font-poppins font-medium text-sm transition-colors ${
              activeTab === "friends"
                ? "text-[#7A5AF8] border-b-2 border-[#7A5AF8]"
                : "text-[#8B8B90] hover:text-white"
            }`}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-poppins font-medium text-sm transition-colors ${
              activeTab === "requests"
                ? "text-[#7A5AF8] border-b-2 border-[#7A5AF8]"
                : "text-[#8B8B90] hover:text-white"
            }`}
          >
            Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 font-poppins font-medium text-sm transition-colors ${
              activeTab === "suggestions"
                ? "text-[#7A5AF8] border-b-2 border-[#7A5AF8]"
                : "text-[#8B8B90] hover:text-white"
            }`}
          >
            Suggestions
          </button>
        </div>

        {/* Friends List */}
        {activeTab === "friends" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-12 text-[#8B8B90]">
                Loading...
              </div>
            ) : friends.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-[#8B8B90]">
                No friends yet. Start adding friends!
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {friend.display_name?.[0] || friend.email?.[0] || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-white">
                      {friend.display_name || friend.email}
                    </h3>
                    {friend.bio && (
                      <p className="text-sm text-[#8B8B90] truncate">
                        {friend.bio}
                      </p>
                    )}
                  </div>
                  <button className="bg-[#1E1E1F] text-white p-2 rounded-lg hover:bg-[#7A5AF8] transition-colors">
                    <MessageCircle size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Requests */}
        {activeTab === "requests" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-[#8B8B90]">
                No pending requests
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {request.display_name?.[0] || request.email?.[0] || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-white">
                      {request.display_name || request.email}
                    </h3>
                    <p className="text-sm text-[#8B8B90]">
                      Wants to be friends
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.user_id)}
                      className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white p-2 rounded-lg hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all"
                    >
                      <UserCheck size={20} />
                    </button>
                    <button className="bg-[#1E1E1F] text-[#EF4444] p-2 rounded-lg hover:bg-[#EF4444] hover:text-white transition-all">
                      <UserX size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Suggestions */}
        {activeTab === "suggestions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-[#8B8B90]">
                No suggestions available
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {suggestion.display_name?.[0] ||
                        suggestion.email?.[0] ||
                        "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-white">
                      {suggestion.display_name || suggestion.email}
                    </h3>
                    {suggestion.bio && (
                      <p className="text-sm text-[#8B8B90] truncate">
                        {suggestion.bio}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddFriend(suggestion.id)}
                    className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white p-2 rounded-lg hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
              ))
            )}
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
