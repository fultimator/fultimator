import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DrawerTab = "chat" | "customizer" | "themes";

interface AppDrawerStore {
  activeTab: DrawerTab;
  isOpen: boolean;
  setActiveTab: (tab: DrawerTab) => void;
  setIsOpen: (open: boolean) => void;
}

export const useAppDrawerStore = create<AppDrawerStore>()(
  persist(
    (set) => ({
      activeTab: "customizer",
      isOpen: false,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "app-drawer-store",
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    },
  ),
);
