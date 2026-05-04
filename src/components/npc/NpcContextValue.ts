import { createContext, Dispatch, SetStateAction } from "react";
import { TypeNpc } from "../../types/Npcs";

interface NpcContextValue {
  npcTemp: TypeNpc;
  setNpcTemp: Dispatch<SetStateAction<TypeNpc>>;
}

export const NpcContext = createContext<NpcContextValue | null>(null);
