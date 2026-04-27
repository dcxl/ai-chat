import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import hljs from "highlight.js";

interface MarkdownRendererProps {
  content: string;
}

const CodeBlock = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  let highlighted: string;
  if (match && hljs.getLanguage(match[1])) {
    highlighted = hljs.highlight(code, { language: match[1] }).value;
  } else {
    highlighted = hljs.highlightAuto(code).value;
  }

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden" style={{ background: "var(--bg-code)" }}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 text-xs"
        style={{ background: "var(--border-color)", color: "var(--text-secondary)" }}
      >
        <span>{match ? match[1] : "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              已复制
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              复制
            </>
          )}
        </button>
      </div>
      <pre className="!m-0 !p-4 overflow-x-auto text-sm">
        <code className={className} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const isBlock = (children as string)?.includes("\n");
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return (
              <code
                className="px-1.5 py-0.5 rounded text-sm"
                style={{ background: "var(--bg-code)" }}
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-3 ml-4 list-disc">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-3 ml-4 list-decimal">{children}</ol>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
