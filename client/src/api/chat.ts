export async function streamChat(
  prompt: string,
  sessionId: string,
  model: string,
  onMessage: (text: string) => void,
  knowledgeId?: string | null
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, sessionId, model, knowledgeId: knowledgeId || undefined }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const reader = res.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  if (!reader) throw new Error("ReadableStream not supported");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    onMessage(chunk);
  }
}
