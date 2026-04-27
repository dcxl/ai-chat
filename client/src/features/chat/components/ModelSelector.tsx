import { useChatStore } from "../store/chatStore";

const ModelSelector = () => {
  const { models, currentModel, setCurrentModel } = useChatStore();

  if (models.length === 0) return null;

  return (
    <select
      value={currentModel}
      onChange={(e) => setCurrentModel(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
      style={{
        background: "var(--bg-input)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-color)",
      }}
    >
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;
