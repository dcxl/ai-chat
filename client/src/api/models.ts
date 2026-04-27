import type { ModelOption } from "@/features/chat/types/chat";

export async function fetchModels(): Promise<ModelOption[]> {
  const res = await fetch("/api/models");
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}
