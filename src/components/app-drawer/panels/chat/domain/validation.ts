import type { ChatMessage, LogMessage } from "../types";

const isCheckResult = (check: unknown): boolean => {
  if (!check || typeof check !== "object") return false;
  const c = check as Record<string, unknown>;
  return typeof c.result === "number" && typeof c.critical === "boolean";
};

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

  if (message.kind === "action") return typeof message.action === "string";

  if (message.kind === "attribute" || message.kind === "open") {
    return isCheckResult(message.check);
  }

  if (message.kind === "opposed") {
    const check = message.check as Record<string, unknown> | undefined;
    return (
      isCheckResult(check) &&
      !!check &&
      typeof check.opposedToId === "string" &&
      typeof check.opposedToResult === "number"
    );
  }

  if (message.kind === "accuracy" || message.kind === "magic") {
    const check = message.check as Record<string, unknown> | undefined;
    return !!check && typeof check.accuracyTotal === "number";
  }

  if (message.kind === "display") {
    return (
      typeof message.itemType === "string" &&
      typeof message.name === "string" &&
      Array.isArray(message.tags)
    );
  }

  if (message.kind === "log") {
    const event = message.event as Record<string, unknown> | undefined;
    return !!event && typeof event.type === "string";
  }

  return false;
};

export const isValidLogMessage = (item: unknown): item is LogMessage => {
  if (!item || typeof item !== "object") return false;
  const m = item as Record<string, unknown>;
  return (
    m.kind === "log" &&
    typeof m.id === "string" &&
    typeof m.createdAt === "number" &&
    typeof m.channelId === "string" &&
    !!m.event &&
    typeof (m.event as Record<string, unknown>).type === "string"
  );
};
