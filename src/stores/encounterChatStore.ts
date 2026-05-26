import { create } from "zustand";
import type { ChatMessage } from "../components/app-drawer/panels/chat/types";

interface EncounterChatState {
  encounterId: string | null;
  messages: ChatMessage[];
  isDirty: boolean;
  addMessage: (message: ChatMessage) => void;
  deleteMessage: (id: string) => void;
  setMessages: (encounterId: string, messages: ChatMessage[]) => void;
  markClean: () => void;
  clearMessages: () => void;
  clear: () => void;
}

export const useEncounterChatStore = create<EncounterChatState>((set) => ({
  encounterId: null,
  messages: [],
  isDirty: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      isDirty: true,
    })),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
      isDirty: true,
    })),

  setMessages: (encounterId, messages) =>
    set({ encounterId, messages, isDirty: false }),

  markClean: () => set({ isDirty: false }),

  clearMessages: () => set({ messages: [], isDirty: true }),

  clear: () => set({ encounterId: null, messages: [], isDirty: false }),
}));
