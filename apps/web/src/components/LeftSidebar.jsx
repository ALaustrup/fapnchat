import {
  Home,
  MessageCircle,
  Users,
  User,
  Layers,
  MessageSquare,
  Video,
  Settings,
  LogOut,
  X,
  Image as ImageIcon,
} from "lucide-react";
import MusicPlayer from "./MusicPlayer";
import { SITE_NAME } from "@/config/site";

export default function LeftSidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activePage,
  setActivePage,
}) {
  const mainMenuItems = [
    { icon: Home, label: "Home", key: "home" },
    { icon: MessageCircle, label: "Messages", key: "messages" },
    { icon: Layers, label: "Forums", key: "forums" },
    { icon: MessageSquare, label: "Chat Rooms", key: "chatrooms" },
    { icon: ImageIcon, label: "Gallery", key: "gallery" },
    { icon: Video, label: "Video Chat", key: "videochat" },
    { icon: Users, label: "Friends", key: "friends" },
    { icon: User, label: "Profile", key: "profile" },
  ];

  const handleMenuItemClick = (key) => {
    setActivePage(key);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const NavItem = ({ icon: Icon, label, itemKey, active }) => (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 ${
        active
          ? "bg-gradient-to-r from-[#2B2B2B] to-[#1F1F1F] border border-[#3D3D3D] text-white"
          : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#17171B] active:bg-[#0F0F12] active:text-white"
      }`}
      onClick={() => handleMenuItemClick(itemKey)}
    >
      <Icon size={20} strokeWidth={1.5} />
      <span className="font-medium text-[15px] leading-tight">{label}</span>
    </div>
  );

  const SectionLabel = ({ children }) => (
    <div className="text-[#6B7280] text-[11px] font-medium uppercase tracking-wide mb-2">
      {children}
    </div>
  );

  return (
    <div
      className={`
      w-[260px] bg-[#0C0D0F] flex flex-col h-screen
      ${isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 shadow-2xl" : "hidden lg:flex"}
      transition-all duration-300 ease-in-out
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-[60px] pl-6 pr-4">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="w-6 h-6 bg-gradient-to-r from-[#7A5AF8] to-[#9F7AEA] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          {/* Brand */}
          <span className="text-white font-semibold text-[18px] leading-tight">
            {SITE_NAME}
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden w-8 h-8 bg-[#1F1F26] rounded-lg flex items-center justify-center hover:bg-[#262630] active:bg-[#1A1A1E] transition-colors duration-200"
        >
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 pt-9 pb-6 overflow-y-auto">
        {/* Main Menu */}
        <div className="mb-7">
          <SectionLabel>MAIN MENU</SectionLabel>
          <div className="space-y-1">
            {mainMenuItems.map((item, index) => (
              <NavItem
                key={index}
                icon={item.icon}
                label={item.label}
                itemKey={item.key}
                active={activePage === item.key}
              />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-1 mb-6">
          <NavItem
            icon={Settings}
            label="Settings"
            itemKey="settings"
            active={activePage === "settings"}
          />
        </div>

        {/* Music Player */}
        <div className="mb-6">
          <div className="text-[#6B7280] text-[11px] font-medium uppercase tracking-wide mb-2">
            NOW PLAYING
          </div>
          <MusicPlayer compact />
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-[#27272A]">
          <a href="/account/logout">
            <div className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 text-[#EF4444] hover:bg-[#17171B] active:bg-[#0F0F12]">
              <LogOut size={20} strokeWidth={1.5} />
              <span className="font-medium text-[15px] leading-tight">
                Sign Out
              </span>
            </div>
          </a>
        </div>
      </div>

      <style jsx>{`
        /* Custom scrollbar for mobile */
        .overflow-y-auto::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        
        .overflow-y-auto {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
