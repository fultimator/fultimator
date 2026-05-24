import type { TriggerMatch } from "./triggerScanner";

// Structured output from firing a trigger — pure data, no store access.
export interface TriggerChatOutput {
  speaker: string;
  itemName: string;
  itemType: string;
  text: string;
}

export interface FireTriggerResult {
  match: TriggerMatch;
  chatOutput: TriggerChatOutput | null;
}

// Derive the chat output for a single trigger match.
// Returns null if neither chatOutput.text nor a description is available.
function resolveChatOutput(match: TriggerMatch): TriggerChatOutput | null {
  const customText = (
    match.behavior as { chatOutput?: { text?: string } }
  ).chatOutput?.text?.trim();
  const text = customText || match.description?.trim();
  if (!text) return null;
  return {
    speaker: match.actorName,
    itemName: match.itemName,
    itemType: match.source === "npc" ? "special" : "skill",
    text,
  };
}

// Fire a set of trigger matches and return structured results.
// Pure — callers are responsible for side effects (addMessage, cooldowns, etc).
export function fireTriggers(matches: TriggerMatch[]): FireTriggerResult[] {
  return matches.map((match) => ({
    match,
    chatOutput: resolveChatOutput(match),
  }));
}
