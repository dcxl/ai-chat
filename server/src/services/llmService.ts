import type { ChatMessage } from "../types/chat";
import { findModel, getEnabledModels } from "../config/models";
import { QwenService } from "./qwenService";
import { OpenAIService } from "./openaiService";
import { ClaudeService } from "./claudeService";

export interface LLMService {
  streamChat(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<string>;
}

export function getLLMService(modelId: string): LLMService {
  const model = findModel(modelId);
  if (!model || !model.enabled) {
    throw new Error(`Model "${modelId}" is not available`);
  }

  switch (model.provider) {
    case "qwen":
      return new QwenService(model.id);
    case "openai":
      return new OpenAIService(model.id);
    case "claude":
      return new ClaudeService(model.id);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

export function getFirstAvailableModelId(): string {
  const enabled = getEnabledModels();
  return enabled[0]?.id ?? "qwen-plus";
}
