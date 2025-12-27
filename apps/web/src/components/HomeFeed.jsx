import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import { GlassPanel, GlowButton } from "@/components/glass";

export default function HomeFeed() {
  const { data: user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [upload, { loading: uploadLoading }] = useUpload();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPostMedia(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostMedia) return;

    setCreating(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if present
      if (selectedFile) {
        const { url, mimeType, error } = await upload({
          base64: newPostMedia,
        });

        if (error) {
          console.error("Upload error:", error);
          setCreating(false);
          return;
        }

        mediaUrl = url;
        mediaType = mimeType;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent,
          media_url: mediaUrl,
          media_type: mediaType,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      setNewPostContent("");
      setNewPostMedia(null);
      setSelectedFile(null);
      await loadPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to like post");
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#121218] to-[#1A1B25] overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Create Post */}
        <GlassPanel className="p-4 mb-6" variant="hover">
          <h2 className="font-poppins font-semibold text-white text-lg mb-4">
            Create Post
          </h2>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-[rgba(30,30,31,0.3)] backdrop-blur-sm text-white placeholder-[#8B8B90] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] focus:border-[#7A5AF8] transition-all resize-none mb-3"
            rows="3"
          />

          {/* Media Preview */}
          {newPostMedia && (
            <div className="relative mb-3 rounded-lg overflow-hidden">
              {selectedFile?.type.startsWith("image") ? (
                <img
                  src={newPostMedia}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
              ) : selectedFile?.type.startsWith("video") ? (
                <video
                  src={newPostMedia}
                  controls
                  className="w-full max-h-64"
                />
              ) : null}
              <button
                onClick={() => {
                  setNewPostMedia(null);
                  setSelectedFile(null);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[#8B8B90] hover:text-white transition-colors cursor-pointer">
              <ImageIcon size={20} />
              <span className="text-sm">Add Photo/Video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <GlowButton
              glow="purple"
              onClick={handleCreatePost}
              disabled={
                creating ||
                uploadLoading ||
                (!newPostContent.trim() && !newPostMedia)
              }
              className="px-6 py-2 font-poppins font-semibold text-sm"
            >
              {creating || uploadLoading ? "Posting..." : "Post"}
            </GlowButton>
          </div>
        </GlassPanel>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#7A5AF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#8B8B90] font-poppins">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8B8B90] font-poppins">
              No posts yet. Be the first to share!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <GlassPanel key={post.id} className="p-4" variant="hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {post.display_name?.[0] || post.email?.[0] || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-white text-sm">
                      {post.display_name || post.email || "Anonymous"}
                    </h3>
                    <p className="text-xs text-[#8B8B90]">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {post.content && (
                  <p className="text-white font-poppins text-sm mb-3 leading-relaxed">
                    {post.content}
                  </p>
                )}

                {post.media_url && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    {post.media_type?.startsWith("image") ? (
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full max-h-96 object-cover"
                      />
                    ) : post.media_type?.startsWith("video") ? (
                      <video controls className="w-full max-h-96">
                        <source src={post.media_url} type={post.media_type} />
                      </video>
                    ) : null}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-3 border-t border-[#27272A]">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-2 text-[#8B8B90] hover:text-[#7A5AF8] transition-colors"
                  >
                    <Heart size={18} />
                    <span className="text-sm">{post.likes_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-[#8B8B90] hover:text-white transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm">Comment</span>
                  </button>
                  <button className="flex items-center gap-2 text-[#8B8B90] hover:text-white transition-colors">
                    <Share2 size={18} />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </GlassPanel>
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
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #1A1A1E;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #3D3D3D;
          border-radius: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #4D4D4D;
        }
      `}</style>
    </div>
  );
}
