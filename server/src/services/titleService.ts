import type { ChatMessage } from "../types/chat";
import { getLLMService } from "./llmService";
import { getEnabledModels } from "../config/models";

export async function generateTitle(message: string): Promise<string> {
  const prompt = `请为下面的问题生成一个不超过8个字的标题，不要加引号和其他标点:\n\n${message}\n\n标题:`;

  const messages: ChatMessage[] = [{ role: "user", content: prompt }];

  const enabledModels = getEnabledModels();
  if (enabledModels.length === 0) return "新对话";

  try {
    const service = getLLMService(enabledModels[0]!.id);
    const title = await service.streamChat(messages, () => {});
    return title.trim().replace(/[""「」《》]/g, "") || "新对话";
  } catch {
    return "新对话";
  }
}
