import { createContext, useContext } from "react";
import type {
  AttributeCheckMessage,
  DisplayMessage,
  OpenCheckMessage,
  OpposedCheckMessage,
} from "./types";

export type OpposeTarget = AttributeCheckMessage | OpenCheckMessage;

export type ResourceKind = "hp" | "mp" | "ip" | "fp" | "up";

export interface ChatActionsContextValue {
  onOppose: ((message: OpposeTarget) => void) | null;
  onRerollOpposed: ((message: OpposedCheckMessage) => void) | null;
  onLossResource:
    | ((
        message: DisplayMessage,
        resource: ResourceKind,
        amount: number,
      ) => void)
    | null;
  onGainResource:
    | ((
        message: DisplayMessage,
        resource: ResourceKind,
        amount: number,
      ) => void)
    | null;
  selectedSpeaker: string;
}

export const chatActionsDefaultValue: ChatActionsContextValue = {
  onOppose: null,
  onRerollOpposed: null,
  onLossResource: null,
  onGainResource: null,
  selectedSpeaker: "",
};

export const ChatActionsContext = createContext<ChatActionsContextValue>(
  chatActionsDefaultValue,
);

export function useChatActions(): ChatActionsContextValue {
  return useContext(ChatActionsContext);
}
