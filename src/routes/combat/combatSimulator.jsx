import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
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
import SelectorPanel from "../../components/combatSim/SelectorPanel";
import PCDetail from "../../components/combatSim/PCDetail";
import { calcHP, calcMP } from "../../libs/npcs";
import SelectedNpcs from "../../components/combatSim/SelectedNpcs";
import useDownloadImage from "../../hooks/useDownloadImage";
import NPCDetail from "../../components/combatSim/NPCDetail";
import CombatSimClocks from "../../components/combatSim/CombatSimClocks";
import { typesList } from "../../libs/types";
import { t } from "../../translation/translate";
import DamageHealDialog from "../../components/combatSim/DamageHealDialog";
import CombatLog from "../../components/combatSim/CombatLog";
import { Cloud as CloudIcon, DragHandle } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { globalConfirm } from "../../utility/globalConfirm";
import { useNavigate } from "react-router-dom";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";
import GeneralNotesDialog from "../../components/combatSim/GeneralNotesDialog";
import { SignIn } from "../../components/auth";
import { useDatabaseContext } from "../../context/DatabaseContext";
import { useDatabase } from "../../hooks/useDatabase";

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
          sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap" }}
        >
          <CloudIcon color={dbMode === "cloud" ? "primary" : "disabled"} />
          <Typography variant="body2" color={dbMode === "cloud" ? "text.primary" : "text.secondary"} sx={{ flex: 1, minWidth: 200 }}>
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
  const isDarkMode = theme.palette.mode === "dark"; // Check if dark mode is enabled
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [initialized, setInitialized] = useState(false); // Initialized state
  const navigate = useNavigate();

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
    hideLogs,
    askBeforeRemoveNpc,
    autoRemoveNPCFaint,
    askBeforeRemoveClock,

    // Visible log types
    logClockAdded,
    logClockRemoved,
    logClockReset,
    logClockUpdate,
    logEncounterNameUpdated,
    logNewRound,
    logNpcAdded,
    logNpcDamage,
    logNpcDamageNoType,
    logNpcFainted,
    logNpcHeal,
    logNpcRemoved,
    logNpcUsedMp,
    logRoundDecrease,
    logRoundIncrease,
    logStatusEffectAdded,
    logStatusEffectRemoved,
    logTurnChecked,
    logUseUltimaPoint,
  } = useCombatSimSettingsStore.getState().settings;
  const AUTO_SAVE_DELAY = 1000 * (autosaveInterval ?? 30); // Delay for autosave, default 30 seconds

  // ========== Encounter States ==========
  const [encounter, setEncounter] = useState(null); // Current encounter
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
  const [npcDrawerOpen, setNpcDrawerOpen] = useState(false); // Selector Drawer open (mobile)
  const [lastSaved, setLastSaved] = useState(null); // Last saved time
  const [lastAutoSaved, setLastAutoSaved] = useState(null); // Last auto-saved time
  const [encounterNotes, setEncounterNotes] = useState([]); // Encounter notes

  // ========== UI Interaction States ==========
  const [npcDetailWidth, setNpcDetailWidth] = useState(30); // NPC detail width (%)
  const isResizing = useRef(false); // Resizing flag
  const startX = useRef(0);
  const startWidth = useRef(npcDetailWidth);
  const prevSelectedNpcsRef = useRef(null);
  const prevSelectedPCsRef = useRef(null);
  const prevRoundRef = useRef(null);
  const prevLogsRef = useRef(null);
  const prevEncounterNameRef = useRef(null);
  const prevClocksRef = useRef(null);
  const prevNotesRef = useRef(null);
  const [tabIndex, setTabIndex] = useState(0); // NPC sheet tab index
  const [selectedStudy, setSelectedStudy] = useState(0); // NPC study level
  const [isSaveSnackbarOpen, setIsSaveSnackbarOpen] = useState(false); // Save notification state
  const isDifferentUser = !isLocalMode && encounter?.uid !== user?.uid;
  const isPrivate = encounter?.private && isDifferentUser;
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  // ========== Log States ==========
  const [logs, setLogs] = useState([]);
  const [logOpen, setLogOpen] = useState(true);

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
  const getNpc = async (npcId) => {
    return db.getDoc(db.doc("npc-personal", npcId));
  };

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
      setSelectedNPCs(encounterData.selectedNPCs || []);
      setSelectedPCs(encounterData.selectedPCs || []);
      setLogs(encounterData.logs || []);
      setEncounterClocks(encounterData.clocks || []);
      setEncounterNotes(encounterData.notes || []);
      setLastSaved(encounterData.lastSaved);
      setLastAutoSaved(encounterData.lastAutoSaved);

      setInitialized(true);
      setLoading(false);
    } else if (!encounterData && !loadingEncounter && !initialized) {
      setLoading(false);
    }
  }, [encounterData, initialized, loadingEncounter, user.uid]);

  // Autosave setup (Debounced)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedAutoSave = useCallback(
    debounce((encounterToSave) => {
      if (!isDifferentUser && autosaveEnabled) {
        handleSaveState(true, encounterToSave);
      }
    }, AUTO_SAVE_DELAY),
    [isDifferentUser, autosaveEnabled, AUTO_SAVE_DELAY]
  );

  // Effect to track changes and trigger debounced autosave
  useEffect(() => {
    if (initialized && !isDifferentUser) {
      const currentEncounter = {
        name: encounterName,
        selectedNPCs,
        selectedPCs,
        round: encounter?.round,
        logs,
        clocks: encounterClocks,
        notes: encounterNotes,
      };

      const hasChanged =
        encounterName !== prevEncounterNameRef.current ||
        !deepEqual(selectedNPCs, prevSelectedNpcsRef.current) ||
        !deepEqual(selectedPCs, prevSelectedPCsRef.current) ||
        encounter?.round !== prevRoundRef.current ||
        !deepEqual(logs, prevLogsRef.current) ||
        !deepEqual(encounterClocks, prevClocksRef.current) ||
        !deepEqual(encounterNotes, prevNotesRef.current);

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
    logs,
    encounterClocks,
    encounterNotes,
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
    prevLogsRef.current = JSON.parse(JSON.stringify(logs));
    prevClocksRef.current = JSON.parse(JSON.stringify(encounterClocks));
    prevNotesRef.current = JSON.parse(JSON.stringify(encounterNotes));
  }, [
    encounterName,
    selectedNPCs,
    selectedPCs,
    encounter?.round,
    logs,
    encounterClocks,
    encounterNotes,
  ]);

  // Deep comparison helper for state tracking
  function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  // Handle Save state to the database
  const handleSaveState = async (isAuto = false, encounterToSave = null) => {
    if (isDifferentUser) return;

    const saveTime = Date.now();
    const dataToSave = encounterToSave || {
      name: encounterName,
      selectedNPCs,
      selectedPCs,
      round: encounter.round,
      logs,
      clocks: encounterClocks,
      notes: encounterNotes,
    };

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
    } catch (error) {
      console.error("Error saving encounter:", error);
    }
  };

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
            t("combat_sim_last_saved_minutes_ago", Math.floor(seconds / 60))
          );
        else
          setTimeAgo(
            t("combat_sim_last_saved_hours_ago", Math.floor(seconds / 3600))
          );
      }
    };
    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000);
    return () => clearInterval(interval);
  }, [lastSaved, lastAutoSaved]);

  // Handle Log state
  const addLog = (message, name, value, status) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      name,
      value,
      status,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleLogToggle = () => {
    setLogOpen(!logOpen);
  };

  // Handle Encounter Name Change
  const handleEncounterNameChange = (e) => {
    setEncounterName(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (logEncounterNameUpdated && encounterName !== encounter.name) {
      addLog("combat_sim_log_encounter_name_updated", encounterName);
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
    setEncounter((prev) => ({ ...prev, round: prev.round + 1 }));
    if (logRoundIncrease) {
      addLog("combat_sim_log_round_increase", encounter.round + 1);
    }
  };

  const handleDecreaseRound = () => {
    if (encounter.round > 1) {
      setEncounter((prev) => ({ ...prev, round: prev.round - 1 }));
      if (logRoundDecrease) {
        addLog("combat_sim_log_round_decrease", encounter.round - 1);
      }
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
          turns: npc.combatStats.turns ? npc.combatStats.turns.map(() => false) : [],
        },
      }))
    );

    // Reset the turns for each selected PC
    setSelectedPCs((prev) =>
      prev.map((pc) => ({
        ...pc,
        combatStats: { ...pc.combatStats, turns: [false] },
      }))
    );

    // Increment the round
    setEncounter((prev) => ({ ...prev, round: prev.round + 1 }));

    if (logNewRound) {
      // Add log entry
      addLog("combat_sim_log_new_round", (encounter?.round || 0) + 1);
    }
  };

  // Handle Update NPC Turns
  const handleUpdateNpcTurns = (combatId, newTurns) => {
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === combatId
          ? { ...npc, combatStats: { ...npc.combatStats, turns: newTurns } }
          : npc
      )
    );

    // Add log entry if new turns have been checked so oldTurns < newTurns
    const npc = selectedNPCs.find((npc) => npc.combatId === combatId);
    if (npc) {
      const oldTurns = npc.combatStats.turns || [];
      const newTurnsCount = newTurns.filter((turn) => turn).length;
      const oldTurnsCount = oldTurns.filter((turn) => turn).length;
      if (newTurnsCount > oldTurnsCount) {
        if (logTurnChecked) {
          addLog(
            "combat_sim_log_turn_checked",
            npc.name +
              (npc?.combatStats?.combatNotes
                ? "【" + npc.combatStats.combatNotes + "】"
                : ""),
            newTurnsCount
          );
        }
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
  const getTurnCount = (rank) => {
    if (rank === "soldier" || rank === "champion1" || !rank) return 1;
    if (rank === "elite") return 2;
    const match = rank.match(/champion(\d)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  // Handle Select NPC from the list of available NPCs
  const handleSelectNPC = async (npcId) => {
    if (selectedNPCs.length < 30) {
      const npc = await getNpc(npcId); // Fetch full NPC data using getNpc

      // Calculate Ultima value only if the NPC is a villain
      let ultimaValue = null;
      if (npc.villain === "minor") {
        ultimaValue = 5;
      } else if (npc.villain === "major") {
        ultimaValue = 10;
      } else if (npc.villain === "superme") {
        ultimaValue = 15;
      }

      // Create combatStats object and conditionally add ultima
      const combatStats = {
        notes: "",
        currentHp: calcHP(npc),
        currentMp: calcMP(npc),
        turns: new Array(getTurnCount(npc.rank)).fill(false),
        statusEffects: [],
        combatNotes: "",
        ...(ultimaValue !== null && { ultima: ultimaValue }), // Only add ultima if it's not null
      };

      setSelectedNPCs((prev) => [
        ...prev,
        {
          ...npc,
          id: npcId,
          combatId: `${npc.id}-${Date.now()}`,
          combatStats: combatStats,
        },
      ]);

      if (logNpcAdded) {
        // Add log entry to logs array
        addLog("combat_sim_log_npc_added", npc.name);
      }
    } else {
      if (window.electron) {
        window.electron.alert(t("combat_sim_too_many_npcs"));
      } else {
        alert(t("combat_sim_too_many_npcs"));
      }
    }
  };

  // Handle Select PC from the player list
  const handleSelectPC = (player) => {
    if (selectedNPCs.length + selectedPCs.length < 30) {
      setSelectedPCs((prev) => [
        ...prev,
        {
          ...player,
          id: player.id,
          combatId: `${player.id}-${Date.now()}`,
          combatStats: {
            currentHp: player.stats?.hp?.max ?? 0,
            currentMp: player.stats?.mp?.max ?? 0,
            turns: [false],
            statusEffects: [],
            combatNotes: "",
          },
        },
      ]);
    }
  };

  // Handle Remove PC from the selected PCs list
  const handleRemovePC = async (pcCombatId) => {
    if (askBeforeRemoveNpc) {
      const confirmRemove = await globalConfirm(t("combat_sim_remove_npc_confirm"));
      if (!confirmRemove) return;
    }
    setSelectedPCs((prev) => prev.filter((pc) => pc.combatId !== pcCombatId));
    if (selectedPC?.combatId === pcCombatId) {
      setSelectedPC(null);
    }
  };

  // Handle PC click in the selected PCs list
  const handlePcClick = (pcCombatId) => {
    const pc = selectedPCs.find((pc) => pc.combatId === pcCombatId);
    setSelectedPC(pc);
    setSelectedNPC(null); // clear NPC selection
  };

  // Handle Update PC Turns
  const handleUpdatePcTurns = (combatId, newTurns) => {
    setSelectedPCs((prev) =>
      prev.map((pc) =>
        pc.combatId === combatId
          ? { ...pc, combatStats: { ...pc.combatStats, turns: newTurns } }
          : pc
      )
    );
  };

  // Handle Remove NPC from the selected NPCs list
  const handleRemoveNPC = async (npcCombatId, isAutoRemove = false) => {
    if (askBeforeRemoveNpc && !isAutoRemove) {
      const confirmRemove = await globalConfirm(
        t("combat_sim_remove_npc_confirm")
      );
      if (!confirmRemove) return;
    }

    const npcToRemove = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
    // if selectedNPC is the one removed, set selectedNPC to null
    if (selectedNPC?.combatId === npcCombatId) {
      setSelectedNPC(null);
    }

    // Add log entry to logs array
    if (npcToRemove && logNpcRemoved) {
      addLog(
        "combat_sim_log_npc_removed",
        npcToRemove.name +
          (npcToRemove?.combatStats?.combatNotes
            ? "【" + npcToRemove.combatStats.combatNotes + "】"
            : "")
      );
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

  const handleSortEnd = (sortedNPCs) => {
    setSelectedNPCs(sortedNPCs);
  };

  // Handle NPC Click in the selected NPCs list
  const handleNpcClick = (npcCombatId) => {
    const npc = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    setSelectedNPC(npc); // Set clicked NPC as the selected NPC
    setSelectedPC(null); // clear PC selection
    setSelectedStudy(0);
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

      setSelectedPCs((prev) =>
        prev.map((pc) => {
          if (pc.combatId !== npcClicked.combatId) return pc;
          const newHp = Math.min(
            Math.max(pc.combatStats.currentHp + (statType === "HP" ? adjustedValue : 0), 0),
            maxHP
          );
          const newMp = Math.min(
            Math.max(pc.combatStats.currentMp + (statType === "MP" ? adjustedValue : 0), 0),
            maxMP
          );
          return {
            ...pc,
            combatStats: {
              ...pc.combatStats,
              currentHp: statType === "HP" ? newHp : pc.combatStats.currentHp,
              currentMp: statType === "MP" ? newMp : pc.combatStats.currentMp,
            },
          };
        })
      );

      if (selectedPC && selectedPC.combatId === npcClicked.combatId) {
        const newHp = Math.min(
          Math.max(selectedPC.combatStats.currentHp + (statType === "HP" ? adjustedValue : 0), 0),
          maxHP
        );
        const newMp = Math.min(
          Math.max(selectedPC.combatStats.currentMp + (statType === "MP" ? adjustedValue : 0), 0),
          maxMP
        );
        setSelectedPC({
          ...selectedPC,
          combatStats: {
            ...selectedPC.combatStats,
            currentHp: statType === "HP" ? newHp : selectedPC.combatStats.currentHp,
            currentMp: statType === "MP" ? newMp : selectedPC.combatStats.currentMp,
          },
        });
      }

      handleClose();
      return;
    }

    // NPC path
    if (!isHealing && statType === "HP") {
      adjustedValue = -Number(
        calculateDamage(npcClicked, value, damageType, isGuarding)
      );
    } else {
      adjustedValue = isHealing ? Number(value) : -Number(value);
    }

    const updatedNPCs = selectedNPCs.map((npc) => {
      if (npc.combatId === npcClicked.combatId) {
        const maxHP = calcHP(npcClicked);
        const maxMP = calcMP(npcClicked);
        const newHp = Math.min(
          Math.max(
            npc.combatStats.currentHp + (statType === "HP" ? adjustedValue : 0),
            0
          ),
          maxHP
        );
        const newMp = Math.min(
          Math.max(
            npc.combatStats.currentMp + (statType === "MP" ? adjustedValue : 0),
            0
          ),
          maxMP
        );

        return {
          ...npc,
          combatStats: {
            ...npc.combatStats,
            currentHp: statType === "HP" ? newHp : npc.combatStats.currentHp,
            currentMp: statType === "MP" ? newMp : npc.combatStats.currentMp,
          },
        };
      }
      return npc;
    });

    setSelectedNPCs(updatedNPCs);

    if (selectedNPC && selectedNPC.combatId === npcClicked.combatId) {
      const maxHP = calcHP(npcClicked);
      const maxMP = calcMP(npcClicked);
      const newHp = Math.min(
        Math.max(
          npcClicked.combatStats.currentHp +
            (statType === "HP" ? adjustedValue : 0),
          0
        ),
        maxHP
      );
      const newMp = Math.min(
        Math.max(
          npcClicked.combatStats.currentMp +
            (statType === "MP" ? adjustedValue : 0),
          0
        ),
        maxMP
      );

      setSelectedNPC({
        ...selectedNPC,
        combatStats: {
          ...selectedNPC.combatStats,
          currentHp:
            statType === "HP" ? newHp : selectedNPC.combatStats.currentHp,
          currentMp:
            statType === "MP" ? newMp : selectedNPC.combatStats.currentMp,
        },
      });
    }

    handleClose();

    // log for damage
    if (
      adjustedValue < 0 &&
      statType === "HP" &&
      damageType !== "" &&
      logNpcDamage
    ) {
      addLog(
        "combat_sim_log_npc_damage",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue),
        damageType
      );
    } else if (adjustedValue < 0 && statType === "HP" && logNpcDamageNoType) {
      addLog(
        "combat_sim_log_npc_damage_no_type",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue)
      );
    } else if (adjustedValue < 0 && statType === "MP" && logNpcUsedMp) {
      addLog(
        "combat_sim_log_npc_used_mp",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue)
      );
    } else if (adjustedValue > 0 && logNpcHeal) {
      addLog(
        "combat_sim_log_npc_heal",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue),
        statType
      );
    }

    // Add log if npc fainted after damage (0.5 seconds delay)
    if (
      npcClicked.combatStats.currentHp +
        (statType === "HP" ? adjustedValue : 0) <=
      0
    ) {
      if (logNpcFainted) {
        setTimeout(() => {
          addLog(
            "combat_sim_log_npc_fainted",
            npcClicked.name +
              (npcClicked?.combatStats?.combatNotes
                ? "【" + npcClicked.combatStats.combatNotes + "】"
                : "")
          );
        }, 200);
      }
      if (autoRemoveNPCFaint) {
        setTimeout(() => {
          handleRemoveNPC(npcClicked.combatId, true);
        }, 300);
      }
    }
  };

  // Calculate damage with affinities
  function calculateDamage(
    npc,
    damageValue,
    damageType = "",
    isGuarding = false
  ) {
    const affinities = npc.affinities || {};
    const damage = parseInt(damageValue, 10) || 0;

    // Default damage value
    let finalDamage = damage;

    if (affinities[damageType]) {
      switch (affinities[damageType]) {
        case "vu": // Vulnerable (x2)
          finalDamage = isGuarding ? damage : damage * 2;
          break;
        case "rs": // Resistant (x0.5, rounded down)
          finalDamage = Math.floor(damage * 0.5);
          break;
        case "ab": // Absorb (turn damage into healing)
          finalDamage = -damage;
          break;
        case "im": // Immune (no damage)
          finalDamage = 0;
          break;
        default:
          break;
      }
    } else if (isGuarding) {
      finalDamage = Math.floor(damage * 0.5);
    }

    if (isGuarding && damageType === "") {
      finalDamage = Math.floor(damage * 0.5);
    }

    return finalDamage;
  }

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
        npc.combatId === updatedNPC.combatId ? updatedNPC : npc
      )
    );

    // Add log entry if status effect is added or removed
    if (updatedStatusEffects.includes(status)) {
      if (logStatusEffectAdded) {
        addLog(
          "combat_sim_log_status_effect_added",
          npc.name +
            (npc?.combatStats?.combatNotes
              ? "【" + npc.combatStats.combatNotes + "】"
              : ""),
          null,
          status
        );
      }
    } else {
      if (logStatusEffectRemoved) {
        addLog(
          "combat_sim_log_status_effect_removed",
          npc.name +
            (npc?.combatStats?.combatNotes
              ? "【" + npc.combatStats.combatNotes + "】"
              : ""),
          null,
          status
        );
      }
    }
  };

  // Calculate Current Attribute Value based on Status Effects
  function calcAttr(statusEffect1, statusEffect2, attribute, npc) {
    // Define the base attribute value (e.g., dexterity)
    let attributeValue = npc?.attributes?.[attribute] || 6; // Default to 6 if attribute is missing

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

  // Handle Ultima Points
  const handleIncreaseUltima = () => {
    // update SelectedNPC and selectedNPCs
    setSelectedNPC((prev) => ({
      ...prev,
      combatStats: {
        ...prev.combatStats,
        ultima: (prev.combatStats.ultima || 0) + 1,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                ultima: (npc.combatStats.ultima || 0) + 1,
              },
            }
          : npc
      )
    );
  };

  const handleDecreaseUltima = () => {
    // update SelectedNPC and selectedNPCs
    setSelectedNPC((prev) => ({
      ...prev,
      combatStats: {
        ...prev.combatStats,
        ultima: Math.max((prev.combatStats.ultima || 0) - 1, 0),
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                ultima: Math.max((npc.combatStats.ultima || 0) - 1, 0),
              },
            }
          : npc
      )
    );

    if (logUseUltimaPoint) {
      // Add log entry
      addLog(
        "combat_sim_log_used_ultima_point",
        selectedNPC.name +
          (selectedNPC?.combatStats?.combatNotes
            ? "【" + selectedNPC.combatStats.combatNotes + "】"
            : "")
      );
    }
  };

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
      Math.min(50, startWidth.current - (deltaX / window.innerWidth) * 100)
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

  const handleEditNPC = async () => {
    if (!selectedNPC) return;
    if (isDirty) {
      const confirm = await globalConfirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirm) return;
    }
    // Navigate to the NPC editor at /npc-gallery/:npcId
    navigate(`/npc-gallery/${selectedNPC.id}`, {
      state: {
        from: `/combat-sim/${id}`,
      },
    });
  };

  const handleSaveClock = (newClock) => {
    setEncounterClocks([...encounterClocks, newClock]);
    if (logClockAdded) {
      addLog("combat_sim_log_clock_added", "--isClock--", {
        name: newClock.name,
      });
    }
  };

  const handleUpdateClock = (index, newState) => {
    const updatedClocks = [...encounterClocks];
    updatedClocks[index] = {
      ...updatedClocks[index],
      state: newState,
    };
    setEncounterClocks(updatedClocks);
    if (logClockUpdate) {
      addLog("combat_sim_log_clock_updated", "--isClock--", {
        name: updatedClocks[index].name,
        current: newState.filter(Boolean).length,
        max: updatedClocks[index].sections,
      });
    }
  };

  const handleRemoveClock = async (index) => {
    if (askBeforeRemoveClock) {
      const confirmRemove = await globalConfirm(
        t("combat_sim_remove_clock_confirm")
      );
      if (!confirmRemove) return;
    }

    const clockName = encounterClocks[index].name;
    setEncounterClocks(encounterClocks.filter((_, i) => i !== index));
    if (logClockRemoved) {
      addLog("combat_sim_log_clock_removed", "--isClock--", {
        name: clockName,
      });
    }
  };

  const handleResetClock = (index) => {
    const updatedClocks = [...encounterClocks];
    updatedClocks[index] = {
      ...updatedClocks[index],
      state: new Array(updatedClocks[index].sections).fill(false),
    };
    setEncounterClocks(updatedClocks);
    if (logClockReset) {
      addLog("combat_sim_log_clock_reset", "--isClock--", {
        name: updatedClocks[index].name,
        current: updatedClocks[index].state.filter(Boolean).length,
        max: updatedClocks[index].sections,
      });
    }
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
        addLog={addLog}
      />

      {isMobile && (
        <SelectorPanel
          isMobile={isMobile}
          npcDrawerOpen={npcDrawerOpen}
          setNpcDrawerOpen={setNpcDrawerOpen}
          npcList={npcList}
          handleSelectNPC={handleSelectNPC}
          playerList={playerList}
          handleSelectPC={handleSelectPC}
          loadingNpcs={loadingNpcs}
          loadingPlayers={loadingPlayers}
        />
      )}

      {/* Three Columns: NPC Selector, Selected NPCs, NPC Sheet */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          height: isMobile ? "calc(100vh - 195px)" : "calc(100vh - 157px)",
        }}
      >
        {/* Selector Panel (NPC + PC tabs) */}
        {!isMobile && !isDifferentUser && (
          <SelectorPanel
            isMobile={isMobile}
            npcDrawerOpen={npcDrawerOpen}
            setNpcDrawerOpen={setNpcDrawerOpen}
            npcList={npcList}
            handleSelectNPC={handleSelectNPC}
            playerList={playerList}
            handleSelectPC={handleSelectPC}
            loadingNpcs={loadingNpcs}
            loadingPlayers={loadingPlayers}
          />
        )}
        <Box
          sx={{
            flex: 1,
            bgcolor: isDarkMode ? "#333333" : "#ffffff",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Selected NPCs */}
          <SelectedNpcs
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
            onClockClick={() => setClockDialogOpen(true)}
            onNotesClick={() => setNotesDialogOpen(true)}
            selectedPCs={selectedPCs}
            handleRemovePC={handleRemovePC}
            handlePcClick={handlePcClick}
            handleHpMpClickPC={(type, pc) => handleOpen(type, pc, "pc")}
            handleUpdatePcTurns={handleUpdatePcTurns}
            selectedPcID={selectedPC?.combatId}
          />
          {/* Combat Log */}
          {!hideLogs && (
            <CombatLog
              isMobile={false}
              logs={logs}
              open={logOpen}
              onToggle={handleLogToggle}
              clearLogs={clearLogs}
            />
          )}
        </Box>
        {/* Detail Resize Handle */}
        {(selectedNPC || selectedPC) && (
          <Box
            sx={{
              width: "5px",
              cursor: "ew-resize",
              backgroundColor: isDarkMode ? "#555" : "#ccc",
              "&:hover": { backgroundColor: isDarkMode ? "#777" : "#aaa" },
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
                color: isDarkMode ? "#ddd" : "#555",
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
            handleDecreaseUltima={handleDecreaseUltima}
            handleIncreaseUltima={handleIncreaseUltima}
            npcRef={null}
            isMobile={isMobile}
            addLog={addLog}
            openLogs={() => setLogOpen(true)}
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
        inputRef={inputRef}
      />
      {/* Notes Dialog */}
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
    </Box>
  );
};
