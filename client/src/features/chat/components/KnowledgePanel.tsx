import { useState, useRef } from "react";
import { useKnowledgeStore } from "../store/knowledgeStore";

interface Props {
  onClose: () => void;
}

const KnowledgePanel = ({ onClose }: Props) => {
  const { knowledgeList, createKnowledge, deleteKnowledge, uploadFile, addText, addURL } = useKnowledgeStore();
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createKnowledge(newName.trim());
    setNewName("");
  };

  const handleUpload = async (id: string) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setStatus("上传中...");
    try {
      const chunks = await uploadFile(id, file);
      setStatus(`已添加 ${chunks} 个文档块`);
    } catch {
      setStatus("上传失败");
    }
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setStatus(null), 3000);
  };

  const handleAddText = async (id: string) => {
    if (!textInput.trim()) return;
    setStatus("处理中...");
    try {
      const chunks = await addText(id, textInput.trim());
      setStatus(`已添加 ${chunks} 个文档块`);
      setTextInput("");
    } catch {
      setStatus("添加失败");
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleAddURL = async (id: string) => {
    if (!urlInput.trim()) return;
    setStatus("爬取中...");
    try {
      const chunks = await addURL(id, urlInput.trim());
      setStatus(`已添加 ${chunks} 个文档块`);
      setUrlInput("");
    } catch {
      setStatus("爬取失败");
    }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="flex flex-col h-full p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          知识库管理
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:opacity-80"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Create new */}
      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="知识库名称"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim()}
          className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
          style={{ background: "var(--bg-message-user)", color: "var(--text-message-user)" }}
        >
          创建
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
          {status}
        </div>
      )}

      {/* Knowledge list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {knowledgeList.length === 0 && (
          <p className="text-center text-xs py-8" style={{ color: "var(--text-secondary)" }}>
            暂无知识库，请创建一个
          </p>
        )}
        {knowledgeList.map((k) => (
          <div
            key={k.id}
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--border-color)" }}
          >
            {/* Knowledge header */}
            <div
              className="flex items-center justify-between px-3 py-2 cursor-pointer"
              style={{ background: "var(--bg-hover)" }}
              onClick={() => setExpandedId(expandedId === k.id ? null : k.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {k.name}
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {k.docCount} 条文档
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteKnowledge(k.id);
                  }}
                  className="p-1 rounded hover:opacity-80"
                  style={{ color: "var(--text-secondary)" }}
                  title="删除"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: "var(--text-secondary)", transform: expandedId === k.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Expanded: add content */}
            {expandedId === k.id && (
              <div className="px-3 py-3 space-y-3" style={{ background: "var(--bg-primary)" }}>
                {/* File upload */}
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                    上传文件 (TXT/PDF/MD)
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".txt,.md,.pdf,.csv"
                      className="flex-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    />
                    <button
                      onClick={() => handleUpload(k.id)}
                      className="px-3 py-1 rounded text-xs"
                      style={{ background: "var(--bg-hover)", color: "var(--text-primary)" }}
                    >
                      上传
                    </button>
                  </div>
                </div>

                {/* Text input */}
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                    添加文本
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="输入或粘贴文本内容..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                  />
                  <button
                    onClick={() => handleAddText(k.id)}
                    disabled={!textInput.trim()}
                    className="mt-1 px-3 py-1 rounded text-xs disabled:opacity-40"
                    style={{ background: "var(--bg-hover)", color: "var(--text-primary)" }}
                  >
                    添加文本
                  </button>
                </div>

                {/* URL input */}
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                    爬取网页
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddURL(k.id)}
                    />
                    <button
                      onClick={() => handleAddURL(k.id)}
                      disabled={!urlInput.trim()}
                      className="px-3 py-1 rounded text-xs disabled:opacity-40"
                      style={{ background: "var(--bg-hover)", color: "var(--text-primary)" }}
                    >
                      爬取
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgePanel;
