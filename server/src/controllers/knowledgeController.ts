import type { Request, Response } from "express";
import multer from "multer";
import {
  createKnowledge,
  listKnowledges,
  deleteKnowledge,
  addFileDocument,
  addTextDocuments,
  addURLDocument,
} from "../services/knowledgeService";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

export async function createKnowledgeCtrl(req: Request, res: Response) {
  const { name } = req.body as { name: string };
  if (!name?.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const knowledge = await createKnowledge(name.trim());
  res.json(knowledge);
}

export async function listKnowledgesCtrl(_req: Request, res: Response) {
  const list = await listKnowledges();
  res.json(list);
}

export async function deleteKnowledgeCtrl(req: Request, res: Response) {
  const id = String(req.params.id);
  await deleteKnowledge(id);
  res.json({ success: true });
}

export async function uploadDocumentCtrl(req: Request, res: Response) {
  const id = String(req.params.id);
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  try {
    const count = await addFileDocument(id, file.buffer, file.originalname);
    res.json({ chunks: count });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process file";
    res.status(500).json({ error: msg });
  }
}

export async function addTextCtrl(req: Request, res: Response) {
  const id = String(req.params.id);
  const { text, source } = req.body as { text: string; source?: string };
  if (!text?.trim()) {
    res.status(400).json({ error: "Text is required" });
    return;
  }
  try {
    const count = await addTextDocuments(id, text, source || "text-input");
    res.json({ chunks: count });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process text";
    res.status(500).json({ error: msg });
  }
}

export async function addURLCtrl(req: Request, res: Response) {
  const id = String(req.params.id);
  const { url } = req.body as { url: string };
  if (!url?.trim()) {
    res.status(400).json({ error: "URL is required" });
    return;
  }
  try {
    const count = await addURLDocument(id, url.trim());
    res.json({ chunks: count });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch URL";
    res.status(500).json({ error: msg });
  }
}

export { upload };
