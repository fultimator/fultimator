import { create } from "zustand";

export type CompactTabType =
  | "classes"
  | "spells"
  | "equipment"
  | "notes"
  | "bonds"
  | "companion"
  | "quirk"
  | "zeroPower"
  | "others"
  | "campActivities"
  | "rituals"
  | "vehicle";

interface PlayerSheetCompactStore {
  /** Global open rows state: { tabName -> { rowKey -> isOpen } } */
  openRows: Record<CompactTabType, Record<string, boolean>>;

  /** Current search query */
  searchQuery: string;

  /** Set the search query */
  setSearchQuery: (query: string) => void;

  /** Toggle a row's open/closed state */
  toggleRow: (tab: CompactTabType, rowKey: string) => void;

  /** Set multiple rows as open (for auto-expand on search) */
  setOpenRows: (tab: CompactTabType, rows: Record<string, boolean>) => void;

  /** Clear all open rows (useful on search clear) */
  clearOpenRows: (tab?: CompactTabType) => void;

  /** Get open state for a specific row */
  isRowOpen: (tab: CompactTabType, rowKey: string) => boolean;
}

const TABS: CompactTabType[] = [
  "classes",
  "spells",
  "equipment",
  "notes",
  "bonds",
  "companion",
  "quirk",
  "zeroPower",
  "others",
  "campActivities",
  "rituals",
  "vehicle",
];

// Initialize with empty objects for each tab
const initializeOpenRows = (): Record<
  CompactTabType,
  Record<string, boolean>
> => {
  const result = {} as Record<CompactTabType, Record<string, boolean>>;
  TABS.forEach((tab) => {
    result[tab] = {};
  });
  return result;
};

/**
 * Player Sheet Compact Zustand store.
 *
 * Manages unified openRows state across all compact sheet tabs, with global search query.
 * Auto-expand logic can be implemented by parent component based on searchQuery.
 *
 * Usage:
 *   const { openRows, searchQuery, toggleRow, setSearchQuery } = usePlayerSheetCompactStore();
 */
export const usePlayerSheetCompactStore = create<PlayerSheetCompactStore>(
  (set, get) => ({
    openRows: initializeOpenRows(),
    searchQuery: "",

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    toggleRow: (tab: CompactTabType, rowKey: string) => {
      set((state) => ({
        openRows: {
          ...state.openRows,
          [tab]: {
            ...state.openRows[tab],
            [rowKey]: !state.openRows[tab][rowKey],
          },
        },
      }));
    },

    setOpenRows: (tab: CompactTabType, rows: Record<string, boolean>) => {
      set((state) => ({
        openRows: {
          ...state.openRows,
          [tab]: rows,
        },
      }));
    },

    clearOpenRows: (tab?: CompactTabType) => {
      if (tab) {
        set((state) => ({
          openRows: {
            ...state.openRows,
            [tab]: {},
          },
        }));
      } else {
        set({ openRows: initializeOpenRows() });
      }
    },

    isRowOpen: (tab: CompactTabType, rowKey: string) => {
      return get().openRows[tab]?.[rowKey] ?? false;
    },
  }),
);
