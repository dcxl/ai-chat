import type { ModelConfig } from "../types/chat";

export const models: ModelConfig[] = [
  {
    id: "qwen-plus",
    name: "Qwen Plus",
    provider: "qwen",
    enabled: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    enabled: !!process.env.OPENAI_API_KEY,
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "claude",
    enabled: !!process.env.ANTHROPIC_API_KEY,
  },
];

export function getEnabledModels(): ModelConfig[] {
  return models.filter((m) => m.enabled);
}

export function findModel(id: string): ModelConfig | undefined {
  return models.find((m) => m.id === id);
}
