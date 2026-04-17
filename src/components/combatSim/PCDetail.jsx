import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import PlayerCardSheet from "../player/playerSheet/compact/PlayerSheetCompact";

export default function PCDetail({
  selectedPC,
  setSelectedPC,
  npcDetailWidth,
}) {
  const theme = useTheme();

  if (!selectedPC) return null;

  return (
    <Box
      sx={{
        width: npcDetailWidth,
        bgcolor: theme.palette.background.paper,
        height: "100%",
        overflowY: "auto",
        borderRadius: "8px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {selectedPC.name}
        </Typography>
        <IconButton onClick={() => setSelectedPC(null)} size="small">
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Player Sheet */}
      <Box sx={{ p: 1, flexGrow: 1 }}>
        <PlayerCardSheet
          player={selectedPC}
          setPlayer={() => {}}
          isMainTab={true}
          isEditMode={false}
          isCharacterSheet={true}
          characterImage={selectedPC?.info?.imgurl ?? null}
          id={selectedPC?.id}
        />
      </Box>
    </Box>
  );
}
