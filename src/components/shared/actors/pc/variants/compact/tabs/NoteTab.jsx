import { Box } from "@mui/material";
import PlayerBonds from "/src/components/shared/actors/common/PlayerBonds";
import PlayerNotes from "/src/components/shared/actors/pc/playerSheet/PlayerNotes";

export default function NoteTab({
  player,
  setPlayer,
  isEditMode = false,
  searchQuery = "",
  defaultExpanded = false,
  speaker = "",
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <PlayerBonds
        player={player}
        setPlayer={setPlayer}
        isEditMode={isEditMode}
        searchQuery={searchQuery}
        compact
      />
      <PlayerNotes
        player={player}
        setPlayer={setPlayer}
        isEditMode={isEditMode}
        searchQuery={searchQuery}
        compact
        defaultExpanded={defaultExpanded}
        speaker={speaker}
      />
    </Box>
  );
}
