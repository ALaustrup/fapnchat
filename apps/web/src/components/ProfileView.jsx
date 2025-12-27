import { useState, useEffect } from "react";
import {
  User,
  Edit,
  Camera,
  MapPin,
  Link as LinkIcon,
  Music,
  Settings,
  Save,
  X,
  Twitter,
  Instagram,
  Globe,
  Coins,
  Users,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import useBits from "@/utils/useBits";
import { NowPlayingStatus } from "./MusicPlayer";
import { GlassPanel, FloatingCard, GlowButton } from "@/components/glass";

export default function ProfileView() {
  const { data: user } = useUser();
  const { balance } = useBits();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [upload, { loading: uploading }] = useUpload();

  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    location: "",
    website: "",
    theme_color: "#7A5AF8",
    avatar_url: "",
    banner_url: "",
    profile_music_url: "",
    profile_music_provider: "",
    social_links: { twitter: "", instagram: "" },
    is_private: false,
    show_online_status: true,
    show_now_playing: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          display_name: data.profile.display_name || "",
          bio: data.profile.bio || "",
          location: data.profile.location || "",
          website: data.profile.website || "",
          theme_color: data.profile.theme_color || "#7A5AF8",
          avatar_url: data.profile.avatar_url || "",
          banner_url: data.profile.banner_url || "",
          profile_music_url: data.profile.profile_music_url || "",
          profile_music_provider: data.profile.profile_music_provider || "",
          social_links: data.profile.social_links || { twitter: "", instagram: "" },
          is_private: data.profile.is_private || false,
          show_online_status: data.profile.show_online_status !== false,
          show_now_playing: data.profile.show_now_playing !== false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setProfile(data.profile);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const { url, error } = await upload({ base64: event.target.result });
      if (error) {
        alert("Upload failed");
        return;
      }
      setFormData({ ...formData, [type]: url });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#121218] to-[#1A1B25]">
        <div className="w-8 h-8 border-2 border-[#7A5AF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-[#121218] to-[#1A1B25] overflow-y-auto">
      {/* Banner */}
      <div
        className="h-48 md:h-64 relative"
        style={{
          backgroundColor: formData.theme_color,
          backgroundImage: formData.banner_url ? `url(${formData.banner_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {editing && (
          <label className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
            <Camera size={18} />
            Change Banner
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "banner_url")}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full border-4 border-[#0F0F0F] overflow-hidden"
              style={{ backgroundColor: formData.theme_color }}
            >
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {formData.display_name?.[0] || user?.email?.[0] || "U"}
                  </span>
                </div>
              )}
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#7A5AF8] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#6D4CE5] transition-colors">
                <Camera size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "avatar_url")}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Name & Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {formData.display_name || user?.email?.split("@")[0] || "Anonymous"}
              </h1>
              {profile?.is_private && <EyeOff size={18} className="text-[#8B8B90]" />}
            </div>
            <p className="text-[#8B8B90] text-sm mb-3">{user?.email}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-[#FFD700]">
                <Coins size={16} />
                <span className="font-semibold">{balance.toLocaleString()} Bits</span>
              </div>
              <div className="flex items-center gap-1 text-[#8B8B90]">
                <Users size={16} />
                <span>{profile?.followers_count || 0} followers</span>
              </div>
              <div className="flex items-center gap-1 text-[#8B8B90]">
                <FileText size={16} />
                <span>{profile?.posts_count || 0} posts</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div>
            {editing ? (
              <div className="flex gap-2">
                <GlowButton
                  glow="amber"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2"
                >
                  Cancel
                </GlowButton>
                <GlowButton
                  glow="purple"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </GlowButton>
              </div>
            ) : (
              <GlowButton
                glow="cyan"
                variant="ghost"
                onClick={() => setEditing(true)}
                className="px-4 py-2 flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Profile
              </GlowButton>
            )}
          </div>
        </div>

        {/* Now Playing */}
        {profile?.show_now_playing && (
          <div className="mb-6">
            <NowPlayingStatus userId={user?.id} />
          </div>
        )}

        {/* Tabs */}
        <GlassPanel className="p-1 mb-6" variant="default">
          <div className="flex gap-1">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#7A5AF8] text-white"
                  : "text-[#8B8B90] hover:text-white"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
          </div>
        </GlassPanel>

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bio & Info */}
            <FloatingCard className="p-6">
              <h3 className="font-semibold text-white mb-4">About</h3>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#8B8B90] mb-1 block">Display Name</label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full bg-[rgba(15,15,15,0.5)] backdrop-blur-sm text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#8B8B90] mb-1 block">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-[rgba(15,15,15,0.5)] backdrop-blur-sm text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8] resize-none"
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#8B8B90] mb-1 block">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[rgba(15,15,15,0.5)] backdrop-blur-sm text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#8B8B90] mb-1 block">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-[rgba(15,15,15,0.5)] backdrop-blur-sm text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.bio ? (
                    <p className="text-white text-sm leading-relaxed">{formData.bio}</p>
                  ) : (
                    <p className="text-[#555555] text-sm italic">No bio yet</p>
                  )}
                  
                  {formData.location && (
                    <div className="flex items-center gap-2 text-[#8B8B90] text-sm">
                      <MapPin size={14} />
                      {formData.location}
                    </div>
                  )}
                  
                  {formData.website && (
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#7A5AF8] text-sm hover:underline"
                    >
                      <LinkIcon size={14} />
                      {formData.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              )}
            </FloatingCard>

            {/* Customization */}
            <FloatingCard className="p-6">
              <h3 className="font-semibold text-white mb-4">Customization</h3>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#8B8B90] mb-1 block">Theme Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.theme_color}
                        onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.theme_color}
                        onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                        className="flex-1 bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-[#8B8B90] mb-1 block">Profile Music (Spotify/SoundCloud URL)</label>
                    <input
                      type="url"
                      value={formData.profile_music_url}
                      onChange={(e) => setFormData({ ...formData, profile_music_url: e.target.value })}
                      className="w-full bg-[rgba(15,15,15,0.5)] backdrop-blur-sm text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[#8B8B90] mb-2 block">Social Links</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Twitter size={16} className="text-[#1DA1F2]" />
                        <input
                          type="text"
                          value={formData.social_links?.twitter || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            social_links: { ...formData.social_links, twitter: e.target.value }
                          })}
                          className="flex-1 bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                          placeholder="@username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram size={16} className="text-[#E4405F]" />
                        <input
                          type="text"
                          value={formData.social_links?.instagram || ""}
                          onChange={(e) => setFormData({
                            ...formData,
                            social_links: { ...formData.social_links, instagram: e.target.value }
                          })}
                          className="flex-1 bg-[#0F0F0F] text-white border border-[#27272A] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A5AF8]"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: formData.theme_color }}
                    />
                    <span className="text-[#8B8B90] text-sm">Theme: {formData.theme_color}</span>
                  </div>
                  
                  {formData.profile_music_url && (
                    <div className="flex items-center gap-2 text-[#8B8B90] text-sm">
                      <Music size={14} />
                      <span>Profile music set</span>
                    </div>
                  )}
                  
                  {(formData.social_links?.twitter || formData.social_links?.instagram) && (
                    <div className="flex items-center gap-3">
                      {formData.social_links?.twitter && (
                        <a
                          href={`https://twitter.com/${formData.social_links.twitter.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1DA1F2] hover:opacity-80"
                        >
                          <Twitter size={18} />
                        </a>
                      )}
                      {formData.social_links?.instagram && (
                        <a
                          href={`https://instagram.com/${formData.social_links.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E4405F] hover:opacity-80"
                        >
                          <Instagram size={18} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </FloatingCard>
          </div>
        )}

        {activeTab === "settings" && (
          <FloatingCard className="p-6">
            <h3 className="font-semibold text-white mb-4">Privacy Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Private Profile</p>
                  <p className="text-[#8B8B90] text-sm">Only approved followers can see your content</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, is_private: !formData.is_private })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.is_private ? "bg-[#7A5AF8]" : "bg-[#27272A]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.is_private ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Show Online Status</p>
                  <p className="text-[#8B8B90] text-sm">Let others see when you're online</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, show_online_status: !formData.show_online_status })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.show_online_status ? "bg-[#7A5AF8]" : "bg-[#27272A]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.show_online_status ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Show Now Playing</p>
                  <p className="text-[#8B8B90] text-sm">Display what you're listening to on your profile</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, show_now_playing: !formData.show_now_playing })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.show_now_playing ? "bg-[#7A5AF8]" : "bg-[#27272A]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.show_now_playing ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full mt-4 bg-[#7A5AF8] text-white py-3 rounded-lg font-semibold hover:bg-[#6D4CE5] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              )}
            </div>
          </FloatingCard>
        )}
      </div>
    </div>
  );
}
