import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Divider, Typography } from "@mui/material";
import { useLocation } from "react-router";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { AUTHOR_NAME, DEFAULT_SPEAKER, LOCAL_SPEAKER_KEY } from "./constants";
import { formatTimeAgo } from "./utils";
import { useChatStore } from "./chatStore";
import { useAppDrawerStore } from "../../../../store/appDrawerStore";
import {
  useRouteActor,
  useActorName,
  resolveSpeakerOptions,
  useCombatSimActors,
} from "./domain/speakers";
import { useCombatEncounterStore } from "../../../../stores/combatEncounterStore";
import { BaseMessageTemplate } from "./message-templates/BaseMessageTemplate";
import { MessageContent } from "./message-templates/registry";
import { MessageListErrorBoundary } from "./MessageListErrorBoundary";
import { ChatComposer } from "./ChatComposer";
import SlotPickerDialog from "../../../player/equipment/slots/SlotPickerDialog";
import { useDatabase } from "../../../../hooks/useDatabase";
import type { TypePlayer } from "../../../../types/Players";
import type { ChatMessage } from "./types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SLOT_LABELS: Record<
  "mainHand" | "offHand" | "armor" | "accessory",
  string
> = {
  mainHand: "Main Hand",
  offHand: "Off Hand",
  armor: "Armor",
  accessory: "Accessory",
};

const resolveEquippedItemName = (
  doc: TypePlayer | null,
  slot: "mainHand" | "offHand" | "armor" | "accessory",
): string | null => {
  if (!doc || typeof doc !== "object") return null;
  const equippedSlots =
    doc.equippedSlots && typeof doc.equippedSlots === "object"
      ? (doc.equippedSlots as Record<string, unknown>)
      : null;
  const equipment =
    Array.isArray(doc.equipment) && doc.equipment.length > 0
      ? (doc.equipment[0] as Record<string, unknown>)
      : null;
  if (!equippedSlots || !equipment) return null;

  const slotRef =
    equippedSlots[slot] && typeof equippedSlots[slot] === "object"
      ? (equippedSlots[slot] as Record<string, unknown>)
      : null;
  if (!slotRef) return null;

  const source = typeof slotRef.source === "string" ? slotRef.source : null;
  const refName = typeof slotRef.name === "string" ? slotRef.name : null;
  const idx = typeof slotRef.index === "number" ? slotRef.index : -1;
  if (!source || !refName) return null;

  const collection = equipment[source];
  if (!Array.isArray(collection)) return refName;

  const fromIndex =
    idx >= 0 &&
    idx < collection.length &&
    collection[idx] &&
    typeof collection[idx] === "object"
      ? (collection[idx] as Record<string, unknown>)
      : null;
  if (fromIndex && typeof fromIndex.name === "string") return fromIndex.name;

  const byName = collection.find(
    (entry) =>
      entry &&
      typeof entry === "object" &&
      (entry as Record<string, unknown>).name === refName,
  ) as Record<string, unknown> | undefined;
  return typeof byName?.name === "string" ? byName.name : refName;
};

const buildEquipmentChangeMessage = ({
  slot,
  speaker,
  beforeItem,
  afterItem,
}: {
  slot: "mainHand" | "offHand" | "armor" | "accessory";
  speaker: string;
  beforeItem: string | null;
  afterItem: string | null;
}): ChatMessage => {
  const slotLabel = SLOT_LABELS[slot];
  const previousLabel = beforeItem ?? "Empty";
  const nextLabel = afterItem ?? "Empty";
  const isChange = previousLabel !== nextLabel;

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    speaker,
    kind: "display",
    itemType: "equipment",
    name: `${slotLabel} ${isChange ? "Changed" : "Confirmed"}`,
    tags: ["Equipment", slotLabel, isChange ? "Updated" : "No Change"],
    description: `**Before:** ${previousLabel}\n\n**After:** ${nextLabel}`,
  };
};

export const ChatPanel: React.FC = () => {
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>(
    () => localStorage.getItem(LOCAL_SPEAKER_KEY) ?? DEFAULT_SPEAKER,
  );
  const [clearLogsDialogOpen, setClearLogsDialogOpen] = useState(false);
  const [equipmentSlotPickerOpen, setEquipmentSlotPickerOpen] = useState<
    "mainHand" | "offHand" | "armor" | "accessory" | null
  >(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCountRef = useRef(0);

  const location = useLocation();
  const isCombatSim = location.pathname.startsWith("/combat-sim/");

  const { playerDoc, npcDoc } = useRouteActor();
  const chatActorDocOverride = useAppDrawerStore((s) => s.chatActorDocOverride);
  const contextActorName = useActorName(playerDoc, npcDoc);
  const combatSimActors = useCombatSimActors();
  const activeActorName = useCombatEncounterStore((s) => s.activeActorName);
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");

  const speakerOptions = useMemo(
    () =>
      isCombatSim
        ? [DEFAULT_SPEAKER, ...combatSimActors.map((a) => a.name)]
        : resolveSpeakerOptions(contextActorName),
    [isCombatSim, combatSimActors, contextActorName],
  );
  const combatSimActorsByName = useMemo(
    () => new Map(combatSimActors.map((actor) => [actor.name, actor])),
    [combatSimActors],
  );
  const selectedCombatSimActor = combatSimActorsByName.get(selectedSpeaker);

  const baseActiveActorDoc = isCombatSim
    ? selectedSpeaker === DEFAULT_SPEAKER
      ? null
      : (selectedCombatSimActor?.doc ?? null)
    : (chatActorDocOverride ?? playerDoc ?? npcDoc);
  const [activeActorDocOverride, setActiveActorDocOverride] = useState<Record<
    string,
    unknown
  > | null>(null);
  const activeActorDoc = activeActorDocOverride ?? baseActiveActorDoc;

  useEffect(() => {
    // When the listener or selected actor changes, prefer upstream data again.
    setActiveActorDocOverride(null);
  }, [baseActiveActorDoc]);

  const store = useChatStore(selectedSpeaker, activeActorDoc);
  const { addMessage } = store;

  // Create a setPlayer callback that persists changes to the database
  const setActiveActorDoc = useCallback(
    async (updater: TypePlayer | ((prev: TypePlayer) => TypePlayer)) => {
      if (!activeActorDoc?.id) return;

      const docId = activeActorDoc.id as string;
      const db = UUID_RE.test(docId) ? localDb : cloudDb;
      const isNpc = isCombatSim
        ? selectedCombatSimActor?.source === "npc"
        : !playerDoc || selectedSpeaker !== contextActorName;
      const collection = isNpc ? "npc-personal" : "player-personal";
      const docRef = db.doc(collection, docId);

      try {
        const fallbackBase = activeActorDoc as unknown as TypePlayer;
        const base =
          typeof updater === "function"
            ? (((await db.getDoc(docRef)) as TypePlayer | null) ?? fallbackBase)
            : fallbackBase;
        const updated = typeof updater === "function" ? updater(base) : updater;
        setActiveActorDocOverride(
          updated as unknown as Record<string, unknown>,
        );
        await db.setDoc(docRef, updated as unknown as Record<string, unknown>);
        if (equipmentSlotPickerOpen) {
          addMessage(
            buildEquipmentChangeMessage({
              slot: equipmentSlotPickerOpen,
              speaker: selectedSpeaker,
              beforeItem: resolveEquippedItemName(
                base,
                equipmentSlotPickerOpen,
              ),
              afterItem: resolveEquippedItemName(
                updated,
                equipmentSlotPickerOpen,
              ),
            }),
          );
        }
      } catch (err) {
        console.error(`Failed to save ${collection} document:`, err);
      }
    },
    [
      activeActorDoc,
      cloudDb,
      contextActorName,
      addMessage,
      isCombatSim,
      localDb,
      equipmentSlotPickerOpen,
      playerDoc,
      selectedCombatSimActor,
      selectedSpeaker,
    ],
  );

  useEffect(() => {
    if (!speakerOptions.includes(selectedSpeaker)) {
      setSelectedSpeaker(DEFAULT_SPEAKER);
    }
  }, [selectedSpeaker, speakerOptions]);

  useEffect(() => {
    if (isCombatSim) return;
    if (!contextActorName) return;
    if (selectedSpeaker === contextActorName) return;
    localStorage.setItem(LOCAL_SPEAKER_KEY, contextActorName);
    setSelectedSpeaker(contextActorName);
  }, [isCombatSim, contextActorName, selectedSpeaker]);

  useEffect(() => {
    if (!isCombatSim || !activeActorName) return;
    if (speakerOptions.includes(activeActorName)) {
      localStorage.setItem(LOCAL_SPEAKER_KEY, activeActorName);
      setSelectedSpeaker(activeActorName);
    }
  }, [activeActorName, isCombatSim, speakerOptions]);

  useEffect(() => {
    const prev = previousMessageCountRef.current;
    if (store.messages.length > prev) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessageCountRef.current = store.messages.length;
  }, [store.messages.length]);

  const handleExport = () => {
    try {
      const blob = new Blob(
        [
          JSON.stringify(
            { exportedAt: new Date().toISOString(), messages: store.messages },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `chat-log-${Date.now()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      // ignore export errors
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MessageListErrorBoundary>
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 2,
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {store.messages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Start chatting or roll from the dice tray below.
            </Typography>
          )}
          {store.messages.map((message) => (
            <BaseMessageTemplate
              key={message.id}
              speaker={message.speaker || AUTHOR_NAME}
              timeAgo={formatTimeAgo(message.createdAt)}
              onDelete={() => store.deleteMessage(message.id)}
            >
              <MessageContent message={message} />
            </BaseMessageTemplate>
          ))}
          <Box ref={endOfMessagesRef} />
        </Box>
      </MessageListErrorBoundary>

      <Divider />

      <ChatComposer
        store={store}
        speakerOptions={speakerOptions}
        selectedSpeaker={selectedSpeaker}
        playerDoc={activeActorDoc}
        onSpeakerChange={(s) => {
          localStorage.setItem(LOCAL_SPEAKER_KEY, s);
          setSelectedSpeaker(s);
        }}
        onExport={handleExport}
        onClearRequest={() => setClearLogsDialogOpen(true)}
        onOpenEquipmentSlot={setEquipmentSlotPickerOpen}
      />

      <DeleteConfirmationDialog
        open={clearLogsDialogOpen}
        onClose={() => setClearLogsDialogOpen(false)}
        onConfirm={() => store.clearAll()}
        title="Clear Chat Logs"
        message="Are you sure you want to delete all chat messages and roll history?"
        enableCtrlBypass={false}
      />

      {activeActorDoc && (
        <SlotPickerDialog
          open={equipmentSlotPickerOpen !== null}
          onClose={() => {
            setEquipmentSlotPickerOpen(null);
          }}
          slot={equipmentSlotPickerOpen ?? "mainHand"}
          player={activeActorDoc as Record<string, unknown>}
          setPlayer={setActiveActorDoc}
          vehicleModules={[]}
          onSelectModule={() => {}}
          onDisableModule={() => {}}
          onClearOtherHandModule={() => {}}
        />
      )}
    </Box>
  );
};
