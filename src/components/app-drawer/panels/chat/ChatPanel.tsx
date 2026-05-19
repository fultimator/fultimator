import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
} from "@mui/material";
import { useLocation } from "react-router";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
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
import { ChatActionsProvider } from "./ChatActionsContext";
import type { OpposeTarget } from "./ChatActionsContext.shared";
import type { OpposedCheckMessage } from "./types";
import { MessageListErrorBoundary } from "./MessageListErrorBoundary";
import { ChatComposer } from "./ChatComposer";
import SlotPickerDialog from "../../../player/equipment/slots/SlotPickerDialog";
import VehicleEnterDialog from "../../../player/equipment/slots/VehicleEnterDialog";
import NotesMarkdown from "../../../common/NotesMarkdown";
import { useDatabase } from "../../../../hooks/useDatabase";
import type { TypePlayer } from "../../../../types/Players";
import { applyPostLoadTransforms } from "../../../../components/player/playerTransforms";
import { applyNpcPostLoadTransforms } from "../../../../components/npc/npcTransforms";
import type { TypeNpc } from "../../../../types/Npcs";
import type { ChatMessage } from "./types";
import {
  prepareCheck,
  rollCheck,
  processOpposedCheck,
  buildOpposedCheckMessage,
} from "./domain/checks";
import { resolveAttributeDie } from "./domain/speakers";
import {
  getAvailableSupportModules,
  getEquippedModuleForSlot,
  getEquippedModulesForSlot,
  getPilotSpellInfo,
} from "../../../player/equipment/slots/loadoutSelectors";
import {
  disableModuleForSlot,
  enterVehicleAction,
  saveVehiclesAction,
  selectModuleForSlot,
  toggleSupportModuleAction,
  toggleActiveVehicle,
} from "../../../player/equipment/slots/loadoutActions";
import { getActiveVehicle } from "../../../player/equipment/slots/equipmentSlots";
import { useTranslate } from "../../../../translation/translate";

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
      ? (doc.equipment[0] as unknown as Record<string, unknown>)
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
  const { t } = useTranslate();
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>(
    () => localStorage.getItem(LOCAL_SPEAKER_KEY) ?? DEFAULT_SPEAKER,
  );
  const [clearLogsDialogOpen, setClearLogsDialogOpen] = useState(false);
  const [supportPickerOpen, setSupportPickerOpen] = useState(false);
  const [vehiclePickerOpen, setVehiclePickerOpen] = useState(false);
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
  const activeActorDocRef = useRef(activeActorDoc);
  activeActorDocRef.current = activeActorDoc;
  const activeSlotForDialog = equipmentSlotPickerOpen ?? "mainHand";
  const dialogVehicleModules = useMemo(() => {
    if (!activeActorDoc || !equipmentSlotPickerOpen) return [];
    return getEquippedModulesForSlot(
      activeActorDoc as unknown as TypePlayer,
      equipmentSlotPickerOpen,
    );
  }, [activeActorDoc, equipmentSlotPickerOpen]);
  const dialogModuleActive = useMemo(() => {
    if (!activeActorDoc || !equipmentSlotPickerOpen) return false;
    return !!getEquippedModuleForSlot(
      activeActorDoc as unknown as TypePlayer,
      equipmentSlotPickerOpen,
    );
  }, [activeActorDoc, equipmentSlotPickerOpen]);
  const equippedSupportModules = useMemo(() => {
    if (!activeActorDoc) return [];
    return getAvailableSupportModules(activeActorDoc as unknown as TypePlayer);
  }, [activeActorDoc]);
  const activeSupportModuleKeys = useMemo(() => {
    if (!activeActorDoc) return new Set<string>();
    const vehicle = getActiveVehicle(activeActorDoc as unknown as TypePlayer);
    const support: string[] = vehicle?.slots?.support ?? [];
    return new Set<string>(support);
  }, [activeActorDoc]);

  useEffect(() => {
    // When the listener or selected actor changes, prefer upstream data again.
    setActiveActorDocOverride(null);
  }, [baseActiveActorDoc]);

  const store = useChatStore(selectedSpeaker, activeActorDoc);
  const { addMessage } = store;

  const handleOppose = useCallback(
    (target: OpposeTarget) => {
      const { primary, secondary } = target.check.intent;
      const dieSizes = {
        primary: resolveAttributeDie(activeActorDoc, primary),
        secondary: resolveAttributeDie(activeActorDoc, secondary),
      };
      const intent = prepareCheck({ primary, secondary });
      const rolls = rollCheck(dieSizes);
      const result = processOpposedCheck(
        intent,
        rolls,
        dieSizes,
        selectedSpeaker,
        target.id,
        target.check.result,
        target.speaker,
        target.check.critical,
        target.check.fumble,
      );
      addMessage(buildOpposedCheckMessage(result));
    },
    [activeActorDoc, selectedSpeaker, addMessage],
  );

  const handleRerollOpposed = useCallback(
    (target: OpposedCheckMessage) => {
      const { primary, secondary } = target.check.intent;
      const dieSizes = {
        primary: resolveAttributeDie(activeActorDoc, primary),
        secondary: resolveAttributeDie(activeActorDoc, secondary),
      };
      const intent = prepareCheck({ primary, secondary });
      const rolls = rollCheck(dieSizes);
      const result = processOpposedCheck(
        intent,
        rolls,
        dieSizes,
        selectedSpeaker,
        target.id,
        target.check.opposedToResult,
        target.check.opposedToSpeaker,
        target.check.opposedToCritical,
        target.check.opposedToFumble,
      );
      addMessage(buildOpposedCheckMessage(result));
    },
    [activeActorDoc, selectedSpeaker, addMessage],
  );

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
        let base: TypePlayer;
        if (typeof updater === "function") {
          const raw = (await db.getDoc(docRef)) as TypePlayer | TypeNpc | null;
          base = raw
            ? isNpc
              ? (applyNpcPostLoadTransforms(
                  raw as TypeNpc,
                ) as unknown as TypePlayer)
              : applyPostLoadTransforms(raw as TypePlayer)
            : fallbackBase;
        } else {
          base = fallbackBase;
        }
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
      <ChatActionsProvider
        value={{
          onOppose: activeActorDoc ? handleOppose : null,
          onRerollOpposed: activeActorDoc ? handleRerollOpposed : null,
          selectedSpeaker,
        }}
      >
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
      </ChatActionsProvider>

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
        onToggleVehicle={() => {
          const doc = activeActorDocRef.current;
          if (!doc) return;
          const pilotInfo = getPilotSpellInfo(doc as unknown as TypePlayer);
          if (!pilotInfo) return;
          const vehicles = Array.isArray(pilotInfo.spell.currentVehicles)
            ? pilotInfo.spell.currentVehicles
            : Array.isArray(pilotInfo.spell.vehicles)
              ? pilotInfo.spell.vehicles
              : [];
          const isActive = vehicles.some((v) => v.enabled);
          if (!isActive) {
            setVehiclePickerOpen(true);
            return;
          }
          setActiveActorDoc((prev) => {
            const pi = getPilotSpellInfo(prev);
            if (!pi) return prev;
            return toggleActiveVehicle(prev, pi);
          });
        }}
        onSwapVehicle={() => {
          setActiveActorDoc((prev) => {
            const pilotInfo = getPilotSpellInfo(prev);
            if (!pilotInfo) return prev;
            const vehicles = Array.isArray(pilotInfo.spell.currentVehicles)
              ? pilotInfo.spell.currentVehicles
              : Array.isArray(pilotInfo.spell.vehicles)
                ? pilotInfo.spell.vehicles
                : [];
            if (vehicles.length < 2) return prev;
            const currentIndex = vehicles.findIndex(
              (vehicle) => vehicle.enabled,
            );
            const nextIndex =
              currentIndex < 0 ? 0 : (currentIndex + 1) % vehicles.length;
            const updatedVehicles = vehicles.map((vehicle, index) => ({
              ...vehicle,
              enabled: index === nextIndex,
            }));
            return saveVehiclesAction(prev, pilotInfo, {
              vehicles: updatedVehicles,
              showInPlayerSheet: (
                pilotInfo.spell as { showInPlayerSheet?: boolean }
              ).showInPlayerSheet,
            });
          });
        }}
        onOpenSupportModules={() => setSupportPickerOpen(true)}
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
          slot={activeSlotForDialog}
          player={activeActorDoc as unknown as Record<string, unknown>}
          setPlayer={setActiveActorDoc}
          vehicleModules={dialogVehicleModules}
          openModuleOverride={dialogModuleActive}
          onSelectModule={(originalIndex) => {
            setActiveActorDoc((prev) => {
              const pilotInfo = getPilotSpellInfo(prev);
              if (!pilotInfo) return prev;
              return selectModuleForSlot(
                prev,
                pilotInfo,
                activeSlotForDialog,
                originalIndex,
              );
            });
          }}
          onDisableModule={() => {
            setActiveActorDoc((prev) => {
              const pilotInfo = getPilotSpellInfo(prev);
              if (!pilotInfo) return prev;
              return disableModuleForSlot(prev, pilotInfo, activeSlotForDialog);
            });
          }}
          onClearOtherHandModule={() => {}}
        />
      )}

      <Dialog
        open={supportPickerOpen}
        onClose={() => setSupportPickerOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PrecisionManufacturingIcon color="success" fontSize="small" />
          {t("Support Modules")}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          {equippedSupportModules.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("No support modules installed on this vehicle.")}
            </Typography>
          ) : (
            <>
              <Typography
                variant="caption"
                gutterBottom
                sx={{
                  color: "text.secondary",
                  display: "block",
                }}
              >
                {t("Enable or disable support modules:")}
              </Typography>
              <List dense>
                {equippedSupportModules.map((module) => (
                  <ListItem key={module.originalIndex} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setActiveActorDoc((prev) => {
                          const pilotInfo = getPilotSpellInfo(prev);
                          if (!pilotInfo) return prev;
                          return toggleSupportModuleAction(
                            prev,
                            pilotInfo,
                            module.originalIndex,
                          );
                        });
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={activeSupportModuleKeys.has(module.key ?? module.name)}
                          disableRipple
                          size="small"
                          color="success"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={module.customName || t(module.name)}
                        secondary={
                          <Box
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.75rem",
                            }}
                          >
                            {module.isComplex && (
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, mr: 0.5 }}
                              >
                                {t("Complex")} -{" "}
                              </Typography>
                            )}
                            <NotesMarkdown
                              sx={{
                                display: "inline",
                                "& p": { display: "inline", m: 0 },
                              }}
                            >
                              {module.name === "pilot_custom_support"
                                ? module.description
                                : t(module.description || "")}
                            </NotesMarkdown>
                          </Box>
                        }
                        slotProps={{
                          primary: {
                            variant: "body2",
                            sx: { fontWeight: activeSupportModuleKeys.has(module.key ?? module.name) ? 700 : 400 },
                          },
                          secondary: {
                            component: "div",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportPickerOpen(false)} size="small">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>

      <VehicleEnterDialog
        open={vehiclePickerOpen}
        onClose={() => setVehiclePickerOpen(false)}
        title={t("Enter Vehicle")}
        vehicles={(() => {
          if (!activeActorDoc) return [];
          const pilotInfo = getPilotSpellInfo(
            activeActorDoc as unknown as TypePlayer,
          );
          if (!pilotInfo) return [];
          return Array.isArray(pilotInfo.spell.vehicles)
            ? pilotInfo.spell.vehicles
            : Array.isArray(pilotInfo.spell.currentVehicles)
              ? pilotInfo.spell.currentVehicles
              : [];
        })()}
        onEnter={(vehicleIndex: number) => {
          setActiveActorDoc((prev) => {
            const pilotInfo = getPilotSpellInfo(prev);
            if (!pilotInfo) return prev;
            return enterVehicleAction(prev, pilotInfo, vehicleIndex);
          });
        }}
      />
    </Box>
  );
};
