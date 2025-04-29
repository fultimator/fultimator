import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BattleHeader from "../../components/combatSim/BattleHeader";
import NpcSelector from "../../components/combatSim/NpcSelector";
import { calcHP, calcMP } from "../../libs/npcs";
import SelectedNpcs from "../../components/combatSim/SelectedNpcs";
import useDownloadImage from "../../hooks/useDownloadImage";
import NPCDetail from "../../components/combatSim/NPCDetail";
import { typesList } from "../../libs/types";
import { t } from "../../translation/translate";
import DamageHealDialog from "../../components/combatSim/DamageHealDialog";
import CombatLog from "../../components/combatSim/CombatLog";
import { DragHandle } from "@mui/icons-material";
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
  console.debug("user, loading, error", user, loading, error);

  return (
    <Layout fullWidth={user}>
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
      {user && <CombatSim user={user} />}
    </Layout>
  );
}

const CombatSim = ({ user }) => {
  // Base states
  const { id } = useParams(); // Get the encounter ID from the URL
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true); // Loading state
  const inputRef = useRef(null);
  const isDarkMode = theme.palette.mode === "dark"; // Check if dark mode is enabled
  const [npcDetailWidth, setNpcDetailWidth] = useState(30); // NPC detail width in percentage
  const isResizing = useRef(false); // NPC detail Resizing ref
  const startX = useRef(0);
  const startWidth = useRef(npcDetailWidth);
  const useDragAndDrop = localStorage.getItem("combatSimUseDragAndDrop") === "true";

  // Firebase start
  const encounterRef = doc(firestore, "encounters", id);
  const [encounterData, loadingEncounter] = useDocumentData(encounterRef, {
    idField: "id",
  });

  const npcsRef = collection(firestore, "npc-personal");
  const npcsQuery = query(npcsRef, where("uid", "==", user.uid));
  const [npcsList, loadingNpcs] = useCollectionData(npcsQuery, {
    idField: "id",
  });

  // Encounter states
  const [encounter, setEncounter] = useState(null); // State for the current encounter
  const [npcList, setNpcList] = useState([]); // List of available NPCs ready for selection
  const [selectedNPCs, setSelectedNPCs] = useState([]); // State for selected NPCs list
  const [selectedNPC, setSelectedNPC] = useState(null); // State for selected NPC (for NPC Sheet)
  const [npcClicked, setNpcClicked] = useState(null); // State for the NPC clicked for HP/MP change
  const [npcDrawerOpen, setNpcDrawerOpen] = useState(false); // NPC Drawer open state (for mobile)
  const [lastSaved, setLastSaved] = useState(null); // Track last saved time
  const [isEditing, setIsEditing] = useState(false); // Editing mode for encounter name
  const [encounterName, setEncounterName] = useState(""); // Encounter name
  const [anchorEl, setAnchorEl] = useState(null); // Turns popover anchor element
  const [popoverNpcId, setPopoverNpcId] = useState(null); // NPC ID for the turns popover
  const [tabIndex, setTabIndex] = useState(0); // Tab index for the selected NPC sheet/stats/rolls/notes
  const [open, setOpen] = useState(false); // Dialog open state for HP/MP change
  const [statType, setStatType] = useState(null); // "HP" or "MP"
  const [value, setValue] = useState(0); // Value for HP/MP change
  const [isHealing, setIsHealing] = useState(false); // true = Heal, false = Damage
  const [damageType, setDamageType] = useState(""); // Type of damage (physical, magical, etc.)
  const [isGuarding, setIsGuarding] = useState(false); // true = Guarding, false = Not guarding

  // Study and Download image states
  const [selectedStudy, setSelectedStudy] = useState(0); // Study dropdown value
  const ref = useRef(); // Reference for the NPC sheet image download
  const [downloadImage] = useDownloadImage(selectedNPC?.name, ref); // Download image hook

  // Logs states
  const [logs, setLogs] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const handleLogToggle = (newState) => {
    setLogOpen(newState);
  };

  // User states
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

  // Fetch encounter and NPCs on initial load
useEffect(() => {
  if (document.hidden) return; // Prevent fetch on tab switch
  const fetchEncounter = async () => {
    setEncounter(encounterData);
    setEncounterName(encounterData?.name || "");
    setLogs(encounterData?.logs || []);
  
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
        npcMap.set(doc.id, doc.data());
      });
  
      const loadedNPCs = encounterData.selectedNPCs.map((npcData) => {
        const fetchedNpc = npcMap.get(npcData.id);
        return fetchedNpc
          ? {
              ...fetchedNpc, 
              id: npcData.id,
              combatId: npcData.combatId,
              combatStats: npcData.combatStats,
            }
          : {
              combatId: npcData.combatId, 
              combatStats: npcData.combatStats, 
            };
      });
  
      setSelectedNPCs(loadedNPCs);
    } catch (error) {
      console.error("Error fetching NPCs:", error);
      setSelectedNPCs([]);
    }
  
    setLoading(false);
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

  // Save encounter state (only store necessary identifiers: id and combatId)

  setDoc(doc(firestore, "encounters", id), {
    ...encounter,
    name: encounterName,
    selectedNPCs: selectedNPCs.map((npc) => ({
      id: npc.id,
      combatId: npc.combatId,
      combatStats: npc.combatStats,
    })), // Only save ids and combatIds
    round: encounter.round,
    logs: logs,
    private: encounter.private || true,
  });

    // Add log entry
    addLog("combat_sim_log_encounter_saved");

    // Log full state for debugging (showing only IDs and combatIds)
    console.log("Saved Encounter State", {
      name: encounterName,
      selectedNPCs: selectedNPCs.map((npc) => ({
        id: npc.id,
        combatId: npc.combatId,
        combatStats: npc.combatStats,
      })),
      round: encounter.round,
      lastSaved: currentTime,
      logs: logs,
      private: encounter.private,
      uid: user.uid,
    });
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

    // Add log entry
    addLog("combat_sim_log_encounter_name_updated");
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

    // Add log entry
    addLog("combat_sim_log_round_increase", encounter.round);
  };

  // Handle Round Decrease
  const handleDecreaseRound = () => {
    // Decrease the round and prevent negative values
    encounter.round = Math.max(1, encounter.round - 1);
    setEncounter({ ...encounter }); // Trigger re-render or state update

    // Add log entry
    addLog("combat_sim_log_round_decrease", encounter.round);
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

    // Add log entry
    addLog("combat_sim_log_new_round", encounter.round);
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

      // Add log entry to logs array
      addLog("combat_sim_log_npc_added", npc.name);
    } else {
      if (window.electron) {
        window.electron.alert(t("combat_sim_too_many_npcs"));
      } else {
        alert(t("combat_sim_too_many_npcs"));
      }
    }
  };

  // Handle Remove NPC from the selected NPCs list
  const handleRemoveNPC = (npcCombatId) => {
    setSelectedNPCs((prev) =>
      prev.filter((npc) => npc.combatId !== npcCombatId)
    );
    // if selectedNPC is the one removed, set selectedNPC to null
    if (selectedNPC?.combatId === npcCombatId) {
      setSelectedNPC(null);
    }

    // Add log entry to logs array
    const npc = selectedNPCs.find((npc) => npc.combatId === npcCombatId);
    if (npc) {
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
    if (adjustedValue < 0 && statType === "HP" && damageType !== "") {
      addLog(
        "combat_sim_log_npc_damage",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue),
        damageType
      );
    } else if (adjustedValue < 0 && statType === "HP") {
      addLog(
        "combat_sim_log_npc_damage_no_type",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue)
      );
    } else if (adjustedValue < 0 && statType === "MP") {
      addLog(
        "combat_sim_log_npc_used_mp",
        npcClicked.name +
          (npcClicked?.combatStats?.combatNotes
            ? "【" + npcClicked.combatStats.combatNotes + "】"
            : ""),
        Math.abs(adjustedValue)
      );
    } else if (adjustedValue > 0) {
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
      setTimeout(() => {
        addLog(
          "combat_sim_log_npc_fainted",
          npcClicked.name +
            (npcClicked?.combatStats?.combatNotes
              ? "【" + npcClicked.combatStats.combatNotes + "】"
              : "")
        );
      }, 500);
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
      addLog(
        "combat_sim_log_status_effect_added",
        npc.name +
          (npc?.combatStats?.combatNotes
            ? "【" + npc.combatStats.combatNotes + "】"
            : ""),
        null,
        status
      );
    } else {
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

    // Add log entry
    addLog(
      "combat_sim_log_used_ultima_point",
      selectedNPC.name +
        (selectedNPC?.combatStats?.combatNotes
          ? "【" + selectedNPC.combatStats.combatNotes + "】"
          : "")
    );
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
      />
      {isMobile && !isDifferentUser && (
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
            useDragAndDrop={useDragAndDrop}
            onSortEnd={handleSortEnd}
          />
          {/* Combat Log */}
          <CombatLog
            isMobile={false}
            logs={logs}
            open={logOpen}
            onToggle={handleLogToggle}
            clearLogs={clearLogs}
            isDifferentUser={isDifferentUser}
          />
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
        inputRef={inputRef}
      />
    </Box>
  );
};
