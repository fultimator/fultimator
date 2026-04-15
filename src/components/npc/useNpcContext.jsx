import { useContext } from "react";
import { NpcContext } from "./NpcContextValue";

export const useNpc = () => useContext(NpcContext);
