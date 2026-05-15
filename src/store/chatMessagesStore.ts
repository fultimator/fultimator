import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isValidChatMessage } from "../components/app-drawer/panels/chat/domain/validation";
import { LOCAL_CHAT_KEY } from "../components/app-drawer/panels/chat/constants";
import type { ChatMessage } from "../components/app-drawer/panels/chat/types";

interface ChatMessagesStore {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  deleteMessage: (id: string) => void;
  clearAll: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export const useChatMessagesStore = create<ChatMessagesStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
      clearAll: () => set({ messages: [] }),
      setMessages: (messages) => set({ messages }),
    }),
    {
      name: LOCAL_CHAT_KEY,
      partialize: (state) => ({ messages: state.messages }),
      merge: (persisted, current) => {
        const p = persisted as Partial<ChatMessagesStore>;
        const valid = (p.messages ?? []).filter(isValidChatMessage);
        return { ...current, messages: valid };
      },
    },
  ),
);
