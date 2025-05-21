import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";
import { calcHP, calcMP } from "../../libs/npcs";
import SelectedNpcs from "../../components/combatSim/SelectedNpcs";
import useDownloadImage from "../../hooks/useDownloadImage";
import NPCDetail from "../../components/combatSim/NPCDetail";
import CombatSimClocks from "../../components/combatSim/CombatSimClocks";
import { typesList } from "../../libs/types";
import { t } from "../../translation/translate";
import DamageHealDialog from "../../components/combatSim/DamageHealDialog";
import CombatLog from "../../components/combatSim/CombatLog";
import { DragHandle } from "@mui/icons-material";
import debounce from "lodash.debounce";
import { globalConfirm } from "../../utility/globalConfirm";
import { useNavigate } from "react-router-dom";
import { useCombatSimSettingsStore } from "../../stores/combatSimSettingsStore";
import GeneralNotesDialog from "../../components/combatSim/GeneralNotesDialog";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase";
import { SignIn } from "../../components/auth";
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

export default function CombatSimulator() {
  const [user, loading, error] = useAuthState(auth);
  //console.debug("user, loading, error", user, loading, error);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <Layout fullWidth={user} unsavedChanges={isDirty}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            {t("You must be logged in to use this feature")}
          </Typography>
          <SignIn />
        </>
      )}
      {user && (
        <CombatSim user={user} setIsDirty={setIsDirty} isDirty={isDirty} />
      )}
    </Layout>
  );
}

const CombatSim = ({ user, setIsDirty, isDirty }) => {
  // ========== Base States ==========
  const { id } = useParams(); // Get the encounter ID from the URL
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark"; // Check if dark mode is enabled
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [initialized, setInitialized] = useState(false); // Initialized state
  const navigate = useNavigate();

  // ========== Firebase ==========
  const encounterRef = doc(firestore, "encounters", id);
  const [encounterData, loadingEncounter] = useDocumentData(encounterRef, {
    idField: "id",
  });

  const npcsRef = collection(firestore, "npc-personal");
  const npcsQuery = query(npcsRef, where("uid", "==", user.uid));
  const [npcsList, loadingNpcs] = useCollectionData(npcsQuery, {
    idField: "id",
  });

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
  const [selectedNPCs, setSelectedNPCs] = useState([]); // Selected NPCs
  const [selectedNPC, setSelectedNPC] = useState(null); // Selected NPC (for NPC Sheet)
  const [npcClicked, setNpcClicked] = useState(null); // NPC clicked for HP/MP change
  const [npcDrawerOpen, setNpcDrawerOpen] = useState(false); // NPC Drawer open (mobile)
  const [lastSaved, setLastSaved] = useState(null); // Last saved time
  const [lastAutoSaved, setLastAutoSaved] = useState(null); // Last auto-saved time
  const [encounterNotes, setEncounterNotes] = useState([]); // Encounter notes

  // ========== UI Interaction States ==========
  const [npcDetailWidth, setNpcDetailWidth] = useState(30); // NPC detail width (%)
  const isResizing = useRef(false); // Resizing flag
  const startX = useRef(0);
  const startWidth = useRef(npcDetailWidth);
  const prevSelectedNpcsRef = useRef(null);
  const prevRoundRef = useRef(null);
  const prevLogsRef = useRef(null);
  const prevEncounterNameRef = useRef(null);
  const prevEncounterNotesRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null); // Turns popover anchor
  const [popoverNpcId, setPopoverNpcId] = useState(null); // Popover NPC ID
  const [tabIndex, setTabIndex] = useState(0); // NPC sheet/stats/rolls/notes tab index

  const [notesDialogOpen, setNotesDialogOpen] = useState(false); // Notes dialog open

  const [open, setOpen] = useState(false); // HP/MP dialog open
  const [statType, setStatType] = useState(null); // "HP" or "MP"
  const [value, setValue] = useState(0); // HP/MP value
  const [isHealing, setIsHealing] = useState(false); // Heal = true, Damage = false
  const [damageType, setDamageType] = useState(""); // Damage type
  const [isGuarding, setIsGuarding] = useState(false); // Guarding state
  const [isIgnoreResistance, setIsIgnoreResistance] = useState(false); // Ignore resistance state
  const [isIgnoreImmunity, setIsIgnoreImmunity] = useState(false); // Ignore immunity state

  const [isSaveSnackbarOpen, setIsSaveSnackbarOpen] = useState(false); // Save snackbar open

  // ========== Study and Download Image States ==========
  const [selectedStudy, setSelectedStudy] = useState(0); // Study dropdown
  const ref = useRef(); // NPC sheet image ref
  const [downloadImage, downloadSnackbar] = useDownloadImage(
    selectedNPC?.name,
    ref
  ); // Download image hook

  // ========== Logs States ==========
  const [logs, setLogs] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const handleLogToggle = (newState) => {
    setLogOpen(newState);
  };

  // ========== User states ==========
  const isDifferentUser = encounter?.uid !== user?.uid;
  const isPrivate = encounter?.private && isDifferentUser;

  function addLog(
    logText,
    value1 = null,
    value2 = null,
    value3 = null,
    value4 = null,
    value5 = null
  ) {
    if (hideLogs) return;

    /* max of 50 logs */
    if (logs.length >= 50) {
      // remove the oldest log: {text, timestamp} sorted by {timestamp} and add the new one
      const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
      const newLogs = sortedLogs.slice(1);
      newLogs.push({
        text: logText,
        timestamp: Date.now(),
        value1: value1,
        value2: value2,
        value3: value3,
        value4: value4,
        value5: value5,
      });
      setLogs(newLogs);
    } else {
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          text: logText,
          timestamp: Date.now(),
          value1: value1,
          value2: value2,
          value3: value3,
          value4: value4,
          value5: value5,
        },
      ]);
    }
  }

  const clearLogs = () => {
    // Function to clear logs
    setLogs([]);
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(() => {
      // Skip the isDirty check here since we're only calling this when isDirty is true
      if (autosaveEnabled) {
        // Use the same validation as in handleSaveState
        if (selectedNPCs.some((npc) => !npc.id)) {
          console.warn("Skipping autosave due to invalid NPCs");
          return;
        }

        const currentTime = new Date();
        setLastAutoSaved(currentTime);

        // Save encounter state (only necessary data)
        setDoc(doc(firestore, "encounters", id), {
          ...encounter,
          name: encounterName,
          selectedNPCs: selectedNPCs.map((npc) => ({
            id: npc.id,
            combatId: npc.combatId,
            combatStats: npc.combatStats,
          })),
          round: encounter.round,
          logs: logs,
          clocks: encounterClocks, // Save clocks state
          notes: encounterNotes, // Save notes state
          private: encounter?.private || true,
          lastAutoSaved: currentTime,
        });

        console.log("Autosaved encounter state");
        setIsSaveSnackbarOpen(true);
        setIsDirty(false);
      }
    }, AUTO_SAVE_DELAY),
    [autosaveEnabled, selectedNPCs, encounter, encounterName, logs, id]
  );

// useEffect to detect actual encounter changes
  useEffect(() => {
    if (!initialized) return;
    // Skip first render
    if (prevSelectedNpcsRef.current === null) {
      prevSelectedNpcsRef.current = selectedNPCs;
      prevRoundRef.current = encounter?.round;
      prevLogsRef.current = logs;
      prevEncounterNameRef.current = encounterName;
      prevEncounterNotesRef.current = encounterNotes;
      return;
    }

    // Only trigger dirty if something actually changed
    let hasChanges = false;

    // Check if round changed
    if (prevRoundRef.current !== encounter?.round) {
      console.log(
        "Round changed from",
        prevRoundRef.current,
        "to",
        encounter?.round
      );
      hasChanges = true;
    }

    // Check if name changed
    if (prevEncounterNameRef.current !== encounterName) {
      console.log(
        "Name changed from",
        prevEncounterNameRef.current,
        "to",
        encounterName
      );
      hasChanges = true;
    }

    // Check if logs changed
    if (prevLogsRef.current?.length !== logs?.length) {
      console.log("Logs length changed");
      hasChanges = true;
    }

    // Check if clocks changed
    if (JSON.stringify(encounter?.clocks) !== JSON.stringify(encounterClocks)) {
      console.log("Clocks state changed");
      hasChanges = true;
    }

    // Check if notes changed
    if (JSON.stringify(encounter?.notes) !== JSON.stringify(encounterNotes)) {
      console.log("Notes state changed");
      hasChanges = true;
    }

    // Complex deep comparison for NPCs
    if (selectedNPCs.length !== prevSelectedNpcsRef.current?.length) {
      console.log("NPC count changed");
      hasChanges = true;
    } else {
      // Check if any NPC stats changed
      for (let i = 0; i < selectedNPCs.length; i++) {
        const currentNpc = selectedNPCs[i];
        const prevNpc = prevSelectedNpcsRef.current[i];

        if (currentNpc.combatId !== prevNpc.combatId) {
          console.log("NPC changed at index", i);
          hasChanges = true;
          break;
        }

        // Check HP/MP changes
        if (
          currentNpc.combatStats.currentHp !== prevNpc.combatStats.currentHp ||
          currentNpc.combatStats.currentMp !== prevNpc.combatStats.currentMp
        ) {
          console.log("HP/MP changed for NPC", currentNpc.name);
          hasChanges = true;
          break;
        }

        // Check status effects changes
        const currentEffects = currentNpc.combatStats.statusEffects || [];
        const prevEffects = prevNpc.combatStats.statusEffects || [];
        if (JSON.stringify(currentEffects) !== JSON.stringify(prevEffects)) {
          console.log("Status effects changed for NPC", currentNpc.name);
          hasChanges = true;
          break;
        }

        // Check turns changes
        const currentTurns = currentNpc.combatStats.turns || [];
        const prevTurns = prevNpc.combatStats.turns || [];
        if (JSON.stringify(currentTurns) !== JSON.stringify(prevTurns)) {
          console.log("Turns changed for NPC", currentNpc.name);
          hasChanges = true;
          break;
        }
      }
    }

    // Only set dirty flag if actual changes were detected
    if (hasChanges && encounter && !selectedNPCs.some((npc) => !npc.id)) {
      console.log("Detected meaningful changes, marking as dirty");
      setIsDirty(true);
    }

    // Update all refs for next comparison
    prevSelectedNpcsRef.current = JSON.parse(JSON.stringify(selectedNPCs));
    prevRoundRef.current = encounter?.round;
    prevLogsRef.current = [...logs];
    prevEncounterNameRef.current = encounterName;
  }, [
    selectedNPCs,
    encounter,
    logs,
    encounterName,
    encounterClocks,
    encounterNotes,
    initialized,
    setIsDirty,
  ]);

  // Window event listener for beforeunload to prevent leaving the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !autosaveEnabled) {
        e.preventDefault();
        // Some browsers require setting returnValue to show the dialog
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, autosaveEnabled]);

  // useEffect for triggering the autosave when dirty
  useEffect(() => {
    if (isDirty && autosaveEnabled) {
      console.log("isDirty is true, triggering debounced save");
      debouncedSave();
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [isDirty, autosaveEnabled, debouncedSave]);

  // Window event listener for beforeunload to save when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty && autosaveEnabled) {
        handleSaveState();
        console.log("Saved before unload");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, autosaveEnabled]);

  // Fetch encounter and NPCs on initial load
  useEffect(() => {
    if (document.hidden) return; // Prevent fetch on tab switch
    const fetchEncounter = async () => {
      setEncounter(encounterData);
      setEncounterName(encounterData?.name || "");
      setLogs(encounterData?.logs || []);
      setEncounterClocks(encounterData?.clocks || []);
      setEncounterNotes(encounterData?.notes || []);
      prevSelectedNpcsRef.current = JSON.parse(
        JSON.stringify(encounterData?.selectedNPCs || [])
      );
      prevEncounterNameRef.current = encounterData?.name || "";
      prevLogsRef.current = [...(encounterData?.logs || [])];    
      prevRoundRef.current = encounterData?.round;

      if (!encounterData?.selectedNPCs?.length) {
        setSelectedNPCs([]);
        setLoading(false);
        return;
      }

      // Fetch all NPCs in one query
      const npcIds = encounterData.selectedNPCs.map((npc) => npc.id);
      const npcQuery = query(
        collection(firestore, "npc-personal"),
        where("__name__", "in", npcIds),
        where("uid", "==", encounterData.uid)
      );

      try {
        console.log("Fetching NPCs...");
        const querySnapshot = await getDocs(npcQuery);
        const npcMap = new Map();

        querySnapshot.forEach((doc) => {
          npcMap.set(doc.id, {
            ...doc.data(),
            id: doc.id,
          });
        });

        const loadedNPCs = encounterData.selectedNPCs.map((npcData) => {
          const fetchedNpc = npcMap.get(npcData.id);

          if (!fetchedNpc) {
            console.error("NPC not found:", npcData.id);
            return {
              combatId: npcData.combatId,
              combatStats: npcData.combatStats,
              id: npcData.id,
              name: "Unknown NPC",
            };
          }

          // Calculate max HP/MP from the fetched NPC
          const maxHp = calcHP(fetchedNpc);
          const maxMp = calcMP(fetchedNpc);

          // Clamp current HP/MP to max values
          const currentHp = Math.min(
            npcData.combatStats?.currentHp || maxHp,
            maxHp
          );
          const currentMp = Math.min(
            npcData.combatStats?.currentMp || maxMp,
            maxMp
          );

          return {
            ...fetchedNpc,
            combatId: npcData.combatId,
            combatStats: {
              ...npcData.combatStats,
              currentHp,
              currentMp,
              turns:
                npcData.combatStats?.turns ||
                Array(getTurnCount(fetchedNpc.rank)).fill(false),
              statusEffects: npcData.combatStats?.statusEffects || [],
            },
          };
        });

        setSelectedNPCs(loadedNPCs);
        prevSelectedNpcsRef.current = JSON.parse(JSON.stringify(loadedNPCs));
        setInitialized(true);
      } catch (error) {
        console.error("Error fetching NPCs:", error);
        setSelectedNPCs([]);
      }

      setLoading(false);
      setInitialized(true);
    };

    const fetchNpcs = async () => {
      setNpcList(npcsList);
    };

    fetchEncounter();
    fetchNpcs();
  }, [id, encounterData, npcsList, user.uid]);

  // Fetch single NPC
  const getNpc = async (npcId) => {
    try {
      const npcDocRef = doc(firestore, "npc-personal", npcId);
      const npcDocSnap = await getDoc(npcDocRef); // Fetch document
      console.log("Fetching selected NPC...");
      if (npcDocSnap.exists()) {
        return npcDocSnap.data(); // Return the NPC data
      } else {
        console.error("NPC not found:", npcId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching NPC:", error);
      return null;
    }
  };

  // Save encounter state
  const handleSaveState = () => {
    // if selectedNPCs doesn't have any npc without id, then save the state
    if (selectedNPCs.some((npc) => !npc.id)) {
      // Alert
      alert(t("combat_sim_error_saving_encounter_deleted_npcs"));
      return;
    }

    const currentTime = new Date();
    setLastSaved(currentTime);

    // Create combat stats objects with only necessary data
    const combatStatsToSave = selectedNPCs.map((npc) => ({
      id: npc.id,
      combatId: npc.combatId,
      combatStats: {
        currentHp: npc.combatStats.currentHp,
        currentMp: npc.combatStats.currentMp,
        statusEffects: npc.combatStats.statusEffects || [],
        turns: npc.combatStats.turns || [],
        combatNotes: npc.combatStats.combatNotes || "",
        ...(npc.combatStats.ultima !== undefined && {
          ultima: npc.combatStats.ultima,
        }),
      },
    }));

    // Save encounter state (only store necessary identifiers: id and combatId)
    setDoc(doc(firestore, "encounters", id), {
      ...encounter,      
      name: encounterName,
      selectedNPCs: combatStatsToSave,
      round: encounter.round || 1,
      logs: logs || [],
      clocks: encounterClocks || [],
      notes: encounterNotes || [],
      private: encounter?.private !== false, // Default to private if not set
    });

    setIsSaveSnackbarOpen(true);

    // Clear dirty flag after manual save
    setIsDirty(false);
  };

  // Calculate time since last save
  const minutes = Math.floor((new Date() - lastSaved) / 1000 / 60);

  const timeAgo = lastSaved
    ? t("combat_sim_last_saved_before") +
      " " +
      minutes +
      " " +
      t("combat_sim_last_saved_after")
    : "Not saved yet";

  /* ENCOUNTER NAME EDITING */
  // Handle Encounter Name Change
  const handleEncounterNameChange = (event) => {
    setEncounterName(event.target.value);
  };

  // Save Encounter Name
  const handleSaveEncounterName = () => {
    if (encounterName.trim() === "") {
      return;
    }
    setIsEditing(false);

    if (logEncounterNameUpdated) {
      // Add log entry
      addLog("combat_sim_log_encounter_name_updated");
    }
  };

  // Handle Enter key press and blur for saving encounter name
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSaveEncounterName();
    }
  };

  // Handle Blur for saving encounter name
  const handleBlur = () => {
    handleSaveEncounterName();
  };

  // Handle Edit Click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  /* NPC ROUNDS AND TURNS */
  // Handle Round Increase
  const handleIncreaseRound = () => {
    // Increment the round
    encounter.round += 1;
    setEncounter({ ...encounter }); // Trigger re-render or state update

    if (logRoundIncrease) {
      // Add log entry
      addLog("combat_sim_log_round_increase", encounter.round);
    }
  };

  // Handle Round Decrease
  const handleDecreaseRound = () => {
    // Decrease the round and prevent negative values
    encounter.round = Math.max(1, encounter.round - 1);
    setEncounter({ ...encounter }); // Trigger re-render or state update

    if (logRoundDecrease) {
      // Add log entry
      addLog("combat_sim_log_round_decrease", encounter.round);
    }
  };

  // Handle Reset Turns
  const handleResetTurns = () => {
    // Reset the turns for each selected NPC
    selectedNPCs.forEach((npc) => {
      npc.combatStats.turns = npc.combatStats.turns.map(() => false); // Reset all turns
      handleUpdateNpcTurns(npc.combatId, npc.combatStats.turns);
    });

    // Increment the round
    encounter.round += 1;
    setEncounter({ ...encounter }); // Trigger re-render or state update

    if (logNewRound) {
      // Add log entry
      addLog("combat_sim_log_new_round", encounter.round);
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
      const oldTurns = npc.combatStats.turns;
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

  // Handle Remove NPC from the selected NPCs list
  const handleRemoveNPC = async (npcCombatId, isAutoRemove = false) => {
    if (askBeforeRemoveNpc && !isAutoRemove) {
      const confirmRemove = await globalConfirm(
        t("combat_sim_remove_npc_confirm")
      );
      if (!confirmRemove) return;
    }

    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
    // if selectedNPC is the one removed, set selectedNPC to null
    if (selectedNPC?.combatId === npcCombatId) {
      setSelectedNPC(null);
    }

    // Add log entry to logs array
    const npc = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    if (npc && logNpcRemoved) {
      addLog(
        "combat_sim_log_npc_removed",
        npc.name +
          (npc?.combatStats?.combatNotes
            ? "【" + npc.combatStats.combatNotes + "】"
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
    setSelectedStudy(0);
  };

  // Handle Study Change
  const handleStudyChange = (event) => {
    setSelectedStudy(event.target.value);
  };

  // Handle Open HP/MP Dialog
  const handleOpen = (type, npc) => {
    setStatType(type);
    setValue("");
    setDamageType("");
    setIsGuarding(false);
    setIsIgnoreResistance(false);
    setIsIgnoreImmunity(false);
    setOpen(true);
    setNpcClicked(npc);

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
        ultima: prev.combatStats.ultima + 1,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                ultima: npc.combatStats.ultima + 1,
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
        ultima: prev.combatStats.ultima - 1,
      },
    }));
    setSelectedNPCs((prev) =>
      prev.map((npc) =>
        npc.combatId === selectedNPC.combatId
          ? {
              ...npc,
              combatStats: {
                ...npc.combatStats,
                ultima: npc.combatStats.ultima - 1,
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
      const currentTurns = [...npc.combatStats.turns];

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
        from: `/combat-sim/${encounter.id}`,
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
        <NpcSelector // NPC Selector
          isMobile={isMobile}
          npcDrawerOpen={npcDrawerOpen}
          setNpcDrawerOpen={setNpcDrawerOpen}
          npcList={npcList}
          handleSelectNPC={handleSelectNPC}
          loading={loadingNpcs}
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
        {/* NPC Selector */}
        {!isMobile && !isDifferentUser && (
          <NpcSelector
            isMobile={isMobile}
            npcDrawerOpen={npcDrawerOpen}
            setNpcDrawerOpen={setNpcDrawerOpen}
            npcList={npcList}
            handleSelectNPC={handleSelectNPC}
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
            handleHpMpClick={(type, npc) => handleOpen(type, npc)}
            isMobile={isMobile}
            selectedNpcID={selectedNPC?.combatId}
            isDifferentUser={isDifferentUser}
            useDragAndDrop={npcReorderingMethod === "dragAndDrop"}
            onSortEnd={handleSortEnd}
            onClockClick={() => setClockDialogOpen(true)}
            onNotesClick={() => setNotesDialogOpen(true)}
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
        {/* NPC Detail Resize Handle */}
        {selectedNPC && (
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
          npcRef={ref}
          isMobile={isMobile}
          addLog={addLog}
          openLogs={() => setLogOpen(true)}
          npcDetailWidth={`${npcDetailWidth}%`}
          checkNewTurn={checkNewTurn}
          handleEditNPC={handleEditNPC}
        />
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
