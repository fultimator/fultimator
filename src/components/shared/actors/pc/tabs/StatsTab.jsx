import { Box } from "@mui/material";
import { EditPlayerAttributes } from "/src/components/shared/actors/pc/editors";
import { EditPlayerAffinities } from "/src/components/shared/actors/pc/editors";
import { EditPlayerStatuses } from "/src/components/shared/actors/pc/editors";
import { EditPlayerImmunities } from "/src/components/shared/actors/pc/editors";
import { EditManualStats } from "/src/components/shared/actors/pc/editors";

export default function StatsTab({ player, setPlayer, isOwner, updateMaxStats }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <EditPlayerAttributes player={player} setPlayer={setPlayer} isEditMode={isOwner} updateMaxStats={updateMaxStats} />
      <EditPlayerAffinities player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <EditPlayerStatuses player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <EditPlayerImmunities player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <EditManualStats player={player} setPlayer={setPlayer} updateMaxStats={updateMaxStats} isEditMode={isOwner} />
    </Box>
  );
}
