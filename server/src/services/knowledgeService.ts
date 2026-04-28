import { v4 as uuidv4 } from "uuid";
import redis from "../config/redis";
import { insertDocuments, searchSimilar, deleteByKnowledgeId } from "./vectorStoreService";
import { chunkText, parsePDF, fetchURL } from "./documentService";

const KNOWLEDGE_PREFIX = "knowledge:";
const KNOWLEDGE_SET = "knowledge:list";

export interface Knowledge {
  id: string;
  name: string;
  docCount: number;
  createdAt: string;
}

export async function createKnowledge(name: string): Promise<Knowledge> {
  const id = uuidv4();
  const knowledge: Knowledge = {
    id,
    name,
    docCount: 0,
    createdAt: new Date().toISOString(),
  };
  await redis.set(`${KNOWLEDGE_PREFIX}${id}`, JSON.stringify(knowledge));
  await redis.sadd(KNOWLEDGE_SET, id);
  return knowledge;
}

export async function listKnowledges(): Promise<Knowledge[]> {
  const ids = await redis.smembers(KNOWLEDGE_SET);
  if (ids.length === 0) return [];
  const pipeline = redis.pipeline();
  ids.forEach((id) => pipeline.get(`${KNOWLEDGE_PREFIX}${id}`));
  const results = await pipeline.exec();
  return ids
    .map((id, i) => {
      const data = results?.[i]?.[1] as string | null;
      return data ? JSON.parse(data) : null;
    })
    .filter(Boolean) as Knowledge[];
}

export async function getKnowledge(id: string): Promise<Knowledge | null> {
  const data = await redis.get(`${KNOWLEDGE_PREFIX}${id}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteKnowledge(id: string): Promise<void> {
  await deleteByKnowledgeId(id);
  await redis.del(`${KNOWLEDGE_PREFIX}${id}`);
  await redis.srem(KNOWLEDGE_SET, id);
}

export async function addTextDocuments(
  knowledgeId: string,
  text: string,
  source: string
): Promise<number> {
  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  const docs = chunks.map((content, i) => ({
    id: uuidv4(),
    content,
    source,
    knowledgeId,
  }));

  await insertDocuments(docs);

  // Update doc count
  const knowledge = await getKnowledge(knowledgeId);
  if (knowledge) {
    knowledge.docCount += chunks.length;
    await redis.set(`${KNOWLEDGE_PREFIX}${knowledgeId}`, JSON.stringify(knowledge));
  }

  return chunks.length;
}

export async function addFileDocument(
  knowledgeId: string,
  buffer: Buffer,
  filename: string
): Promise<number> {
  let text: string;

  if (filename.endsWith(".pdf")) {
    text = await parsePDF(buffer);
  } else {
    // Treat as plain text (txt, md, csv, etc.)
    text = buffer.toString("utf-8");
  }

  return addTextDocuments(knowledgeId, text, filename);
}

export async function addURLDocument(
  knowledgeId: string,
  url: string
): Promise<number> {
  const text = await fetchURL(url);
  return addTextDocuments(knowledgeId, text, url);
}

export async function searchRelevant(
  knowledgeId: string,
  query: string,
  topK: number = 5
): Promise<{ content: string; source: string }[]> {
  const results = await searchSimilar(knowledgeId, query, topK);
  return results.map((r) => ({ content: r.content, source: r.source }));
}
