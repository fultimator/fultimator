import { useState, useEffect } from "react";
import { LOCAL_CHAT_KEY, DICE_OPTIONS } from "./constants";
import { isValidChatMessage } from "./domain/validation";
import { buildRollMessage, buildTextMessage } from "./domain/rolls";
import { executeCommand } from "./domain/commands";
import type { ChatMessage, DieSides } from "./types";

export type PendingDice = Partial<Record<DieSides, number>>;

export function useChatStore(
  selectedSpeaker: string,
  playerDoc: Record<string, unknown> | null = null,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingDice, setPendingDice] = useState<PendingDice>({});
  const [pendingD100, setPendingD100] = useState(0);
  const [pendingModifier, setPendingModifier] = useState(0);
  const [commandError, setCommandError] = useState<string | null>(null);
  const clearCommandError = () => setCommandError(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_CHAT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;
      const valid = parsed.filter(isValidChatMessage);
      if (valid.length > 0) setMessages(valid);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CHAT_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota / private-mode errors
    }
  }, [messages]);

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

    const next: ChatMessage[] = [];
    if (trimmed) {
      const result = executeCommand(trimmed, {
        speaker: selectedSpeaker,
        playerDoc,
      });
      if (result === null) {
        next.push(buildTextMessage(trimmed, selectedSpeaker));
        setCommandError(null);
      } else if (result.ok === false) {
        setCommandError(result.error);
        return;
      } else if (result.ok === true) {
        next.push(...result.messages);
        setCommandError(null);
      }
    }
    if (hasPendingRoll) {
      next.push(
        buildRollMessage(
          pendingDice,
          pendingD100,
          pendingModifier,
          selectedSpeaker,
        ),
      );
      clearPendingRoll();
    }
    setMessages((prev) => [...prev, ...next]);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAll = () => setMessages([]);

  const addDie = (sides: DieSides) => {
    setPendingDice((prev) => ({ ...prev, [sides]: (prev[sides] ?? 0) + 1 }));
  };

  const addD100 = () => setPendingD100((prev) => prev + 1);

  const setModifier = (value: number) => setPendingModifier(value);
  const incrementModifier = () => setPendingModifier((prev) => prev + 1);
  const decrementModifier = () => setPendingModifier((prev) => prev - 1);

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
    deleteMessage,
    clearAll,
    addDie,
    addD100,
    setModifier,
    incrementModifier,
    decrementModifier,
    clearPendingRoll,
  };
}
