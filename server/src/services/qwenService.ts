import type { ChatMessage } from "../types/chat";
import type { LLMService } from "./llmService";

export class QwenService implements LLMService {
  constructor(private modelId: string = "qwen-plus") {}

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const res = await fetch(process.env.QWEN_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        "X-DashScope-SSE": "enable",
      },
      body: JSON.stringify({
        model: this.modelId,
        input: { messages },
        parameters: {
          result_format: "message",
          incremental_output: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Qwen API error: ${res.status} ${err}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const json = line.replace("data:", "").trim();
        if (json === "[DONE]") break;
        try {
          const data = JSON.parse(json);
          const delta = data?.output?.choices?.[0]?.message?.content;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
    return fullText;
  }
}
