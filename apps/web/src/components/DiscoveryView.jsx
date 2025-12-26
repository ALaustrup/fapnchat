/**
 * WYA!? — Discovery View Component (Alpha)
 * 
 * Purpose: Simple list UI for geo-first discovery
 * 
 * Rules:
 * - Manual refresh only (no infinite feed)
 * - Show distance tier and explanation
 * - Simple list, no algorithmic sorting
 * - Proximity-first display
 */

import { useState, useEffect } from "react";
import { RefreshCw, MapPin, Users } from "lucide-react";
import useUser from "@/utils/useUser";
import { GlassPanel, GlowButton } from "@/components/glass";

export default function DiscoveryView() {
  const { data: user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    checkLocationStatus();
    loadDiscovery();
  }, []);

  const checkLocationStatus = async () => {
    try {
      const res = await fetch("/api/geo/location");
      if (res.ok) {
        const data = await res.json();
        setHasLocation(data.has_location);
      }
    } catch (err) {
      console.error("Failed to check location status:", err);
    }
  };

  const loadDiscovery = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/discovery?limit=50");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load discovery");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setHasMore(data.has_more || false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDiscovery();
  };

  const getTierColor = (tier) => {
    const colors = {
      immediate: "text-[#00FF88]",
      nearby: "text-[#7A5AF8]",
      local: "text-[#9F7AEA]",
      city: "text-[#8B8B90]",
    };
    return colors[tier] || "text-[#8B8B90]";
  };

  const getTierIcon = (tier) => {
    // All tiers use same icon for Alpha (simple)
    return <MapPin size={14} />;
  };

  if (!hasLocation) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <GlassPanel opacity={0.2} blur="lg" className="p-8 max-w-md text-center">
          <MapPin size={48} className="mx-auto mb-4 text-[#7A5AF8]" />
          <h2 className="text-xl font-semibold text-white mb-2 font-poppins">
            Enable Location Sharing
          </h2>
          <p className="text-[#8B8B90] mb-6">
            Share your location to discover users nearby. Your exact location is never exposed.
          </p>
          <GlowButton
            onClick={() => {
              // TODO: Open location settings modal
              alert("Location settings coming soon");
            }}
            variant="primary"
          >
            Enable Location
          </GlowButton>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#121218] to-[#1A1B25]">
      {/* Header */}
      <div className="p-4 border-b border-[#27272A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-[#7A5AF8]" />
          <h2 className="text-lg font-semibold text-white font-poppins">
            Discover
          </h2>
          {total > 0 && (
            <span className="text-sm text-[#8B8B90]">({total} nearby)</span>
          )}
        </div>
        <GlowButton
          onClick={handleRefresh}
          disabled={refreshing}
          variant="ghost"
          className="!p-2"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </GlowButton>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-[#8B8B90] py-8">Loading...</div>
        ) : error ? (
          <div className="rounded-lg bg-[#FF5656] bg-opacity-10 border border-[#FF5656] p-4 text-[#FF5656]">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-[#8B8B90] py-8">
            <MapPin size={48} className="mx-auto mb-4 opacity-50" />
            <p>No users found nearby</p>
            <p className="text-sm mt-2">Try refreshing or check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((discoveredUser) => (
              <GlassPanel
                key={discoveredUser.user_id}
                opacity={0.15}
                blur="md"
                className="p-4 cursor-pointer hover:opacity-20 transition-opacity"
                onClick={() => {
                  // TODO: Navigate to user profile
                  window.location.href = `/profile?user_id=${discoveredUser.user_id}`;
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] flex items-center justify-center flex-shrink-0">
                    {discoveredUser.avatar_url ? (
                      <img
                        src={discoveredUser.avatar_url}
                        alt={discoveredUser.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold">
                        {discoveredUser.display_name?.[0] || "U"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-sm font-poppins truncate">
                        {discoveredUser.display_name || "Anonymous"}
                      </h3>
                      <span
                        className={`text-xs flex items-center gap-1 ${getTierColor(
                          discoveredUser.distance_tier
                        )}`}
                      >
                        {getTierIcon(discoveredUser.distance_tier)}
                        {discoveredUser.distance_tier_display}
                      </span>
                    </div>
                    {discoveredUser.bio && (
                      <p className="text-xs text-[#8B8B90] line-clamp-2 mb-2">
                        {discoveredUser.bio}
                      </p>
                    )}
                    <p className="text-xs text-[#7A5AF8]">
                      {discoveredUser.explanation}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="p-4 border-t border-[#27272A] text-center">
          <p className="text-sm text-[#8B8B90]">
            Showing {users.length} of {total} users
          </p>
          <p className="text-xs text-[#8B8B90] mt-1">
            Refresh to see more
          </p>
        </div>
      )}

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}

