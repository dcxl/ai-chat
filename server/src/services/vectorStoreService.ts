import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";
import { embed, embedBatch, DIMENSION } from "./embeddingService";

const COLLECTION_NAME = "knowledge_docs";

let client: MilvusClient | null = null;

async function getClient(): Promise<MilvusClient> {
  if (!client) {
    client = new MilvusClient({
      address: `${process.env.MILVUS_HOST || "127.0.0.1"}:${process.env.MILVUS_PORT || 19530}`,
    });
  }
  return client;
}

export async function initCollection(): Promise<void> {
  const milvus = await getClient();

  const exists = await milvus.hasCollection({ collection_name: COLLECTION_NAME });
  if (exists.value) return;

  await milvus.createCollection({
    collection_name: COLLECTION_NAME,
    fields: [
      { name: "id", data_type: DataType.VarChar, is_primary_key: true, max_length: 64 },
      { name: "content", data_type: DataType.VarChar, max_length: 65535 },
      { name: "embedding", data_type: DataType.FloatVector, dim: DIMENSION },
      { name: "source", data_type: DataType.VarChar, max_length: 512 },
      { name: "knowledge_id", data_type: DataType.VarChar, max_length: 64 },
    ],
  });

  await milvus.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: "embedding",
    index_type: "IVF_FLAT",
    metric_type: "COSINE",
    params: { nlist: 128 },
  });

  await milvus.loadCollection({ collection_name: COLLECTION_NAME });
}

export async function insertDocuments(
  docs: { id: string; content: string; source: string; knowledgeId: string }[]
): Promise<void> {
  if (docs.length === 0) return;
  const milvus = await getClient();
  await initCollection();

  const allEmbeddings: number[][] = [];
  for (let i = 0; i < docs.length; i += 20) {
    const batch = docs.slice(i, i + 20);
    const embeddings = await embedBatch(batch.map((d) => d.content));
    allEmbeddings.push(...embeddings);
  }

  await milvus.insert({
    collection_name: COLLECTION_NAME,
    data: docs.map((d, i) => ({
      id: d.id,
      content: d.content,
      embedding: allEmbeddings[i],
      source: d.source,
      knowledge_id: d.knowledgeId,
    })),
  });
}

export async function searchSimilar(
  knowledgeId: string,
  query: string,
  topK: number = 5
): Promise<{ content: string; source: string; score: number }[]> {
  const milvus = await getClient();
  await initCollection();

  const queryEmbedding = await embed(query);

  // Ensure collection is loaded
  const state = await milvus.getLoadState({ collection_name: COLLECTION_NAME });
  if (state.state !== "LoadStateLoaded") {
    await milvus.loadCollection({ collection_name: COLLECTION_NAME });
  }

  const results = await milvus.search({
    collection_name: COLLECTION_NAME,
    vector: queryEmbedding,
    filter: `knowledge_id == "${knowledgeId}"`,
    limit: topK,
    output_fields: ["content", "source"],
  });

  return (results.results || []).map((r: any) => ({
    content: r.content,
    source: r.source,
    score: r.score,
  }));
}

export async function deleteByKnowledgeId(knowledgeId: string): Promise<void> {
  const milvus = await getClient();
  const exists = await milvus.hasCollection({ collection_name: COLLECTION_NAME });
  if (!exists.value) return;

  await milvus.delete({
    collection_name: COLLECTION_NAME,
    filter: `knowledge_id == "${knowledgeId}"`,
  });
}
