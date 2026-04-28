import { create } from "zustand";
import type { Knowledge } from "../types/chat";

interface KnowledgeState {
  knowledgeList: Knowledge[];
  loading: boolean;

  fetchKnowledges: () => Promise<void>;
  createKnowledge: (name: string) => Promise<void>;
  deleteKnowledge: (id: string) => Promise<void>;
  uploadFile: (id: string, file: File) => Promise<number>;
  addText: (id: string, text: string, source?: string) => Promise<number>;
  addURL: (id: string, url: string) => Promise<number>;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  knowledgeList: [],
  loading: false,

  fetchKnowledges: async () => {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    set({ knowledgeList: data });
  },

  createKnowledge: async (name) => {
    const res = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const knowledge = await res.json();
    set({ knowledgeList: [knowledge, ...get().knowledgeList] });
  },

  deleteKnowledge: async (id) => {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    set({ knowledgeList: get().knowledgeList.filter((k) => k.id !== id) });
  },

  uploadFile: async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/knowledge/${id}/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    await get().fetchKnowledges();
    return data.chunks;
  },

  addText: async (id, text, source) => {
    const res = await fetch(`/api/knowledge/${id}/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source }),
    });
    if (!res.ok) throw new Error("Add text failed");
    const data = await res.json();
    await get().fetchKnowledges();
    return data.chunks;
  },

  addURL: async (id, url) => {
    const res = await fetch(`/api/knowledge/${id}/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("Add URL failed");
    const data = await res.json();
    await get().fetchKnowledges();
    return data.chunks;
  },
}));
