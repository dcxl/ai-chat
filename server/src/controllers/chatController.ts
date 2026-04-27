import type { Request, Response } from "express";
import {
  getMessages,
  saveMessages,
  saveTitle,
} from "../services/conversationService";
import { getLLMService } from "../services/llmService";
import { generateTitle } from "../services/titleService";
import { ChatRequest } from "../types/chat";

export async function chat(req: Request, res: Response) {
  const { prompt, sessionId, model } = req.body as ChatRequest;

  const messages = await getMessages(sessionId);
  const isFirstMessage = messages.length === 0;

  messages.push({ role: "user", content: prompt });

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const service = getLLMService(model);
    let aiResponse = "";
    await service.streamChat(messages, (chunk) => {
      aiResponse += chunk;
      res.write(chunk);
    });

    messages.push({ role: "assistant", content: aiResponse });
    await saveMessages(sessionId, messages);

    if (isFirstMessage) {
      generateTitle(prompt).then((title) => {
        saveTitle(sessionId, title);
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`\n\n[Error] ${message}`);
    }
  }

  res.end();
}
