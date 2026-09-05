import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function InitiativeDialog({
  open,
  pcCount,
  npcCount,
  onConfirm,
  onCancel,
}) {
  const theme = useTheme();
  const [initiative, setInitiative] = useState("players");

  const handleConfirm = () => {
    onConfirm(initiative);
    setInitiative("players");
  };

  const handleCancel = () => {
    setInitiative("players");
    onCancel();
  };

  // Build the turn order preview string based on who won
  const buildTurnOrder = () => {
    const pcs = Math.max(pcCount, 0);
    const npcs = Math.max(npcCount, 0);
    if (pcs === 0 && npcs === 0) return null;

    const playersFirst = initiative === "players";
    const turns = [];
    const total = pcs + npcs;

    for (let i = 0; i < total; i++) {
      const pcTurn = i % 2 === (playersFirst ? 0 : 1);
      if (pcTurn && turns.filter((t) => t === "PC").length < pcs) {
        turns.push("PC");
      } else if (!pcTurn && turns.filter((t) => t === "NPC").length < npcs) {
        turns.push("NPC");
      } else if (pcTurn) {
        turns.push("PC");
      } else {
        turns.push("NPC");
      }
    }

    // Rebuild properly: alternate up to min(pcs, npcs)*2, then append extras
    const ordered = [];
    const side1 = playersFirst
      ? { label: "PC", count: pcs }
      : { label: "NPC", count: npcs };
    const side2 = playersFirst
      ? { label: "NPC", count: npcs }
      : { label: "PC", count: pcs };
    const minPairs = Math.min(side1.count, side2.count);
    for (let i = 0; i < minPairs; i++) {
      ordered.push(side1.label);
      ordered.push(side2.label);
    }
    const extra1 = side1.count - minPairs;
    const extra2 = side2.count - minPairs;
    for (let i = 0; i < extra1; i++) ordered.push(side1.label);
    for (let i = 0; i < extra2; i++) ordered.push(side2.label);

    return ordered;
  };

  const turnOrder = buildTurnOrder();

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Start Encounter</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Who seized the initiative?
        </Typography>

        <ToggleButtonGroup
          exclusive
          value={initiative}
          onChange={(_, val) => {
            if (val) setInitiative(val);
          }}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="players">Players</ToggleButton>
          <ToggleButton value="npcs">NPCs</ToggleButton>
        </ToggleButtonGroup>

        {turnOrder && turnOrder.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: "bold",
              }}
            >
              Turn order this round
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
              {turnOrder.map((label, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ alignSelf: "center" }}
                    >
                      →
                    </Typography>
                  )}
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.4,
                      borderRadius: 1,
                      backgroundColor:
                        label === "PC"
                          ? theme.palette.primary.main + "22"
                          : theme.palette.error.main + "22",
                      border: "1px solid",
                      borderColor:
                        label === "PC"
                          ? theme.palette.primary.main + "66"
                          : theme.palette.error.main + "66",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      color={label === "PC" ? "primary" : "error"}
                    >
                      {label}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Start
        </Button>
      </DialogActions>
    </Dialog>
  );
}
