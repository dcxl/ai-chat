import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const MODEL = "text-embedding-3-small";
const DIMENSION = 1536;

export async function embed(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: MODEL,
    input: text,
    dimensions: DIMENSION,
  });
  return res.data[0]!.embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await client.embeddings.create({
    model: MODEL,
    input: texts,
    dimensions: DIMENSION,
  });
  return res.data.map((d) => d.embedding);
}

export { DIMENSION };
