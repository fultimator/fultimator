import { Divider } from "@mui/material";
import { EditPlayerAttributes } from "/src/components/shared/actors/pc/editors";
import { EditPlayerAffinities } from "/src/components/shared/actors/pc/editors";
import { EditPlayerStatuses } from "/src/components/shared/actors/pc/editors";
import { EditPlayerImmunities } from "/src/components/shared/actors/pc/editors";
import { EditManualStats } from "/src/components/shared/actors/pc/editors";

export default function StatsTab({ player, setPlayer, isOwner, updateMaxStats }) {
  return (
    <>
      <EditPlayerAttributes player={player} setPlayer={setPlayer} isEditMode={isOwner} updateMaxStats={updateMaxStats} />
      <Divider sx={{ my: 1 }} />
      <EditPlayerAffinities player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <Divider sx={{ my: 1 }} />
      <EditPlayerStatuses player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <Divider sx={{ my: 1 }} />
      <EditPlayerImmunities player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <Divider sx={{ my: 1 }} />
      <EditManualStats player={player} setPlayer={setPlayer} updateMaxStats={updateMaxStats} isEditMode={isOwner} />
    </>
  );
}
