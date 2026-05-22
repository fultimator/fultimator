import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DrawerTab = "chat" | "customizer" | "themes";

export interface DrawerBottomAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}

interface AppDrawerStore {
  activeTab: DrawerTab;
  isOpen: boolean;
  chatActorDocOverride: Record<string, unknown> | null;
  chatComposerPrefill: string | null;
  drawerBottomActions: DrawerBottomAction[];
  setActiveTab: (tab: DrawerTab) => void;
  setIsOpen: (open: boolean) => void;
  setChatActorDocOverride: (doc: Record<string, unknown> | null) => void;
  setChatComposerPrefill: (value: string | null) => void;
  setDrawerBottomActions: (
    actions:
      | DrawerBottomAction[]
      | ((prev: DrawerBottomAction[]) => DrawerBottomAction[]),
  ) => void;
}

export const useAppDrawerStore = create<AppDrawerStore>()(
  persist(
    (set) => ({
      activeTab: "customizer",
      isOpen: false,
      chatActorDocOverride: null,
      chatComposerPrefill: null,
      drawerBottomActions: [],
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsOpen: (open) => set({ isOpen: open }),
      setChatActorDocOverride: (doc) => set({ chatActorDocOverride: doc }),
      setChatComposerPrefill: (value) => set({ chatComposerPrefill: value }),
      setDrawerBottomActions: (actions) =>
        set((s) => ({
          drawerBottomActions:
            typeof actions === "function"
              ? actions(s.drawerBottomActions)
              : actions,
        })),
    }),
    {
      name: "app-drawer-store",
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    },
  ),
);
