import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";
import { t } from "../../../translation/translate";

const NotesTab = ({
  selectedNPC,
  setSelectedNPC,
  selectedNPCs,
  setSelectedNPCs,
  addLog,
}) => {
  const [customLog, setCustomLog] = useState("");

  const handleSendLog = () => {
    const npcName =
      selectedNPC.name +
      (selectedNPC?.combatStats?.combatNotes
        ? "【" + selectedNPC.combatStats.combatNotes + "】"
        : "");
    const trimmedLog = customLog.trim();
    if (!trimmedLog) return;

    // Add log entry
    addLog(npcName + ": " + trimmedLog);

    setCustomLog(""); // Clear the textfield after sending
  };

  return (
    <>
      <TextField
        label={t("combat_sim_combat_notes")}
        variant="outlined"
        fullWidth
        rows={1}
        inputProps={{ maxLength: 50 }}
        placeholder={t("combat_sim_combat_notes_detail")}
        value={
          selectedNPCs.find((npc) => npc.combatId === selectedNPC.combatId)
            ?.combatStats?.combatNotes || ""
        }
        onChange={(e) => {
          const updatedNPCs = selectedNPCs.map((npc) => {
            if (npc.combatId === selectedNPC.combatId) {
              return {
                ...npc,
                combatStats: {
                  ...npc.combatStats,
                  combatNotes: e.target.value,
                },
              };
            }
            return npc;
          });

          setSelectedNPCs(updatedNPCs);

          // Update selectedNPC
          setSelectedNPC((prev) => ({
            ...prev,
            combatStats: {
              ...prev.combatStats,
              combatNotes: e.target.value,
            },
          }));
        }}
        sx={{ mt: 2 }}
      />
      <TextField
        label={t("Notes")}
        variant="outlined"
        fullWidth
        multiline
        rows={10}
        inputProps={{ maxLength: 2000 }}
        value={
          selectedNPCs.find((npc) => npc.combatId === selectedNPC.combatId)
            ?.combatStats?.notes || ""
        }
        onChange={(e) => {
          const updatedNPCs = selectedNPCs.map((npc) => {
            if (npc.combatId === selectedNPC.combatId) {
              return {
                ...npc,
                combatStats: {
                  ...npc.combatStats,
                  notes: e.target.value,
                },
              };
            }
            return npc;
          });

          setSelectedNPCs(updatedNPCs);
        }}
        sx={{ mt: 2 }}
      />
      <TextField
        label={t("combat_sim_custom_log")}
        variant="outlined"
        fullWidth
        value={customLog}
        onChange={(e) => setCustomLog(e.target.value)}
        sx={{ mt: 2 }}
        InputProps={{
          endAdornment: (
            <Button
              onClick={handleSendLog}
              color="primary"
              variant="contained"
              startIcon={<Send />}
              disabled={!customLog}
            >
              {t("combat_sim_send_log")}
            </Button>
          ),
        }}
      />
    </>
  );
};

export default NotesTab;
