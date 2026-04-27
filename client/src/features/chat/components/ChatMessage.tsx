import MarkdownRenderer from "@/components/MarkdownRenderer";
import type { Message } from "../types/chat";

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* AI avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "var(--bg-message-ai)", color: "var(--text-message-ai)" }}
        >
          AI
        </div>
      )}

      {/* Message content */}
      <div
        className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        style={{
          background: isUser ? "var(--bg-message-user)" : "var(--bg-message-ai)",
          color: isUser ? "var(--text-message-user)" : "var(--text-message-ai)",
          ...(isUser ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }),
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "var(--bg-message-user)", color: "var(--text-message-user)" }}
        >
          U
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
