import { useChatStore } from "../store/chatStore";
import { useKnowledgeStore } from "../store/knowledgeStore";

const KnowledgeSelector = () => {
  const { currentKnowledgeId, setCurrentKnowledgeId } = useChatStore();
  const { knowledgeList } = useKnowledgeStore();

  return (
    <select
      value={currentKnowledgeId || ""}
      onChange={(e) => setCurrentKnowledgeId(e.target.value || null)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
      style={{
        background: "var(--bg-input)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
      }}
    >
      <option value="">不使用知识库</option>
      {knowledgeList.map((k) => (
        <option key={k.id} value={k.id}>
          {k.name} ({k.docCount} 条)
        </option>
      ))}
    </select>
  );
};

export default KnowledgeSelector;
