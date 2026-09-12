import { useChatMessagesStore } from "../store/chatMessagesStore";
import { useEncounterChatStore } from "../stores/encounterChatStore";
import { useChatChannelStore } from "../stores/chatChannelStore";
import { hydrateTargets } from "./useRollToChat";
import type { ChatMessage } from "../components/app-drawer/panels/chat/types";

export function useAddChatMessage(): (message: ChatMessage) => void {
  const addGlobal = useChatMessagesStore((s) => s.addMessage);
  const addEncounter = useEncounterChatStore((s) => s.addMessage);
  const encounterId = useEncounterChatStore((s) => s.encounterId);

  return (message: ChatMessage) => {
    const hydrated = hydrateTargets(message);
    if (encounterId) {
      addEncounter({
        ...hydrated,
        channelId: `encounter:${encounterId}`,
      } as ChatMessage);
    } else {
      const channelId = useChatChannelStore.getState().activeChannelId;
      addGlobal({ ...hydrated, channelId } as ChatMessage);
    }
  };
}
