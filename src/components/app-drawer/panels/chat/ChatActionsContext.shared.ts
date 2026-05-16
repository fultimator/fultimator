import { createContext, useContext } from "react";
import type {
  AttributeCheckMessage,
  OpenCheckMessage,
  OpposedCheckMessage,
} from "./types";

export type OpposeTarget = AttributeCheckMessage | OpenCheckMessage;

export interface ChatActionsContextValue {
  onOppose: ((message: OpposeTarget) => void) | null;
  onRerollOpposed: ((message: OpposedCheckMessage) => void) | null;
  selectedSpeaker: string;
}

export const chatActionsDefaultValue: ChatActionsContextValue = {
  onOppose: null,
  onRerollOpposed: null,
  selectedSpeaker: "",
};

export const ChatActionsContext = createContext<ChatActionsContextValue>(
  chatActionsDefaultValue,
);

export function useChatActions(): ChatActionsContextValue {
  return useContext(ChatActionsContext);
}
