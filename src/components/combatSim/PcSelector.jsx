import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import { t } from "../../translation/translate";

export default function PcSelector({
  playerList = [],
  handleSelectPC,
  loading,
}) {
  const [filterText, setFilterText] = useState("");

  const filteredList = playerList.filter(
    (player) =>
      !filterText ||
      (player.name || "").toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <>
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label={t("combat_sim_search")}
          variant="outlined"
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          fullWidth
          slotProps={{
            htmlInput: { maxLength: 100 },
          }}
        />
      </Box>
      <Box sx={{ maxHeight: "calc(100vh - 295px)", overflowY: "auto" }}>
        <List sx={{ height: "calc(100vh - 295px)", overflowY: "auto" }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && filteredList.length === 0 && (
            <Typography
              variant="body2"
              sx={{ padding: 2, color: "text.secondary" }}
            >
              {t("No players found")}.
            </Typography>
          )}
          {filteredList.map((player) => (
            <Box key={player.id}>
              <ListItem
                button
                onClick={() => handleSelectPC(player)}
                sx={{ padding: "5px 10px" }}
              >
                <ListItemText
                  primary={
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {player.name}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        color: "text.secondary",
                        fontFamily: "Antonio",
                      }}
                    >
                      {t("Level")}: {player.lvl ?? "?"}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </Box>
    </>
  );
}
