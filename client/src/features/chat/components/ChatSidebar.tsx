import { useChatStore } from "../store/chatStore";
import { useKnowledgeStore } from "../store/knowledgeStore";
import ModelSelector from "./ModelSelector";
import KnowledgeSelector from "./KnowledgeSelector";
import KnowledgePanel from "./KnowledgePanel";
import { useState } from "react";

interface Props {
  onClose: () => void;
}

const ChatSidebar = ({ onClose }: Props) => {
  const { sessions, createSession, setCurrentSessionId, currentSessionId, deleteSession } = useChatStore();
  const { fetchKnowledges } = useKnowledgeStore();
  const [showKnowledge, setShowKnowledge] = useState(false);

  const handleOpenKnowledge = () => {
    fetchKnowledges();
    setShowKnowledge(true);
  };

  // Knowledge management panel view
  if (showKnowledge) {
    return <KnowledgePanel onClose={() => setShowKnowledge(false)} />;
  }

  return (
    <div className="flex flex-col h-full p-3">
      {/* New chat button */}
      <button
        onClick={() => {
          createSession();
        }}
        className="flex items-center gap-2 w-full px-3 py-2.5 mb-3 rounded-lg text-sm font-medium transition-colors"
        style={{
          border: "1px solid var(--border-color)",
          color: "var(--text-primary)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        新对话
      </button>

      {/* Model selector */}
      <div className="mb-2">
        <ModelSelector />
      </div>

      {/* Knowledge selector */}
      <div className="mb-3">
        <KnowledgeSelector />
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="group flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors"
            style={{
              background: s.id === currentSessionId ? "var(--bg-hover)" : "transparent",
              color: "var(--text-primary)",
            }}
            onClick={() => setCurrentSessionId(s.id)}
            onMouseEnter={(e) => {
              if (s.id !== currentSessionId) e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              if (s.id !== currentSessionId) e.currentTarget.style.background = "transparent";
            }}
          >
            <span className="flex-1 truncate">{s.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
              title="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="mt-2 space-y-1">
        {/* Knowledge management */}
        <button
          onClick={handleOpenKnowledge}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          知识库管理
        </button>

        {/* Close sidebar */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
          收起侧边栏
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
