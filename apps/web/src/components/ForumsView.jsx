import { useState, useEffect } from "react";
import { MessageSquare, Users as UsersIcon, Plus } from "lucide-react";

export default function ForumsView() {
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      const res = await fetch("/api/forums");
      if (!res.ok) throw new Error("Failed to load forums");
      const data = await res.json();
      setForums(data.forums || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#121218] to-[#1A1B25] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-poppins font-semibold text-white text-2xl">
            Forums
          </h2>
          <button className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-4 py-2 rounded-lg font-poppins font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all flex items-center gap-2">
            <Plus size={18} />
            Create Forum
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#7A5AF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#8B8B90] font-poppins">Loading forums...</p>
          </div>
        ) : forums.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8B8B90] font-poppins">
              No forums yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forums.map((forum) => (
              <div
                key={forum.id}
                className="bg-[#1A1A1E] border border-[#27272A] rounded-xl p-5 hover:border-[#7A5AF8] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-poppins font-semibold text-white text-lg">
                    {forum.title}
                  </h3>
                  {forum.category && (
                    <span className="bg-[#7A5AF8] bg-opacity-20 text-[#9F7AEA] px-3 py-1 rounded-full text-xs font-semibold">
                      {forum.category}
                    </span>
                  )}
                </div>
                <p className="text-[#8B8B90] text-sm mb-4 font-poppins">
                  {forum.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#8B8B90]">
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{forum.post_count || 0} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UsersIcon size={14} />
                    <span>{forum.member_count || 0} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .font-poppins {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
