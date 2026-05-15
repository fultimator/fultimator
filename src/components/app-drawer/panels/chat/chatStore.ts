import { useState } from "react";
import { DICE_OPTIONS } from "./constants";
import { buildRollMessage, buildTextMessage } from "./domain/rolls";
import { executeCommand } from "./domain/commands";
import { useChatMessagesStore } from "../../../../store/chatMessagesStore";
import type { DieSides } from "./types";

export type PendingDice = Partial<Record<DieSides, number>>;

export function useChatStore(
  selectedSpeaker: string,
  playerDoc: Record<string, unknown> | null = null,
) {
  const { messages, addMessage, deleteMessage, clearAll } =
    useChatMessagesStore();
  const [pendingDice, setPendingDice] = useState<PendingDice>({});
  const [pendingD100, setPendingD100] = useState(0);
  const [pendingModifier, setPendingModifier] = useState(0);
  const [commandError, setCommandError] = useState<string | null>(null);
  const clearCommandError = () => setCommandError(null);

  const hasPendingRoll =
    DICE_OPTIONS.some((sides) => (pendingDice[sides] ?? 0) > 0) ||
    pendingD100 > 0;
  const hasPendingState = hasPendingRoll || pendingModifier !== 0;

  const clearPendingRoll = () => {
    setPendingDice({});
    setPendingD100(0);
    setPendingModifier(0);
  };

  const send = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed && !hasPendingRoll) return;

    if (trimmed) {
      const result = executeCommand(trimmed, {
        speaker: selectedSpeaker,
        playerDoc,
      });
      if (result === null) {
        addMessage(buildTextMessage(trimmed, selectedSpeaker));
        setCommandError(null);
      } else if (result.ok === false) {
        setCommandError(result.error);
        return;
      } else if (result.ok === true) {
        result.messages.forEach(addMessage);
        setCommandError(null);
      }
    }
    if (hasPendingRoll) {
      addMessage(
        buildRollMessage(
          pendingDice,
          pendingD100,
          pendingModifier,
          selectedSpeaker,
        ),
      );
      clearPendingRoll();
    }
  };

  return {
    messages,
    pendingDice,
    pendingD100,
    pendingModifier,
    hasPendingRoll,
    hasPendingState,
    commandError,
    clearCommandError,
    send,
    addMessage,
    deleteMessage,
    clearAll,
    addDie: (sides: DieSides) =>
      setPendingDice((prev) => ({ ...prev, [sides]: (prev[sides] ?? 0) + 1 })),
    addD100: () => setPendingD100((prev) => prev + 1),
    setModifier: (value: number) => setPendingModifier(value),
    incrementModifier: () => setPendingModifier((prev) => prev + 1),
    decrementModifier: () => setPendingModifier((prev) => prev - 1),
    clearPendingRoll,
  };
}
