import { useState, useEffect } from "react";
import ChatInput from "@/features/chat/components/ChatInput";
import ChatList from "@/features/chat/components/ChatList";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import { useThemeStore } from "@/store/themeStore";
import { useChatStore } from "@/features/chat/store/chatStore";
import { useKnowledgeStore } from "@/features/chat/store/knowledgeStore";

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggle } = useThemeStore();
  const fetchModels = useChatStore((s) => s.fetchModels);
  const fetchSessions = useChatStore((s) => s.fetchSessions);
  const fetchKnowledges = useKnowledgeStore((s) => s.fetchKnowledges);

  useEffect(() => {
    fetchModels();
    fetchSessions();
    fetchKnowledges();
  }, [fetchModels, fetchSessions, fetchKnowledges]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Sidebar */}
      <div
        className="flex-shrink-0 transition-all duration-300"
        style={{
          width: sidebarOpen ? 260 : 0,
          background: "var(--bg-sidebar)",
          borderRight: sidebarOpen ? "1px solid var(--border-color)" : "none",
          overflow: "hidden",
        }}
      >
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 h-12 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:opacity-80"
                style={{ color: "var(--text-secondary)" }}
                title="Open sidebar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
            )}
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              AI Chat
            </span>
          </div>
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Chat content */}
        <ChatList />
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatPage;
