import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router";
import Layout from "../../components/Layout";
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import PCDetail from "../../components/combatSim/PCDetail";
import { calcHP, calcMP } from "../../libs/npcs";
import SelectedActors from "../../components/combatSim/SelectedActors";
import useDownloadImage from "../../hooks/useDownloadImage";
import NPCDetail from "../../components/combatSim/NPCDetail";
import CombatSimClocks from "../../components/combatSim/CombatSimClocks";
import { typesList } from "../../libs/types";
import { t } from "../../translation/translate";
import DamageHealDialog from "../../components/combatSim/DamageHealDialog";
import { Cloud as CloudIcon, DragHandle } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { globalConfirm } from "../../utility/globalConfirm";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";
import { useCombatEncounterStore } from "../../stores/combatEncounterStore";
import { useCombatActorSelectStore } from "../../store/combatActorSelectStore";
import GeneralNotesDialog from "../../components/combatSim/GeneralNotesDialog";
import InitiativeDialog from "../../components/combatSim/InitiativeDialog";
import NpcEditModal from "../../components/combatSim/NpcEditModal";
import { SignIn } from "../../components/auth";
import { useDatabaseContext } from "../../context/useDatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";
import { applyNpcPostLoadTransforms } from "../../libs/actor";
import { applyPostLoadTransforms as applyPlayerPostLoadTransforms } from "../../libs/actor";
import {
  buildDamageContext,
  resolveDamage,
} from "../../pipelines/damagePipeline";
import { scanForTrigger } from "../../pipelines/triggerScanner";
import { fireTriggers } from "../../pipelines/triggerExecutor";
import { getActorBonuses } from "../../libs/actorBonuses";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
import { useEncounterChatStore } from "../../stores/encounterChatStore";
import { useChatChannelStore } from "../../stores/chatChannelStore";
import { isValidChatMessage } from "../../components/app-drawer/panels/chat/domain/validation";
import { emitCombatLog } from "../../libs/combatLogEmitter";

// eslint-disable-next-line react-refresh/only-export-components
export function villainUltimaMax(villain) {
  if (villain === "minor") return 5;
  if (villain === "major") return 10;
  if (villain === "supreme") return 15;
  return 5;
}

export default function CombatSimulator() {
  const { authLoading, dbMode, cloudUser, activeUid } = useDatabaseContext();
  const isLocalMode = dbMode === "local";
  const effectiveUser = cloudUser ?? (isLocalMode ? { uid: activeUid } : null);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <Layout fullWidth unsavedChanges={isDirty}>
      {authLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {!authLoading && !effectiveUser && (
        <Paper
          elevation={dbMode === "cloud" ? 3 : 0}
          variant={dbMode === "cloud" ? "elevation" : "outlined"}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <CloudIcon color={dbMode === "cloud" ? "primary" : "disabled"} />
          <Typography
            variant="body2"
            color={dbMode === "cloud" ? "text.primary" : "text.secondary"}
            sx={{ flex: 1, minWidth: 200 }}
          >
            {t("You have to be logged in to access this feature")}
          </Typography>
          <SignIn />
        </Paper>
      )}
      {!authLoading && effectiveUser && (
        <CombatSim
          key={dbMode}
          user={effectiveUser}
          setIsDirty={setIsDirty}
          isDirty={isDirty}
        />
      )}
    </Layout>
  );
}

const CombatSim = ({ user, setIsDirty, isDirty }) => {
  const { dbMode } = useDatabaseContext();
  const isLocalMode = dbMode === "local";
  const db = useDatabase();

  // ========== Base States ==========
  const { id } = useParams(); // Get the encounter ID from the URL
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [initialized, setInitialized] = useState(false); // Initialized state

  // ========== DB (active adapter - uid auto-injected in cloud mode) ==========
  const [encounterData, setEncounterData] = useState(null);
  const [loadingEncounter, setLoadingEncounter] = useState(true);

  useEffect(() => {
    setLoadingEncounter(true);
    db.getDoc(db.doc("encounters", id))
      .then((data) => setEncounterData(data ?? null))
      .catch((e) => console.error("Error loading encounter:", e))
      .finally(() => setLoadingEncounter(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // NPC list - one-time fetch on mount; no live subscription
  const [npcsList, setNpcsList] = useState([]);
  const [loadingNpcs, setLoadingNpcs] = useState(true);

  useEffect(() => {
    db.getDocs(db.query(db.collection("npc-personal")))
      .then((docs) => setNpcsList(docs ?? []))
      .catch((e) => console.error("Error loading NPC list:", e))
      .finally(() => setLoadingNpcs(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Player list - one-time fetch on mount
  const [playersList, setPlayersList] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    db.getDocs(db.query(db.collection("player-personal")))
      .then((docs) => setPlayersList(docs ?? []))
      .catch((e) => console.error("Error loading player list:", e))
      .finally(() => setLoadingPlayers(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== Clock States ==========
  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [encounterClocks, setEncounterClocks] = useState([]); // Store clocks for the encounter

  // ========== User Preferences (Zustand Storage) ==========
  const {
    // Automation / Interface settings
    npcReorderingMethod,
    noteReorderingMethod,
    autosaveEnabled,
    autosaveInterval,
    showSaveSnackbar,
    askBeforeRemoveNpc,
    autoRemoveNPCFaint,
    askBeforeRemoveClock,
  } = useCombatSimSettingsStore.getState().settings;
  const AUTO_SAVE_DELAY = 1000 * (autosaveInterval ?? 30); // Delay for autosave, default 30 seconds

  // ========== Encounter States ==========
  const [encounter, setEncounter] = useState(null); // Current encounter
  const [combatActive, setCombatActive] = useState(false);
  const [initiative, setInitiative] = useState("players");
  const [currentTurn, setCurrentTurn] = useState("players");
  const [activeTurn, setActiveTurn] = useState(null);
  const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false);
  const [encounterName, setEncounterName] = useState(""); // Encounter name
  const [isEditing, setIsEditing] = useState(false); // Encounter name editing state
  const [npcList, setNpcList] = useState([]); // Available NPCs
  const [playerList, setPlayerList] = useState([]); // Available players
  const [selectedNPCs, setSelectedNPCs] = useState([]); // Selected NPCs
  const [selectedNPC, setSelectedNPC] = useState(null); // Selected NPC (for NPC Sheet)
  const [selectedPCs, setSelectedPCs] = useState([]); // Selected PCs
  const [selectedPC, setSelectedPC] = useState(null); // Selected PC (for PC Sheet)
  const [npcClicked, setNpcClicked] = useState(null); // Entity clicked for HP/MP change
  const [clickedEntityType, setClickedEntityType] = useState("npc"); // "npc" | "pc"
  const [lastSaved, setLastSaved] = useState(null); // Last saved time
  const [lastAutoSaved, setLastAutoSaved] = useState(null); // Last auto-saved time
  const [encounterNotes, setEncounterNotes] = useState([]); // Encounter notes

  // ========== UI Interaction States ==========
  const [npcDetailWidth, setNpcDetailWidth] = useState(36); // NPC detail width (%)
  const isResizing = useRef(false); // Resizing flag
  const startX = useRef(0);
  const startWidth = useRef(npcDetailWidth);
  const prevSelectedNpcsRef = useRef(null);
  const prevSelectedPCsRef = useRef(null);
  const prevRoundRef = useRef(null);
  const prevEncounterNameRef = useRef(null);
  const prevClocksRef = useRef(null);
  const prevNotesRef = useRef(null);
  const prevCombatActiveRef = useRef(null);
  const prevInitiativeRef = useRef(null);
  const prevCurrentTurnRef = useRef(null);
  const prevActiveTurnRef = useRef(null);
  const handleSaveStateRef = useRef(null);
  const [tabIndex, setTabIndex] = useState(0); // NPC sheet tab index
  const [pcTabIndex, setPcTabIndex] = useState(0); // PC sheet tab index
  const [selectedStudy, setSelectedStudy] = useState(0); // NPC study level (0 = full sheet, 1-3 = study tiers)
  const [isSaveSnackbarOpen, setIsSaveSnackbarOpen] = useState(false); // Save notification state
  const isDifferentUser = !isLocalMode && encounter?.uid !== user?.uid;
  const isPrivate = encounter?.private && isDifferentUser;
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [npcEditModalOpen, setNpcEditModalOpen] = useState(false);

  // Keep selected detail actors synced with live list updates.
  useEffect(() => {
    if (!selectedPC?.combatId) return;
    const livePc = selectedPCs.find(
      (pc) => pc.combatId === selectedPC.combatId,
    );
    if (!livePc) {
      setSelectedPC(null);
      return;
    }
    if (livePc !== selectedPC) {
      setSelectedPC(livePc);
    }
  }, [selectedPC, selectedPCs]);

  useEffect(() => {
    if (!selectedNPC?.combatId) return;
    const liveNpc = selectedNPCs.find(
      (npc) => npc.combatId === selectedNPC.combatId,
    );
    if (!liveNpc) {
      setSelectedNPC(null);
      return;
    }
    if (liveNpc !== selectedNPC) {
      setSelectedNPC(liveNpc);
    }
  }, [selectedNPC, selectedNPCs]);

  // Sync actors to shared store so the chat panel can read them without a Firestore round-trip.
  const setEncounterActors = useCombatEncounterStore((s) => s.setActors);
  const setActiveActorName = useCombatEncounterStore(
    (s) => s.setActiveActorName,
  );
  const clearEncounterActors = useCombatEncounterStore((s) => s.clearActors);
  const setEncounterChat = useEncounterChatStore((s) => s.setMessages);
  const addEncounterChatMessage = useEncounterChatStore((s) => s.addMessage);
  const clearEncounterChat = useEncounterChatStore((s) => s.clear);
  const setEncounterChannel = useChatChannelStore((s) => s.setEncounterChannel);
  const clearEncounterChannel = useChatChannelStore(
    (s) => s.clearEncounterChannel,
  );
  const clearTargets = useCombatEncounterStore((s) => s.clearTargets);
  const runtimeActors = useCombatEncounterStore((s) => s.runtimeActors);
  const setActorSelectPanelData = useCombatActorSelectStore(
    (s) => s.setPanelData,
  );
  const clearActorSelectPanelData = useCombatActorSelectStore(
    (s) => s.clearPanelData,
  );
  useEffect(() => {
    setEncounterActors(id, selectedNPCs, selectedPCs);
  }, [id, selectedNPCs, selectedPCs]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(
    () => () => {
      clearEncounterActors();
      clearEncounterChat();
      clearEncounterChannel();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ========== HP/MP Dialog States ==========
  const [statType, setStatType] = useState("HP");
  const [value, setValue] = useState("");
  const [damageType, setDamageType] = useState("");
  const [isGuarding, setIsGuarding] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [isIgnoreResistance, setIsIgnoreResistance] = useState(false);
  const [isIgnoreImmunity, setIsIgnoreImmunity] = useState(false);
  const [open, setOpen] = useState(false);

  // ========== Turns Popover States ==========
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverNpcId, setPopoverNpcId] = useState(null);

  // ========== Image Download States ==========
  const [downloadImage, downloadSnackbar] = useDownloadImage();

  // Helper for fetching single NPC
  const getNpc = useCallback(
    async (npcId) => {
      return db.getDoc(db.doc("npc-personal", npcId));
    },
    [db],
  );

  // Sync NPC selector list whenever the live collection updates
  useEffect(() => {
    setNpcList(npcsList);
  }, [npcsList]);

  // Sync player selector list
  useEffect(() => {
    setPlayerList(playersList);
  }, [playersList]);

  // Initialize encounter state once data is loaded
  useEffect(() => {
    if (encounterData && !initialized) {
      setEncounter(encounterData);
      setEncounterName(encounterData.name || "Unnamed Encounter");
      setSelectedNPCs(
        (encounterData.selectedNPCs || []).map((npc) =>
          applyNpcPostLoadTransforms(npc),
        ),
      );
      setSelectedPCs(
        (encounterData.selectedPCs || []).map((pc) =>
          applyPlayerPostLoadTransforms(pc),
        ),
      );
      setEncounterClocks(encounterData.clocks || []);
      setEncounterNotes(encounterData.notes || []);
      setLastSaved(encounterData.lastSaved);
      setLastAutoSaved(encounterData.lastAutoSaved);
      if (encounterData.combatActive != null)
        setCombatActive(encounterData.combatActive);
      if (encounterData.initiative) setInitiative(encounterData.initiative);
      if (encounterData.currentTurn) setCurrentTurn(encounterData.currentTurn);
      if (encounterData.activeTurn !== undefined)
        setActiveTurn(encounterData.activeTurn);

      setEncounterChat(
        id,
        (encounterData.chatMessages ?? []).filter((m) => isValidChatMessage(m)),
      );
      setEncounterChannel(id, encounterData.name || "Unnamed Encounter");

      // Seed refs so the change-detection effect doesn't fire dirty on first render
      prevEncounterNameRef.current = encounterData.name || "Unnamed Encounter";
      prevSelectedNpcsRef.current = JSON.parse(
        JSON.stringify(encounterData.selectedNPCs || []),
      );
      prevSelectedPCsRef.current = JSON.parse(
        JSON.stringify(encounterData.selectedPCs || []),
      );
      prevRoundRef.current = encounterData.round;
      prevClocksRef.current = JSON.parse(
        JSON.stringify(encounterData.clocks || []),
      );
      prevNotesRef.current = JSON.parse(
        JSON.stringify(encounterData.notes || []),
      );
      prevCombatActiveRef.current = encounterData.combatActive ?? false;
      prevInitiativeRef.current = encounterData.initiative ?? "players";
      prevCurrentTurnRef.current = encounterData.currentTurn ?? "players";
      prevActiveTurnRef.current = encounterData.activeTurn ?? null;

      setInitialized(true);
      setLoading(false);
    } else if (!encounterData && !loadingEncounter && !initialized) {
      setLoading(false);
    }
  }, [encounterData, initialized, loadingEncounter, user.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave setup (Debounced)
  const debouncedAutoSave = useMemo(
    () =>
      debounce((encounterToSave) => {
        if (!isDifferentUser && autosaveEnabled) {
          handleSaveStateRef.current(true, encounterToSave);
        }
      }, AUTO_SAVE_DELAY),
    [AUTO_SAVE_DELAY, isDifferentUser, autosaveEnabled],
  );

  // Effect to track changes and trigger debounced autosave
  useEffect(() => {
    if (initialized && !isDifferentUser) {
      const currentEncounter = {
        name: encounterName,
        selectedNPCs,
        selectedPCs,
        round: encounter?.round,
        clocks: encounterClocks,
        notes: encounterNotes,
        combatActive,
        initiative,
        currentTurn,
        activeTurn,
      };

      const hasChanged =
        encounterName !== prevEncounterNameRef.current ||
        !deepEqual(selectedNPCs, prevSelectedNpcsRef.current) ||
        !deepEqual(selectedPCs, prevSelectedPCsRef.current) ||
        encounter?.round !== prevRoundRef.current ||
        !deepEqual(encounterClocks, prevClocksRef.current) ||
        !deepEqual(encounterNotes, prevNotesRef.current) ||
        combatActive !== prevCombatActiveRef.current ||
        initiative !== prevInitiativeRef.current ||
        currentTurn !== prevCurrentTurnRef.current ||
        !deepEqual(activeTurn, prevActiveTurnRef.current) ||
        useEncounterChatStore.getState().isDirty;

      if (hasChanged) {
        setIsDirty(true);
        debouncedAutoSave(currentEncounter);
      }
    }
  }, [
    initialized,
    encounterName,
    selectedNPCs,
    selectedPCs,
    encounter?.round,
    encounterClocks,
    encounterNotes,
    combatActive,
    initiative,
    currentTurn,
    activeTurn,
    isDifferentUser,
    debouncedAutoSave,
    setIsDirty,
  ]);

  // Update refs to track the previous state
  useEffect(() => {
    prevEncounterNameRef.current = encounterName;
    prevSelectedNpcsRef.current = JSON.parse(JSON.stringify(selectedNPCs));
    prevSelectedPCsRef.current = JSON.parse(JSON.stringify(selectedPCs));
    prevRoundRef.current = encounter?.round;
    prevClocksRef.current = JSON.parse(JSON.stringify(encounterClocks));
    prevNotesRef.current = JSON.parse(JSON.stringify(encounterNotes));
    prevCombatActiveRef.current = combatActive;
    prevInitiativeRef.current = initiative;
    prevCurrentTurnRef.current = currentTurn;
    prevActiveTurnRef.current = activeTurn;
  }, [
    encounterName,
    selectedNPCs,
    selectedPCs,
    encounter?.round,
    encounterClocks,
    encounterNotes,
    combatActive,
    initiative,
    currentTurn,
    activeTurn,
  ]);

  // Deep comparison helper for state tracking
  function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  // Handle Save state to the database
  const handleSaveState = async (isAuto = false, encounterToSave = null) => {
    if (isDifferentUser) return;

    const saveTime = Date.now();
    const chatMsgs = useEncounterChatStore.getState().messages;
    const baseData = encounterToSave || {
      name: encounterName,
      selectedNPCs,
      selectedPCs,
      round: encounter.round,
      clocks: encounterClocks,
      notes: encounterNotes,
      combatActive,
      initiative,
      currentTurn,
      activeTurn,
    };
    const dataToSave = { ...baseData, chatMessages: chatMsgs };

    try {
      await db.setDoc(db.doc("encounters", id), {
        ...(encounter ?? {}),
        ...dataToSave,
        [isAuto ? "lastAutoSaved" : "lastSaved"]: saveTime,
      });

      if (isAuto) {
        setLastAutoSaved(saveTime);
      } else {
        setLastSaved(saveTime);
        setIsSaveSnackbarOpen(true);
      }
      setIsDirty(false);
      useEncounterChatStore.getState().markClean();
    } catch (error) {
      console.error("Error saving encounter:", error);
    }
  };
  handleSaveStateRef.current = handleSaveState;

  // Human-readable time since last save
  const [timeAgo, setTimeAgo] = useState("");
  useEffect(() => {
    const updateRelativeTime = () => {
      const lastSave = lastSaved || lastAutoSaved;
      if (lastSave) {
        const seconds = Math.floor((Date.now() - lastSave) / 1000);
        if (seconds < 60) setTimeAgo(t("combat_sim_last_saved_just_now"));
        else if (seconds < 3600)
          setTimeAgo(
            t("combat_sim_last_saved_minutes_ago", Math.floor(seconds / 60)),
          );
        else
          setTimeAgo(
            t("combat_sim_last_saved_hours_ago", Math.floor(seconds / 3600)),
          );
      }
    };
    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000);
    return () => clearInterval(interval);
  }, [lastSaved, lastAutoSaved]);

  const addGlobalMessage = useChatMessagesStore((s) => s.addMessage);

  // Always route combat messages to the encounter channel when one is loaded,
  // regardless of which channel the user is currently viewing.
  const addMessage = useCallback(
    (message) => {
      const encId = useEncounterChatStore.getState().encounterId;
      if (encId) {
        addEncounterChatMessage({
          ...message,
          channelId: `encounter:${encId}`,
        });
      } else {
        addGlobalMessage(message);
      }
    },
    [addEncounterChatMessage, addGlobalMessage],
  );

  // Thin wrapper that reads settings fresh and posts to encounterChatStore
  const emitLog = useCallback(
    (event) => {
      const settings = useCombatSimSettingsStore.getState().settings;
      emitCombatLog(event, settings, addEncounterChatMessage, id);
    },
    [addEncounterChatMessage, id],
  );

  // Handle Encounter Name Change
  const handleEncounterNameChange = (e) => {
    setEncounterName(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (encounterName !== encounter.name) {
      emitLog({ type: "encounter-renamed", newName: encounterName });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      handleBlur();
    }
  };

  // Handle Increase/Decrease Round
  const handleIncreaseRound = () => {
    setSelectedNPCs((prev) =>
      prev.map((npc) => ({
        ...npc,
        combatStats: {
          ...npc.combatStats,
          turns: npc.combatStats.turns
            ? npc.combatStats.turns.map(() => false)
            : [],
        },
      })),
    );
    setSelectedPCs((prev) =>
      prev.map((pc) => ({
        ...pc,
        combatStats: { ...pc.combatStats, turns: [false] },
      })),
    );
    if (combatActive) {
      setCurrentTurn(initiative);
      setActiveTurn(null);
    }
    setEncounter((prev) => ({ ...prev, round: prev.round + 1 }));
    emitLog({
      type: "round-change",
      round: encounter.round + 1,
      direction: "up",
    });
  };

  const handleDecreaseRound = () => {
    if (encounter.round > 1) {
      setEncounter((prev) => ({ ...prev, round: prev.round - 1 }));
      emitLog({
        type: "round-change",
        round: encounter.round - 1,
        direction: "down",
      });
    }
  };

  // Handle Reset Turns
  const handleResetTurns = () => {
    // Reset the turns for each selected NPC
    setSelectedNPCs((prev) =>
      prev.map((npc) => ({
        ...npc,
        combatStats: {
          ...npc.combatStats,
          turns: npc.combatStats.turns
            ? npc.combatStats.turns.map(() => false)
            : [],
        },
      })),
    );

    // Reset the turns for each selected PC
    setSelectedPCs((prev) =>
      prev.map((pc) => ({
        ...pc,
        combatStats: { ...pc.combatStats, turns: [false] },
      })),
    );

    // Increment the round and reset turn to initiative winner
    setEncounter((prev) => ({ ...prev, round: prev.round + 1 }));
    if (combatActive) {
      setCurrentTurn(initiative);
      setActiveTurn(null);
    }

    emitLog({
      type: "round-change",
      round: (encounter?.round || 0) + 1,
      direction: "new",
    });
  };

  // Handle Update NPC Turns
  const handleStartActorTurn = (combatId, turnIndex, faction) => {
    if (activeTurn) return; // another turn already in progress
    setActiveTurn({ combatId, turnIndex, faction });
  };

  const handleEndActorTurn = (combatId, turnIndex, faction, isNpc) => {
    setActiveTurn(null);
    if (isNpc) {
      const nextNPCs = selectedNPCs.map((n) => {
        if (n.combatId !== combatId) return n;
        const newTurns = [...(n.combatStats?.turns ?? [])];
        newTurns[turnIndex] = true;
        return { ...n, combatStats: { ...n.combatStats, turns: newTurns } };
      });
      setSelectedNPCs(nextNPCs);
      {
        const npc = selectedNPCs.find((n) => n.combatId === combatId);
        if (npc) {
          emitLog({ type: "turn-checked", actorName: npc.name });
        }
      }
      setCurrentTurn(determineNextTurn("npcs", nextNPCs, selectedPCs));
    } else {
      const nextPCs = selectedPCs.map((p) => {
        if (p.combatId !== combatId) return p;
        const newTurns = [...(p.combatStats?.turns ?? [])];
        newTurns[turnIndex] = true;
        return { ...p, combatStats: { ...p.combatStats, turns: newTurns } };
      });
      setSelectedPCs(nextPCs);
      {
        const pc = selectedPCs.find((p) => p.combatId === combatId);
        if (pc) {
          emitLog({ type: "turn-checked", actorName: pc.name });
        }
      }
      setCurrentTurn(determineNextTurn("players", selectedNPCs, nextPCs));
    }
  };

  // After a turn is taken, flip currentTurn to the other faction if they still have turns left.
  // nextNpcs/nextPCs are the up-to-date arrays (state setters are async).
  const determineNextTurn = (lastFaction, nextNPCs, nextPCs) => {
    const other = lastFaction === "npcs" ? "players" : "npcs";
    const otherHasTurns =
      other === "npcs"
        ? nextNPCs.some((n) => n.combatStats?.turns?.some((t) => !t))
        : nextPCs.some((p) => p.combatStats?.turns?.some((t) => !t));
    const sameHasTurns =
      lastFaction === "npcs"
        ? nextNPCs.some((n) => n.combatStats?.turns?.some((t) => !t))
        : nextPCs.some((p) => p.combatStats?.turns?.some((t) => !t));
    if (otherHasTurns) return other;
    if (sameHasTurns) return lastFaction;
    return lastFaction; // all turns exhausted, round over
  };

  const handleUpdateNpcTurns = (combatId, newTurns) => {
    const npc = selectedNPCs.find((npc) => npc.combatId === combatId);
    const oldTurns = npc?.combatStats?.turns || [];
    const oldTurnsCount = oldTurns.filter((t) => t).length;
    const newTurnsCount = newTurns.filter((t) => t).length;
    const turnWasTaken = newTurnsCount > oldTurnsCount;

    const nextNPCs = selectedNPCs.map((n) =>
      n.combatId === combatId
        ? { ...n, combatStats: { ...n.combatStats, turns: newTurns } }
        : n,
    );
    setSelectedNPCs(nextNPCs);

    if (npc && turnWasTaken) {
      emitLog({ type: "turn-checked", actorName: npc.name });
      if (combatActive) {
        setCurrentTurn(determineNextTurn("npcs", nextNPCs, selectedPCs));
      }
    }
  };

  // Handle Turns Popover open
  const handlePopoverOpen = (event, npcId) => {
    setAnchorEl(event.currentTarget);
    setPopoverNpcId(npcId);
  };

  // Handle Turns Popover close
  const handlePopoverClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
    setPopoverNpcId(null);
  };

  // Determine number of turns based on rank
  const getTurnCount = useCallback((rank) => {
    if (rank === "soldier" || rank === "champion1" || !rank) return 1;
    if (rank === "elite") return 2;
    const match = rank.match(/champion(\d)/);
    return match ? parseInt(match[1], 10) : 1;
  }, []);

  // Handle Select NPC from the list of available NPCs
  const handleSelectNPC = useCallback(
    async (npcId) => {
      if (selectedNPCs.length < 30) {
        const npc = await getNpc(npcId); // Fetch full NPC data using getNpc
        if (!npc) return;
        const normalizedNpc = applyNpcPostLoadTransforms(npc);

        // Calculate Ultima value only if the NPC is a villain
        let ultimaValue = null;
        if (normalizedNpc.villain) {
          ultimaValue = villainUltimaMax(normalizedNpc.villain);
        }

        // Create combatStats object and conditionally add ultima
        const combatStats = {
          notes: "",
          currentHp: calcHP(normalizedNpc),
          maxHp: calcHP(normalizedNpc),
          currentMp: calcMP(normalizedNpc),
          maxMp: calcMP(normalizedNpc),
          turns: new Array(getTurnCount(normalizedNpc.rank)).fill(false),
          statusEffects: [],
          combatNotes: "",
          ...(ultimaValue !== null && { ultima: ultimaValue }),
        };

        setSelectedNPCs((prev) => [
          ...prev,
          {
            ...normalizedNpc,
            id: npcId,
            sourceDocId: npcId,
            sourceCollection: "npc-personal",
            combatId: `${npcId}-${Date.now()}`,
            combatStats: combatStats,
          },
        ]);

        emitLog({ type: "actor-added", name: normalizedNpc.name });
      } else if (window.electron) {
        window.electron.alert(t("combat_sim_too_many_npcs"));
      } else {
        alert(t("combat_sim_too_many_npcs"));
      }
    },
    [selectedNPCs.length, getNpc, getTurnCount, emitLog],
  );

  // Handle Select PC from the player list
  const handleSelectPC = useCallback(
    (player) => {
      if (selectedNPCs.length + selectedPCs.length < 30) {
        const normalizedPlayer = applyPlayerPostLoadTransforms(player);
        setSelectedPCs((prev) => [
          ...prev,
          {
            ...normalizedPlayer,
            id: player.id,
            sourceDocId: player.id,
            sourceCollection: "player-personal",
            combatId: `${player.id}-${Date.now()}`,
            combatStats: {
              currentHp: normalizedPlayer.stats?.hp?.max ?? 0,
              maxHp: normalizedPlayer.stats?.hp?.max ?? 0,
              currentMp: normalizedPlayer.stats?.mp?.max ?? 0,
              maxMp: normalizedPlayer.stats?.mp?.max ?? 0,
              turns: [false],
              statusEffects: [],
              combatNotes: "",
            },
          },
        ]);

        emitLog({ type: "actor-added", name: normalizedPlayer.name });
      }
    },
    [selectedNPCs.length, selectedPCs.length, emitLog],
  );

  useEffect(() => {
    if (isDifferentUser) {
      clearActorSelectPanelData();
      return;
    }
    setActorSelectPanelData({
      npcList,
      playerList,
      loadingNpcs,
      loadingPlayers,
      handleSelectNPC,
      handleSelectPC,
    });
  }, [
    npcList,
    playerList,
    loadingNpcs,
    loadingPlayers,
    handleSelectNPC,
    handleSelectPC,
    isDifferentUser,
    clearActorSelectPanelData,
    setActorSelectPanelData,
  ]);

  useEffect(
    () => () => clearActorSelectPanelData(),
    [clearActorSelectPanelData],
  );

  // Handle Remove PC from the selected PCs list
  const handleRemovePC = async (pcCombatId) => {
    if (askBeforeRemoveNpc) {
      const confirmRemove = await globalConfirm(
        t("combat_sim_remove_npc_confirm"),
      );
      if (!confirmRemove) return;
    }
    const pcToRemove = selectedPCs.find((pc) => pc.combatId === pcCombatId);
    setSelectedPCs((prev) => prev.filter((pc) => pc.combatId !== pcCombatId));
    if (selectedPC?.combatId === pcCombatId) {
      setSelectedPC(null);
    }

    if (pcToRemove) {
      emitLog({ type: "actor-removed", name: pcToRemove.name });
    }
  };

  // Handle PC click in the selected PCs list
  const handlePcClick = (pcCombatId) => {
    const pc = selectedPCs.find((pc) => pc.combatId === pcCombatId);
    setSelectedPC(pc);
    setSelectedNPC(null);
    setActiveActorName(pc?.name ?? null);
  };

  // Handle Update PC Turns
  const handleUpdatePcTurns = (combatId, newTurns) => {
    const pc = selectedPCs.find((p) => p.combatId === combatId);
    const oldTurns = pc?.combatStats?.turns || [];
    const oldTurnsCount = oldTurns.filter((t) => t).length;
    const newTurnsCount = newTurns.filter((t) => t).length;
    const turnWasTaken = newTurnsCount > oldTurnsCount;

    const nextPCs = selectedPCs.map((p) =>
      p.combatId === combatId
        ? { ...p, combatStats: { ...p.combatStats, turns: newTurns } }
        : p,
    );
    setSelectedPCs(nextPCs);

    if (pc && turnWasTaken) {
      emitLog({ type: "turn-checked", actorName: pc.name });
      if (combatActive) {
        setCurrentTurn(determineNextTurn("players", selectedNPCs, nextPCs));
      }
    }
  };

  // Handle Remove NPC from the selected NPCs list
  const handleRemoveNPC = async (npcCombatId, isAutoRemove = false) => {
    if (askBeforeRemoveNpc && !isAutoRemove) {
      const confirmRemove = await globalConfirm(
        t("combat_sim_remove_npc_confirm"),
      );
      if (!confirmRemove) return;
    }

    const npcToRemove = selectedNPCs.find(
      (npc) => npc.combatId === npcCombatId,
    );
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId),
    );
    // if selectedNPC is the one removed, set selectedNPC to null
    if (selectedNPC?.combatId === npcCombatId) {
      setSelectedNPC(null);
    }

    if (npcToRemove) {
      emitLog({ type: "actor-removed", name: npcToRemove.name });
    }
  };

  // Handle Move Up in the selected NPCs list
  const handleMoveUp = (npcCombatId) => {
    const index = selectedNPCs.findIndex((npc) => npc.combatId === npcCombatId);
    if (index > 0) {
      const updatedNPCs = [...selectedNPCs];
      const [movedNpc] = updatedNPCs.splice(index, 1);
      updatedNPCs.splice(index - 1, 0, movedNpc);
      setSelectedNPCs(updatedNPCs);
    }
  };

  // Handle Move Down in the selected NPCs list
  const handleMoveDown = (npcCombatId) => {
    const index = selectedNPCs.findIndex((npc) => npc.combatId === npcCombatId);
    if (index < selectedNPCs.length - 1) {
      const updatedNPCs = [...selectedNPCs];
      const [movedNpc] = updatedNPCs.splice(index, 1);
      updatedNPCs.splice(index + 1, 0, movedNpc);
      setSelectedNPCs(updatedNPCs);
    }
  };

  const handlePcMoveUp = (pcCombatId) => {
    const index = selectedPCs.findIndex((pc) => pc.combatId === pcCombatId);
    if (index > 0) {
      const updated = [...selectedPCs];
      const [moved] = updated.splice(index, 1);
      updated.splice(index - 1, 0, moved);
      setSelectedPCs(updated);
    }
  };

  const handlePcMoveDown = (pcCombatId) => {
    const index = selectedPCs.findIndex((pc) => pc.combatId === pcCombatId);
    if (index < selectedPCs.length - 1) {
      const updated = [...selectedPCs];
      const [moved] = updated.splice(index, 1);
      updated.splice(index + 1, 0, moved);
      setSelectedPCs(updated);
    }
  };

  const handleSortEnd = (sortedNPCs) => {
    setSelectedNPCs(sortedNPCs);
  };

  const handlePcSortEnd = (sortedPCs) => {
    setSelectedPCs(sortedPCs);
  };

  // Handle NPC Click in the selected NPCs list
  const handleNpcClick = (npcCombatId) => {
    const npc = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    setSelectedNPC(npc);
    setSelectedPC(null);
    setSelectedStudy(0);
    setActiveActorName(npc?.name ?? null);
  };

  // Handle Study Change
  const handleStudyChange = (event) => {
    setSelectedStudy(event.target.value);
  };

  // Handle Open HP/MP Dialog
  const handleOpen = (type, entity, entityType = "npc") => {
    setStatType(type);
    setValue("");
    setDamageType("");
    setIsGuarding(false);
    setIsIgnoreResistance(false);
    setIsIgnoreImmunity(false);
    setOpen(true);
    setNpcClicked(entity);
    setClickedEntityType(entityType);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle Close HP/MP Dialog
  const handleClose = () => {
    setOpen(false);
    setNpcClicked(null);
    setIsHealing(false);
  };

  // Handle Confirm HP/MP Dialog
  const handleConfirm = () => {
    let adjustedValue = 0;

    if (clickedEntityType === "pc") {
      // PCs: no affinity calculation
      adjustedValue = isHealing ? Number(value) : -Number(value);
      const maxHP = npcClicked.stats?.hp?.max ?? 0;
      const maxMP = npcClicked.stats?.mp?.max ?? 0;
      const maxIP = npcClicked.stats?.ip?.max ?? 0;
      const actorName = npcClicked.name;
      const projectedHp =
        npcClicked.combatStats.currentHp +
        (statType === "HP" ? adjustedValue : 0);

      setSelectedPCs((prev) =>
        prev.map((pc) => {
          if (pc.combatId !== npcClicked.combatId) return pc;
          const newHp = Math.min(
            Math.max(
              pc.combatStats.currentHp +
                (statType === "HP" ? adjustedValue : 0),
              0,
            ),
            maxHP,
          );
          const newMp = Math.min(
            Math.max(
              pc.combatStats.currentMp +
                (statType === "MP" ? adjustedValue : 0),
              0,
            ),
            maxMP,
          );
          const newIp = Math.min(
            Math.max(
              (pc.combatStats.currentIp ?? pc.stats?.ip?.current ?? 0) +
                (statType === "IP" ? adjustedValue : 0),
              0,
            ),
            maxIP,
          );
          const newFp = Math.max(
            (pc.combatStats.currentFp ?? pc.info?.fabulapoints ?? 0) +
              (statType === "FP" ? adjustedValue : 0),
            0,
          );
          return {
            ...pc,
            combatStats: {
              ...pc.combatStats,
              currentHp: statType === "HP" ? newHp : pc.combatStats.currentHp,
              currentMp: statType === "MP" ? newMp : pc.combatStats.currentMp,
              currentIp: statType === "IP" ? newIp : pc.combatStats.currentIp,
              currentFp: statType === "FP" ? newFp : pc.combatStats.currentFp,
            },
          };
        }),
      );

      if (selectedPC && selectedPC.combatId === npcClicked.combatId) {
        const newHp = Math.min(
          Math.max(
            selectedPC.combatStats.currentHp +
              (statType === "HP" ? adjustedValue : 0),
            0,
          ),
          maxHP,
        );
        const newMp = Math.min(
          Math.max(
            selectedPC.combatStats.currentMp +
              (statType === "MP" ? adjustedValue : 0),
            0,
          ),
          maxMP,
        );
        const newIp = Math.min(
          Math.max(
            (selectedPC.combatStats.currentIp ??
              selectedPC.stats?.ip?.current ??
              0) + (statType === "IP" ? adjustedValue : 0),
            0,
          ),
          maxIP,
        );
        const newFp = Math.max(
          (selectedPC.combatStats.currentFp ??
            selectedPC.info?.fabulapoints ??
            0) + (statType === "FP" ? adjustedValue : 0),
          0,
        );
        setSelectedPC({
          ...selectedPC,
          combatStats: {
            ...selectedPC.combatStats,
            currentHp:
              statType === "HP" ? newHp : selectedPC.combatStats.currentHp,
            currentMp:
              statType === "MP" ? newMp : selectedPC.combatStats.currentMp,
            currentIp:
              statType === "IP" ? newIp : selectedPC.combatStats.currentIp,
            currentFp:
              statType === "FP" ? newFp : selectedPC.combatStats.currentFp,
          },
        });
      }

      if (adjustedValue < 0 && statType === "HP") {
        emitLog({
          type: "damage",
          actorName: "GM",
          targetName: actorName,
          amount: Math.abs(adjustedValue),
          damageType: damageType || "untyped",
        });
      } else if (adjustedValue < 0) {
        emitLog({
          type: "resource-loss",
          actorName: "GM",
          targetName: actorName,
          amount: Math.abs(adjustedValue),
          resource: statType.toLowerCase(),
        });
      } else if (adjustedValue > 0) {
        emitLog({
          type: "heal",
          actorName: "GM",
          targetName: actorName,
          amount: Math.abs(adjustedValue),
          resource: statType.toLowerCase(),
        });
      }

      if (projectedHp <= 0) {
        setTimeout(() => {
          emitLog({ type: "fainted", targetName: actorName });
        }, 200);
      }

      handleClose();
      return;
    }

    // NPC path
    if (!isHealing && statType === "HP") {
      const dmgCtx = buildDamageContext({
        baseDamage: Number(value) || 0,
        damageType: damageType || "untyped",
        npcAffinities: npcClicked.affinities || {},
        temporaryAffinities: npcClicked.runtimeActor?.temporaryAffinities,
        isGuarding,
        incomingDamageBonuses: getActorBonuses(npcClicked).incomingDamage,
      });
      adjustedValue = -resolveDamage(dmgCtx).finalDamage;
    } else {
      adjustedValue = isHealing ? Number(value) : -Number(value);
    }

    const updatedNPCs = selectedNPCs.map((npc) => {
      if (npc.combatId === npcClicked.combatId) {
        const maxHP = calcHP(npcClicked);
        const maxMP = calcMP(npcClicked);
        const maxIP = npcClicked.stats?.ip?.max ?? 0;
        const maxFP = npcClicked.combatStats?.maxFp ?? 6;
        const newHp = Math.min(
          Math.max(
            npc.combatStats.currentHp + (statType === "HP" ? adjustedValue : 0),
            0,
          ),
          maxHP,
        );
        const newMp = Math.min(
          Math.max(
            npc.combatStats.currentMp + (statType === "MP" ? adjustedValue : 0),
            0,
          ),
          maxMP,
        );
        const newIp = Math.min(
          Math.max(
            (npc.combatStats.currentIp ?? 0) +
              (statType === "IP" ? adjustedValue : 0),
            0,
          ),
          maxIP,
        );
        const newFp = Math.min(
          Math.max(
            (npc.combatStats.currentFp ?? 0) +
              (statType === "FP" ? adjustedValue : 0),
            0,
          ),
          maxFP,
        );
        const newUp = Math.min(
          Math.max(
            (npc.combatStats.ultima ?? 0) +
              (statType === "UP" ? adjustedValue : 0),
            0,
          ),
          villainUltimaMax(npc.villain),
        );

        return {
          ...npc,
          combatStats: {
            ...npc.combatStats,
            currentHp: statType === "HP" ? newHp : npc.combatStats.currentHp,
            currentMp: statType === "MP" ? newMp : npc.combatStats.currentMp,
            currentIp: statType === "IP" ? newIp : npc.combatStats.currentIp,
            currentFp: statType === "FP" ? newFp : npc.combatStats.currentFp,
            ultima: statType === "UP" ? newUp : npc.combatStats.ultima,
          },
        };
      }
      return npc;
    });

    setSelectedNPCs(updatedNPCs);

    if (selectedNPC && selectedNPC.combatId === npcClicked.combatId) {
      const maxHP = calcHP(npcClicked);
      const maxMP = calcMP(npcClicked);
      const maxIP = npcClicked.stats?.ip?.max ?? 0;
      const maxFP = npcClicked.combatStats?.maxFp ?? 6;
      const newHp = Math.min(
        Math.max(
          npcClicked.combatStats.currentHp +
            (statType === "HP" ? adjustedValue : 0),
          0,
        ),
        maxHP,
      );
      const newMp = Math.min(
        Math.max(
          npcClicked.combatStats.currentMp +
            (statType === "MP" ? adjustedValue : 0),
          0,
        ),
        maxMP,
      );
      const newIp = Math.min(
        Math.max(
          (npcClicked.combatStats.currentIp ?? 0) +
            (statType === "IP" ? adjustedValue : 0),
          0,
        ),
        maxIP,
      );
      const newFp = Math.min(
        Math.max(
          (npcClicked.combatStats.currentFp ?? 0) +
            (statType === "FP" ? adjustedValue : 0),
          0,
        ),
        maxFP,
      );
      const newUp = Math.min(
        Math.max(
          (npcClicked.combatStats.ultima ?? 0) +
            (statType === "UP" ? adjustedValue : 0),
          0,
        ),
        villainUltimaMax(npcClicked.villain),
      );

      setSelectedNPC({
        ...selectedNPC,
        combatStats: {
          ...selectedNPC.combatStats,
          currentHp:
            statType === "HP" ? newHp : selectedNPC.combatStats.currentHp,
          currentMp:
            statType === "MP" ? newMp : selectedNPC.combatStats.currentMp,
          currentIp:
            statType === "IP" ? newIp : selectedNPC.combatStats.currentIp,
          currentFp:
            statType === "FP" ? newFp : selectedNPC.combatStats.currentFp,
          ultima: statType === "UP" ? newUp : selectedNPC.combatStats.ultima,
        },
      });
    }

    handleClose();

    // log for damage/heal/resource
    if (adjustedValue < 0 && statType === "HP") {
      emitLog({
        type: "damage",
        actorName: "GM",
        targetName: npcClicked.name,
        amount: Math.abs(adjustedValue),
        damageType: damageType || "untyped",
      });
    } else if (adjustedValue < 0) {
      emitLog({
        type: "resource-loss",
        actorName: "GM",
        targetName: npcClicked.name,
        amount: Math.abs(adjustedValue),
        resource: statType.toLowerCase(),
      });
    } else if (adjustedValue > 0) {
      emitLog({
        type: "heal",
        actorName: "GM",
        targetName: npcClicked.name,
        amount: Math.abs(adjustedValue),
        resource: statType.toLowerCase(),
      });
    }

    // fainted
    if (
      npcClicked.combatStats.currentHp +
        (statType === "HP" ? adjustedValue : 0) <=
      0
    ) {
      setTimeout(() => {
        emitLog({ type: "fainted", targetName: npcClicked.name });
      }, 200);
      if (autoRemoveNPCFaint) {
        setTimeout(() => {
          handleRemoveNPC(npcClicked.combatId, true);
        }, 300);
      }
    }
  };

  // Handle Input Change in HP/MP Dialog
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  // Handle Submit in HP/MP Dialog
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value !== "") handleConfirm(isHealing ? Number(value) : -Number(value));
    else handleClose();
  };

  // Handle Status Effect Toggle
  const toggleStatusEffect = (npc, status) => {
    const updatedStatusEffects = [...(npc.combatStats?.statusEffects || [])];

    // Toggle the status effect (add if not present, remove if present)
    if (updatedStatusEffects.includes(status)) {
      const index = updatedStatusEffects.indexOf(status);
      updatedStatusEffects.splice(index, 1);
    } else {
      updatedStatusEffects.push(status);
    }

    // Update the NPC with the new status effects
    const updatedNPC = {
      ...npc,
      combatStats: {
        ...npc.combatStats,
        statusEffects: updatedStatusEffects,
      },
    };

    setSelectedNPC(updatedNPC);

    // Update data in the selectedNPCs list
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === updatedNPC.combatId ? updatedNPC : npc,
      ),
    );

    // Add log entry if status effect is added or removed
    if (updatedStatusEffects.includes(status)) {
      emitLog({ type: "status-added", targetName: npc.name, status });
    } else {
      emitLog({ type: "status-removed", targetName: npc.name, status });
    }
  };

  // Calculate Current Attribute Value based on Status Effects
  function calcAttr(statusEffect1, statusEffect2, attribute, npc) {
    // Define the base attribute value (e.g., dexterity)
    const rawAttr = npc?.attributes?.[attribute];
    let attributeValue =
      (rawAttr && typeof rawAttr === "object" ? rawAttr.base : rawAttr) || 6;

    // Check in npc.combatStats.statusEffects for the status effects
    if (npc.combatStats.statusEffects?.includes(statusEffect1)) {
      attributeValue -= 2;
    }
    if (npc.combatStats.statusEffects?.includes(statusEffect2)) {
      attributeValue -= 2;
    }

    // Ensure the attribute stays within the defined bounds
    attributeValue = Math.max(6, Math.min(12, attributeValue));

    return attributeValue;
  }

  // NPC Detail width resizing
  const handleMouseDown = (e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = npcDetailWidth;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;

    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(
      20, // Minimum width is 20%
      Math.min(50, startWidth.current - (deltaX / window.innerWidth) * 100),
    );
    setNpcDetailWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const checkNewTurn = (npcId) => {
    // Check if the NPC has any turns left, and if so activate the next available turn
    const npc = selectedNPCs.find((npc) => npc.combatId === npcId);
    if (npc) {
      const currentTurns = [...(npc.combatStats.turns || [])];

      // Find the index of the first unused turn
      const nextTurnIndex = currentTurns.findIndex((turn) => !turn);

      // If there's an unused turn, activate only that one
      if (nextTurnIndex !== -1) {
        const newTurns = [...currentTurns];
        newTurns[nextTurnIndex] = true;
        handleUpdateNpcTurns(npc.combatId, newTurns);
      }
    }
  };

  const handleEditNPC = () => {
    if (!selectedNPC) return;
    setNpcEditModalOpen(true);
  };

  const handleNpcEditSaved = (updatedNpc) => {
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              ...updatedNpc,
              combatId: npc.combatId,
              combatStats: npc.combatStats,
            }
          : npc,
      ),
    );
    setSelectedNPC((prev) =>
      prev
        ? {
            ...prev,
            ...updatedNpc,
            combatId: prev.combatId,
            combatStats: prev.combatStats,
          }
        : prev,
    );
  };

  const handleSaveClock = (newClock) => {
    setEncounterClocks([...encounterClocks, newClock]);
    emitLog({ type: "clock-added", clockName: newClock.name });
  };

  const handleUpdateClock = (index, newState) => {
    const updatedClocks = [...encounterClocks];
    updatedClocks[index] = {
      ...updatedClocks[index],
      state: newState,
    };
    setEncounterClocks(updatedClocks);
    emitLog({
      type: "clock-updated",
      clockName: updatedClocks[index].name,
      progress: newState.filter(Boolean).length,
      max: updatedClocks[index].sections,
    });
  };

  const handleRemoveClock = async (index) => {
    if (askBeforeRemoveClock) {
      const confirmRemove = await globalConfirm(
        t("combat_sim_remove_clock_confirm"),
      );
      if (!confirmRemove) return;
    }

    const clockName = encounterClocks[index].name;
    setEncounterClocks(encounterClocks.filter((_, i) => i !== index));
    emitLog({ type: "clock-removed", clockName });
  };

  const handleResetClock = (index) => {
    const updatedClocks = [...encounterClocks];
    updatedClocks[index] = {
      ...updatedClocks[index],
      state: new Array(updatedClocks[index].sections).fill(false),
    };
    setEncounterClocks(updatedClocks);
    emitLog({ type: "clock-reset", clockName: updatedClocks[index].name });
  };

  const handleNotesSave = (newNotes) => {
    setEncounterNotes(newNotes);
  };

  // During loading state
  if (loading || loadingEncounter) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // If encounter's uuid is different from user's uid and encounter is private, show error message
  if (isPrivate) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">
          {t("combat_sim_encounter_is_private")}
        </Typography>
      </Box>
    );
  }

  // If encounter is not found
  if (!encounter) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h5" color="error">
          {t("combat_sim_encounter_not_found")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: -2,
      }}
    >
      {/* Encounter Name, Save Button and Last Saved Time */}
      <BattleHeader
        encounterName={encounterName}
        isEditing={isEditing}
        handleEditClick={handleEditClick}
        handleEncounterNameChange={handleEncounterNameChange}
        handleBlur={handleBlur}
        handleKeyPress={handleKeyPress}
        handleSaveState={handleSaveState}
        timeAgo={timeAgo}
        round={encounter.round}
        handleIncreaseRound={handleIncreaseRound}
        handleDecreaseRound={handleDecreaseRound}
        combatActive={combatActive}
        onToggleCombat={() => {
          if (combatActive) {
            setCombatActive(false);
            setActiveTurn(null);
            setCurrentTurn("players");
            setInitiative("players");
            setSelectedNPCs((prev) =>
              prev.map((npc) => ({
                ...npc,
                combatStats: {
                  ...npc.combatStats,
                  turns: npc.combatStats.turns
                    ? npc.combatStats.turns.map(() => false)
                    : [],
                },
              })),
            );
            setSelectedPCs((prev) =>
              prev.map((pc) => ({
                ...pc,
                combatStats: { ...pc.combatStats, turns: [false] },
              })),
            );
            setEncounter((prev) => ({ ...prev, round: 1 }));
          } else {
            setInitiativeDialogOpen(true);
          }
        }}
        isMobile={isMobile}
        isDifferentUser={isDifferentUser}
        isAutoSaveEnabled={autosaveEnabled}
        lastManualSaved={lastSaved}
        lastAutoSaved={lastAutoSaved}
        isDirty={isDirty}
      />

      {/* Clock Management Dialog */}
      <CombatSimClocks
        open={clockDialogOpen}
        onClose={() => setClockDialogOpen(false)}
        clocks={encounterClocks}
        onSave={(newClock) => handleSaveClock(newClock)}
        onUpdate={(index, newState) => handleUpdateClock(index, newState)}
        onRemove={(index) => handleRemoveClock(index)}
        onReset={(index) => handleResetClock(index)}
        emitLog={emitLog}
      />

      {/* Main Columns: Selected NPCs + NPC/PC Sheet */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          height: isMobile ? "calc(100vh - 195px)" : "calc(100vh - 157px)",
        }}
      >
        <Box
          sx={{
            flex: 1,
            bgcolor: theme.palette.background.paper,
            padding: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Selected NPCs */}
          <SelectedActors
            selectedNPCs={selectedNPCs}
            handleResetTurns={handleResetTurns}
            handleMoveUp={handleMoveUp}
            handleMoveDown={handleMoveDown}
            handleRemoveNPC={handleRemoveNPC}
            handleUpdateNpcTurns={handleUpdateNpcTurns}
            handlePopoverOpen={handlePopoverOpen}
            handlePopoverClose={handlePopoverClose}
            anchorEl={anchorEl}
            popoverNpcId={popoverNpcId}
            getTurnCount={getTurnCount}
            handleNpcClick={handleNpcClick}
            handleHpMpClick={(type, npc) => handleOpen(type, npc, "npc")}
            isMobile={isMobile}
            selectedNpcID={selectedNPC?.combatId}
            isDifferentUser={isDifferentUser}
            useDragAndDrop={npcReorderingMethod === "dragAndDrop"}
            onSortEnd={handleSortEnd}
            onSortEndPC={handlePcSortEnd}
            onClockClick={() => setClockDialogOpen(true)}
            onNotesClick={() => setNotesDialogOpen(true)}
            onClearAll={() => {
              clearTargets();
              setSelectedNPC(null);
              setSelectedPC(null);
            }}
            selectedPCs={selectedPCs}
            handleRemovePC={handleRemovePC}
            handlePcMoveUp={handlePcMoveUp}
            handlePcMoveDown={handlePcMoveDown}
            handlePcClick={handlePcClick}
            handleHpMpClickPC={(type, pc) => handleOpen(type, pc, "pc")}
            handleUpdatePcTurns={handleUpdatePcTurns}
            selectedPcID={selectedPC?.combatId}
            combatActive={combatActive}
            initiative={initiative}
            currentTurn={currentTurn}
            activeTurn={activeTurn}
            onStartActorTurn={handleStartActorTurn}
            onEndActorTurn={handleEndActorTurn}
          />
        </Box>
        {/* Detail Resize Handle */}
        {(selectedNPC || selectedPC) && (
          <Box
            sx={{
              width: "5px",
              cursor: "ew-resize",
              backgroundColor: theme.palette.action.hover,
              "&:hover": { backgroundColor: theme.palette.action.selected },
              marginLeft: -1,
              marginRight: -2,
              p: "0 5px",
              borderRadius: "8px 0 0 8px",
              display: "flex", // Flexbox to center the icon
              justifyContent: "center", // Horizontally center the icon
              alignItems: "center", // Vertically center the icon
            }}
            onMouseDown={handleMouseDown}
          >
            <DragHandle
              fontSize="small"
              sx={{
                color: theme.palette.text.secondary,
                transform: "rotate(90deg)", // Rotate the icon by 90 degrees
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </Box>
        )}
        {/* NPC Detail */}
        {selectedNPC && (
          <NPCDetail
            selectedNPC={selectedNPC}
            setSelectedNPC={setSelectedNPC}
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            selectedStudy={selectedStudy}
            handleStudyChange={handleStudyChange}
            downloadImage={downloadImage}
            calcHP={calcHP}
            calcMP={calcMP}
            handleOpen={handleOpen}
            toggleStatusEffect={toggleStatusEffect}
            selectedNPCs={selectedNPCs}
            setSelectedNPCs={setSelectedNPCs}
            calcAttr={calcAttr}
            npcRef={null}
            isMobile={isMobile}
            emitLog={emitLog}
            addMessage={addMessage}
            npcDetailWidth={`${npcDetailWidth}%`}
            checkNewTurn={checkNewTurn}
            handleEditNPC={handleEditNPC}
          />
        )}
        {/* PC Detail */}
        {selectedPC && !selectedNPC && (
          <PCDetail
            selectedPC={selectedPC}
            setSelectedPC={setSelectedPC}
            npcDetailWidth={`${npcDetailWidth}%`}
            isMobile={isMobile}
            selectedPCs={selectedPCs}
            setSelectedPCs={setSelectedPCs}
            emitLog={emitLog}
            addMessage={addMessage}
            handleOpen={handleOpen}
            tabIndex={pcTabIndex}
            setTabIndex={setPcTabIndex}
          />
        )}
      </Box>
      <DamageHealDialog
        open={open}
        handleClose={handleClose}
        handleSubmit={(e) => handleSubmit(e)}
        handleChange={(e) => handleChange(e)}
        statType={statType}
        npcClicked={npcClicked}
        typesList={typesList}
        value={value}
        setValue={setValue}
        isHealing={isHealing}
        setIsHealing={setIsHealing}
        damageType={damageType}
        setDamageType={setDamageType}
        isGuarding={isGuarding}
        setIsGuarding={setIsGuarding}
        isIgnoreResistance={isIgnoreResistance}
        setIsIgnoreResistance={setIsIgnoreResistance}
        isIgnoreImmunity={isIgnoreImmunity}
        setIsIgnoreImmunity={setIsIgnoreImmunity}
        clickedEntityType={clickedEntityType}
        inputRef={inputRef}
      />
      {/* Notes Dialog */}
      <InitiativeDialog
        open={initiativeDialogOpen}
        pcCount={selectedPCs.length}
        npcCount={selectedNPCs.length}
        onConfirm={(won) => {
          setInitiative(won);
          setCurrentTurn(won);
          setInitiativeDialogOpen(false);
          setCombatActive(true);

          const allActors = [
            ...selectedNPCs.map((doc) => ({
              doc,
              runtime: runtimeActors[doc.combatId],
            })),
            ...selectedPCs.map((doc) => ({
              doc,
              runtime: runtimeActors[doc.combatId],
            })),
          ].filter((a) => a.runtime != null);

          const matches = scanForTrigger("combat-start", allActors);
          for (const { chatOutput } of fireTriggers(matches)) {
            if (!chatOutput) continue;
            addMessage({
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              speaker: chatOutput.speaker,
              kind: "display",
              itemType: chatOutput.itemType,
              name: chatOutput.itemName,
              tags: [],
              description: chatOutput.text,
            });
          }
        }}
        onCancel={() => setInitiativeDialogOpen(false)}
      />
      <GeneralNotesDialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        onSave={handleNotesSave}
        notes={encounterNotes}
        useDragAndDrop={noteReorderingMethod === "dragAndDrop"}
        maxNotesCount={5} // unlimited in desktop version
        maxNoteLength={500} // unlimited in desktop version
      />
      {/* Save Snackbar to inform user that it has been saved */}
      {showSaveSnackbar && (
        <Snackbar
          open={isSaveSnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setIsSaveSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={() => setIsSaveSnackbarOpen(false)}
            severity={"success"}
            sx={{ width: "100%" }}
          >
            {t("combat_sim_log_encounter_saved")}
          </Alert>
        </Snackbar>
      )}
      {downloadSnackbar}
      <NpcEditModal
        npcId={selectedNPC?.id}
        open={npcEditModalOpen}
        onClose={() => setNpcEditModalOpen(false)}
        onSaved={handleNpcEditSaved}
      />
    </Box>
  );
};
