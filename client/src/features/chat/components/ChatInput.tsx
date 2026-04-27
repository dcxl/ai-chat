import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "@/api/chat";

const ChatInput = () => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, updateMessage, fetchSessions, currentSessionId, currentModel, isLoading, setLoading, createSession } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [text]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      createSession();
      sessionId = useChatStore.getState().currentSessionId!;
    }

    const userId = crypto.randomUUID();
    addMessage({ id: userId, role: "user", content: trimmed });

    const aiId = crypto.randomUUID();
    addMessage({ id: aiId, role: "assistant", content: "" });

    setText("");
    setLoading(true);

    try {
      let fullContent = "";
      await streamChat(trimmed, sessionId, currentModel, (chunk) => {
        fullContent += chunk;
        updateMessage(aiId, fullContent);
      });
      await fetchSessions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "请求失败";
      updateMessage(aiId, `[Error] ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-2">
      <div
        className="max-w-3xl mx-auto flex items-end rounded-2xl px-4 py-2"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-input)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="发送消息..."
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent outline-none text-sm py-1.5 max-h-[200px]"
          style={{
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={send}
          disabled={!text.trim() || isLoading}
          className="flex-shrink-0 ml-2 p-1.5 rounded-lg transition-colors disabled:opacity-30"
          style={{ color: "var(--text-primary)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
      <p className="text-center mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>
        AI 可能会产生不准确的信息，请注意甄别
      </p>
    </div>
  );
};

export default ChatInput;
