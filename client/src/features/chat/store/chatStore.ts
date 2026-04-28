import { create } from "zustand";
import type { ChatSession, Message, ModelOption } from "../types/chat";

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentModel: string;
  currentKnowledgeId: string | null;
  models: ModelOption[];
  isLoading: boolean;

  fetchSessions: () => Promise<void>;
  createSession: () => void;
  setCurrentSessionId: (id: string) => void;
  setCurrentModel: (model: string) => void;
  setCurrentKnowledgeId: (id: string | null) => void;
  fetchModels: () => Promise<void>;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  deleteSession: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  currentModel: "qwen-plus",
  currentKnowledgeId: null,
  models: [],
  isLoading: false,

  fetchSessions: async () => {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    set({ sessions: data });
  },

  createSession: () => {
    const id = Date.now().toString();
    set({
      sessions: [{ id, title: "新对话", messages: [] }, ...get().sessions],
      currentSessionId: id,
    });
  },

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  setCurrentModel: (model) => set({ currentModel: model }),

  setCurrentKnowledgeId: (id) => set({ currentKnowledgeId: id }),

  fetchModels: async () => {
    const res = await fetch("/api/models");
    const data = await res.json();
    set({ models: data });
    const current = get().currentModel;
    if (!data.find((m: ModelOption) => m.id === current) && data.length > 0) {
      set({ currentModel: data[0].id });
    }
  },

  addMessage: (msg) => {
    let { sessions, currentSessionId } = get();
    if (!currentSessionId) {
      const id = Date.now().toString();
      sessions = [{ id, title: "新对话", messages: [] }, ...sessions];
      currentSessionId = id;
    }
    const updated = sessions.map((s) =>
      s.id === currentSessionId ? { ...s, messages: [...s.messages, msg] } : s
    );
    set({ sessions: updated, currentSessionId });
  },

  updateMessage: (id, content) =>
    set((state) => ({
      sessions: state.sessions.map((session) => ({
        ...session,
        messages: session.messages.map((message) =>
          message.id === id ? { ...message, content } : message
        ),
      })),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  deleteSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      currentSessionId:
        state.currentSessionId === id ? null : state.currentSessionId,
    })),
}));
