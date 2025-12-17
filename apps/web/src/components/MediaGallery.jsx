import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  X,
  Heart,
  Download,
  Eye,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";

export default function MediaGallery() {
  const { data: user } = useUser();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [upload, { loading: uploadLoading }] = useUpload();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to load media");
      const data = await res.json();
      setMedia(data.media || []);
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
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload the file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const { url, mimeType, error } = await upload({
          base64: event.target.result,
        });

        if (error) {
          console.error("Upload error:", error);
          setUploading(false);
          return;
        }

        // Save to database
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_url: url,
            media_type: mimeType,
            caption: caption,
          }),
        });

        if (!res.ok) throw new Error("Failed to save media");

        setShowUploadModal(false);
        setSelectedFile(null);
        setCaption("");
        await loadMedia();
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (mediaId) => {
    try {
      const res = await fetch(`/api/gallery/${mediaId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to like media");
      await loadMedia();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-[#121218] to-[#1A1B25] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-poppins font-bold text-white text-3xl mb-2">
              Media Gallery
            </h1>
            <p className="text-[#8B8B90] text-sm">
              Share your photos and videos with the community
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-6 py-3 rounded-lg font-poppins font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all flex items-center gap-2 shadow-lg"
          >
            <Upload size={18} />
            Upload Media
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#7A5AF8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#8B8B90] font-poppins">Loading gallery...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12 bg-[#1A1A1E] border border-[#27272A] rounded-xl">
            <ImageIcon size={48} className="mx-auto mb-4 text-[#8B8B90]" />
            <p className="text-[#8B8B90] font-poppins mb-2">No media yet</p>
            <p className="text-[#555555] text-sm">
              Upload your first photo or video to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="bg-[#1A1A1E] border border-[#27272A] rounded-xl overflow-hidden group cursor-pointer hover:border-[#7A5AF8] transition-all duration-300"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="relative aspect-square overflow-hidden">
                  {item.media_type?.startsWith("image") ? (
                    <img
                      src={item.media_url}
                      alt={item.caption || "Gallery image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : item.media_type?.startsWith("video") ? (
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <Eye
                      size={32}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {item.display_name?.[0] || item.email?.[0] || "U"}
                      </span>
                    </div>
                    <span className="text-white text-xs font-medium">
                      {item.display_name || item.email || "Anonymous"}
                    </span>
                  </div>
                  {item.caption && (
                    <p className="text-[#8B8B90] text-sm mb-2 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[#8B8B90] text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                      className="flex items-center gap-1 hover:text-[#7A5AF8] transition-colors"
                    >
                      <Heart size={14} />
                      {item.likes_count || 0}
                    </button>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1E] border border-[#27272A] rounded-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-bold text-white text-xl">
                  Upload Media
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setCaption("");
                  }}
                  className="text-[#8B8B90] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F4F4F5] mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="w-full bg-[#1E1E1F] text-white border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                  />
                  {selectedFile && (
                    <p className="text-[#8B8B90] text-xs mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F4F4F5] mb-2">
                    Caption (optional)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption for your media..."
                    className="w-full bg-[#1E1E1F] text-white placeholder-[#555555] border border-[#242424] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
                    rows="3"
                  />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading || uploadLoading}
                  className="w-full bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] text-white px-6 py-3 rounded-lg font-poppins font-semibold text-sm hover:from-[#6D4CE5] hover:to-[#8B5CF6] transition-all disabled:opacity-50"
                >
                  {uploading || uploadLoading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Media Preview Modal */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <div
              className="max-w-6xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedMedia.display_name?.[0] ||
                        selectedMedia.email?.[0] ||
                        "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {selectedMedia.display_name ||
                        selectedMedia.email ||
                        "Anonymous"}
                    </h3>
                    <p className="text-[#8B8B90] text-sm">
                      {new Date(selectedMedia.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-white hover:text-[#8B8B90] transition-colors"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="bg-[#1A1A1E] rounded-xl overflow-hidden">
                {selectedMedia.media_type?.startsWith("image") ? (
                  <img
                    src={selectedMedia.media_url}
                    alt={selectedMedia.caption || "Gallery image"}
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : selectedMedia.media_type?.startsWith("video") ? (
                  <video
                    src={selectedMedia.media_url}
                    controls
                    className="w-full max-h-[70vh]"
                  />
                ) : null}
              </div>

              {selectedMedia.caption && (
                <div className="mt-4 bg-[#1A1A1E] border border-[#27272A] rounded-xl p-4">
                  <p className="text-white font-poppins">
                    {selectedMedia.caption}
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => handleLike(selectedMedia.id)}
                  className="flex items-center gap-2 bg-[#1A1A1E] border border-[#27272A] text-white px-4 py-2 rounded-lg hover:border-[#7A5AF8] transition-all"
                >
                  <Heart size={18} />
                  <span>{selectedMedia.likes_count || 0} Likes</span>
                </button>
              </div>
            </div>
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
