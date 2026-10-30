import { create } from "zustand";

export type ChatVisibleKind = "logs" | "checks" | "chat";
const ALL_KINDS: ChatVisibleKind[] = ["logs", "checks", "chat"];

interface ChatChannelState {
  activeChannelId: string;
  encounterChannelLabel: string | null;
  visibleKinds: ChatVisibleKind[];
  setActiveChannel: (id: string) => void;
  setEncounterChannel: (encounterId: string, label: string) => void;
  clearEncounterChannel: () => void;
  toggleVisibleKind: (kind: ChatVisibleKind) => void;
}

export const useChatChannelStore = create<ChatChannelState>((set) => ({
  activeChannelId: "global",
  encounterChannelLabel: null,
  visibleKinds: [...ALL_KINDS],

  setActiveChannel: (id) => set({ activeChannelId: id }),

  setEncounterChannel: (encounterId, label) =>
    set({
      activeChannelId: `encounter:${encounterId}`,
      encounterChannelLabel: label,
    }),

  clearEncounterChannel: () =>
    set({
      activeChannelId: "global",
      encounterChannelLabel: null,
    }),

  toggleVisibleKind: (kind) =>
    set((state) => {
      const has = state.visibleKinds.includes(kind);
      return {
        visibleKinds: has
          ? state.visibleKinds.filter((k) => k !== kind)
          : [...state.visibleKinds, kind],
      };
    }),
}));
