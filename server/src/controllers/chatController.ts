import type { Request, Response } from "express";
import {
  getMessages,
  saveMessages,
  saveTitle,
} from "../services/conversationService";
import { getLLMService } from "../services/llmService";
import { generateTitle } from "../services/titleService";
import { searchRelevant } from "../services/knowledgeService";
import { ChatRequest, ChatMessage } from "../types/chat";

export async function chat(req: Request, res: Response) {
  const { prompt, sessionId, model, knowledgeId } = req.body as ChatRequest;

  const messages = await getMessages(sessionId);
  const isFirstMessage = messages.length === 0;

  messages.push({ role: "user", content: prompt });

  // RAG: Inject relevant context if knowledgeId is provided
  if (knowledgeId) {
    try {
      const relevantDocs = await searchRelevant(knowledgeId, prompt, 5);
      if (relevantDocs.length > 0) {
        const contexts = relevantDocs
          .map((doc, i) => `[${i + 1}] (来源: ${doc.source})\n${doc.content}`)
          .join("\n\n");
        const systemMessage: ChatMessage = {
          role: "system",
          content: `基于以下参考资料回答用户的问题。如果参考资料中没有相关信息，请根据你的知识回答，并说明参考信息不足。\n\n参考资料:\n${contexts}`,
        };
        messages.unshift(systemMessage);
      }
    } catch (err) {
      console.error("RAG search failed:", err);
      // Continue without RAG context
    }
  }

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
