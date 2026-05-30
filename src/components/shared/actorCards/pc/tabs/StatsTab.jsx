import { Divider } from "@mui/material";
import EditPlayerAttributes from "../../../../player/stats/EditPlayerAttributes";
import EditPlayerAffinities from "../../../../player/stats/EditPlayerAffinities";
import EditPlayerStatuses from "../../../../player/stats/EditPlayerStatuses";
import EditPlayerImmunities from "../../../../player/stats/EditPlayerImmunities";
import EditManualStats from "../../../../player/stats/EditManualStats";

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
