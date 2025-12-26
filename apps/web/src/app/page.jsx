import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import LeftSidebar from "@/components/LeftSidebar";
import TopHeader from "@/components/TopHeader";
import HomeFeed from "@/components/HomeFeed";
import DiscoveryView from "@/components/DiscoveryView";
import MessagesView from "@/components/MessagesView";
import ForumsView from "@/components/ForumsView";
import ChatRoomsView from "@/components/ChatRoomsView";
import FriendsView from "@/components/FriendsView";
import ProfileView from "@/components/ProfileView";
import MediaGallery from "@/components/MediaGallery";
import VideoChatView from "@/components/VideoChatView";
import { SITE_NAME } from "@/config/site";

export const meta = () => [
  { title: SITE_NAME },
  { property: "og:title", content: SITE_NAME },
  { property: "og:site_name", content: SITE_NAME },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://wya.baby" },
  { tagName: "link", rel: "canonical", href: "https://wya.baby" },
];

export default function HomePage() {
  const [activePage, setActivePage] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case "home":
        return <HomeFeed />;
      case "discovery":
        return <DiscoveryView />;
      case "messages":
        return <MessagesView />;
      case "forums":
        return <ForumsView />;
      case "chatrooms":
        return <ChatRoomsView />;
      case "gallery":
        return <MediaGallery />;
      case "videochat":
        return <VideoChatView />;
      case "friends":
        return <FriendsView />;
      case "profile":
        return <ProfileView />;
      default:
        return <HomeFeed />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0F0F0F] overflow-hidden">
      <LeftSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 overflow-hidden">{renderActivePage()}</main>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
