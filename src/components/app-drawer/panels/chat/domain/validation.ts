import type { ChatMessage } from "../types";

export const isValidChatMessage = (item: unknown): item is ChatMessage => {
  if (!item || typeof item !== "object") return false;
  const message = item as Record<string, unknown>;

  if (typeof message.id !== "string") return false;
  if (typeof message.createdAt !== "number") return false;

  if (message.kind === "text") return typeof message.text === "string";

  if (message.kind === "generic") {
    const roll = message.roll as Record<string, unknown> | undefined;
    return (
      !!roll &&
      typeof roll.total === "number" &&
      typeof roll.modifier === "number" &&
      Array.isArray(roll.results) &&
      (roll.results as unknown[]).every(
        (r) =>
          r !== null &&
          typeof r === "object" &&
          typeof (r as Record<string, unknown>).sides === "number" &&
          typeof (r as Record<string, unknown>).value === "number",
      )
    );
  }

  return false;
};
