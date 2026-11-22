import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isValidChatMessage } from "../components/app-drawer/panels/chat/domain/validation";
import { LOCAL_CHAT_KEY } from "../components/app-drawer/panels/chat/constants";
import type { ChatMessage } from "../components/app-drawer/panels/chat/types";
import { useCombatEncounterStore } from "../stores/combatEncounterStore";

interface ChatMessagesStore {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  deleteMessage: (id: string) => void;
  clearAll: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

function hydrateTargetsSnapshot(message: ChatMessage): ChatMessage {
  if (message.kind !== "accuracy" && message.kind !== "magic") return message;

  const existing = message.check.targetsSnapshot;
  if (Array.isArray(existing) && existing.length > 0) return message;

  const latestTargets = useCombatEncounterStore.getState().targets;
  if (latestTargets.length === 0) return message;

  if (message.kind === "accuracy") {
    return {
      ...message,
      check: {
        ...message.check,
        targetsSnapshot: [...latestTargets],
      },
    };
  }

  return {
    ...message,
    check: {
      ...message.check,
      targetsSnapshot: [...latestTargets],
    },
  };
}
const MAX_MESSAGES = 100;

export const useChatMessagesStore = create<ChatMessagesStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, hydrateTargetsSnapshot(message)].slice(
            -MAX_MESSAGES,
          ),
        })),
      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
      clearAll: () => set({ messages: [] }),
      setMessages: (messages) =>
        set({ messages: messages.slice(-MAX_MESSAGES) }),
    }),
    {
      name: LOCAL_CHAT_KEY,
      partialize: (state) => ({
        messages: state.messages.slice(-MAX_MESSAGES),
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<ChatMessagesStore>;
        const valid = (p.messages ?? []).filter(isValidChatMessage);
        return { ...current, messages: valid.slice(-MAX_MESSAGES) };
      },
    },
  ),
);
