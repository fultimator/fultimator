import { createContext } from "react";

export const AppBarSearchSlotContext = createContext<{
  slot: HTMLElement | null;
  setSlot: (el: HTMLElement | null) => void;
}>({ slot: null, setSlot: () => {} });
