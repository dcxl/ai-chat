import redis from "../config/redis";
import { ChatMessage } from "../types/chat";

/**
 * 获取会话记录
 */
export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const data = await redis.get(`chat:messages:${conversationId}`);
  if (!data) return [];
  return JSON.parse(data);
}
/**
 * 保存会话记录
 */
export async function saveMessages(
  conversationId: string,
  messages: ChatMessage[]
) {
  await redis.set(
    `chat:messages:${conversationId}`,
    JSON.stringify(messages),
    "EX",
    60 * 60 * 24
  );
}
/**
 * 保存标题
 */
export async function saveTitle(conversationId: string, title: string) {
  await redis.set(`chat:title:${conversationId}`, title, "EX", 60 * 60 * 24);
  // 保存会话id
  await redis.sadd("chat:sessions", conversationId);
}
/**
 * 获取标题
 */
export async function getTitle(conversationId: string) {
  return await redis.get(`chat:title:${conversationId}`);
}

/**
 * 获取所有会话
 */
export async function getSessions() {
  const ids = await redis.smembers("chat:sessions");
  const pipeline = redis.pipeline()
  ids.forEach((id) => {
    pipeline.get(`chat:title:${id}`)
  })
  const titles = await pipeline.exec()
  return ids.map((id, i) => ({
    id,
    title: (titles?.[i]?.[1] as string) || "新对话",
  }))
  // const sessions = await Promise.all(
  //   ids.map(async (id) => {
  //     const title = await redis.get(`chat:title:${id}`);
  //     return {
  //       id,
  //       title: title || "新对话",
  //     };
  //   })
  // );
  // return sessions;
}
