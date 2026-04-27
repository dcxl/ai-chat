import OpenAI from "openai";
import type { ChatMessage } from "../types/chat";
import type { LLMService } from "./llmService";

export class OpenAIService implements LLMService {
  private client: OpenAI;

  constructor(private modelId: string = "gpt-4o-mini") {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const stream = await this.client.chat.completions.create({
      model: this.modelId,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullText += delta;
        onChunk(delta);
      }
    }
    return fullText;
  }
}
