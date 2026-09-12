import React from "react";
import {
  ChatActionsContext,
  type ChatActionsContextValue,
} from "./ChatActionsContext.shared";
interface ChatActionsProviderProps {
  value: ChatActionsContextValue;
  children: React.ReactNode;
}

export function ChatActionsProvider({
  value,
  children,
}: ChatActionsProviderProps): React.JSX.Element {
  return (
    <ChatActionsContext.Provider value={value}>
      {children}
    </ChatActionsContext.Provider>
  );
}
