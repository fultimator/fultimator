import { useEncounterChatStore } from "../stores/encounterChatStore";
import { useChatMessagesStore } from "../store/chatMessagesStore";
import { useChatChannelStore } from "../stores/chatChannelStore";
import { useCombatEncounterStore } from "../stores/combatEncounterStore";
import type {
  ChatMessage,
  DisplayMessage,
} from "../components/app-drawer/panels/chat/types";

function addToChat(message: ChatMessage) {
  const encId = useEncounterChatStore.getState().encounterId;
  if (encId) {
    useEncounterChatStore.getState().addMessage({
      ...message,
      channelId: `encounter:${encId}`,
    } as ChatMessage);
  } else {
    const channelId = useChatChannelStore.getState().activeChannelId;
    useChatMessagesStore
      .getState()
      .addMessage({ ...message, channelId } as ChatMessage);
  }
}

export function hydrateTargets<T extends ChatMessage>(message: T): T {
  if (message.kind !== "accuracy" && message.kind !== "magic") return message;
  const existing = (message as { check: { targetsSnapshot?: unknown[] } }).check
    .targetsSnapshot;
  if (Array.isArray(existing) && existing.length > 0) return message;
  const targets = useCombatEncounterStore.getState().targets;
  if (targets.length === 0) return message;
  return {
    ...message,
    check: {
      ...(message as { check: object }).check,
      targetsSnapshot: [...targets],
    },
  };
}

export function sendRollMessage(message: ChatMessage) {
  addToChat(hydrateTargets(message));
}

export function sendDisplayMessage(
  itemType: DisplayMessage["itemType"],
  name: string,
  opts: {
    tags?: string[];
    description?: string;
    effect?: string;
    speaker?: string;
    cost?: {
      resource: "hp" | "mp" | "ip" | "fp" | "up";
      amount: number;
      perTarget?: boolean;
    };
  } = {},
) {
  const msg: DisplayMessage = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    speaker: opts.speaker,
    kind: "display",
    itemType,
    name,
    tags: opts.tags ?? [],
    description: opts.description,
    effect: opts.effect,
    cost: opts.cost,
  };
  addToChat(msg as ChatMessage);
}
