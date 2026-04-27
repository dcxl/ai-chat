import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "../types/chat";
import type { LLMService } from "./llmService";

export class ClaudeService implements LLMService {
  private client: Anthropic;

  constructor(private modelId: string = "claude-sonnet-4-20250514") {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    // Claude API requires system message as a separate param
    const systemMessage = messages.find((m) => m.role === "system")?.content;
    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const params: Anthropic.MessageCreateParamsStreaming = {
      model: this.modelId,
      max_tokens: 4096,
      messages: chatMessages,
      stream: true,
    };
    if (systemMessage) {
      params.system = systemMessage;
    }

    const stream = this.client.messages.stream(params);
    let fullText = "";

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullText += event.delta.text;
        onChunk(event.delta.text);
      }
    }
    return fullText;
  }
}
