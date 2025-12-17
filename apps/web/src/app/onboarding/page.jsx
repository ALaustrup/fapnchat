import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingDisplayName = localStorage.getItem("pendingDisplayName");
      if (pendingDisplayName) setDisplayName(pendingDisplayName);
    }
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      // Check if user already has a profile
      const checkProfile = async () => {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            // User already completed onboarding
            window.location.href = "/";
          }
        }
      };
      checkProfile();
    }
  }, [user, userLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName || user?.name || user?.email?.split("@")[0],
          bio,
          interests: interestsArray,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create profile");
      }

      // Clear pending data
      if (typeof window !== "undefined") {
        localStorage.removeItem("pendingDisplayName");
      }

      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Failed to complete setup. Please try again.");
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0C0D0F]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0C0D0F] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#1A1A1E] border border-[#27272A] rounded-2xl p-8"
      >
        <h1 className="mb-2 text-center text-3xl font-semibold text-white font-poppins">
          Complete Your Profile
        </h1>
        <p className="mb-8 text-center text-sm text-[#8B8B90]">
          Tell us a bit about yourself
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows="3"
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#F4F4F5]">
              Interests (comma-separated)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., Gaming, Music, Photography"
              className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-[#FF5656] bg-opacity-10 border border-[#FF5656] p-3 text-sm text-[#FF5656]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-4 py-3 rounded-lg font-poppins font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] active:from-[#5B3FD4] active:to-[#7C3AED] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}
