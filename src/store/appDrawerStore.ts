import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DrawerTab = "chat" | "customizer" | "themes";

interface AppDrawerStore {
  activeTab: DrawerTab;
  isOpen: boolean;
  chatActorDocOverride: Record<string, unknown> | null;
  setActiveTab: (tab: DrawerTab) => void;
  setIsOpen: (open: boolean) => void;
  setChatActorDocOverride: (doc: Record<string, unknown> | null) => void;
}

export const useAppDrawerStore = create<AppDrawerStore>()(
  persist(
    (set) => ({
      activeTab: "customizer",
      isOpen: false,
      chatActorDocOverride: null,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsOpen: (open) => set({ isOpen: open }),
      setChatActorDocOverride: (doc) => set({ chatActorDocOverride: doc }),
    }),
    {
      name: "app-drawer-store",
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    },
  ),
);
