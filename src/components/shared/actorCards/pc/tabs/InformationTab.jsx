import { Divider } from "@mui/material";
import EditPlayerBasics from "../../../../player/informations/EditPlayerBasics";
import EditPlayerTraits from "../../../../player/informations/EditPlayerTraits";
import EditPlayerBonds from "../../../../player/informations/EditPlayerBonds";
import EditPlayerQuirk from "../../../../player/informations/EditPlayerQuirk";
import EditPlayerCampActivities from "../../../../player/informations/EditPlayerCampActivities";
import EditPlayerZeroPower from "../../../../player/informations/EditPlayerZeroPower";
import EditPlayerOther from "../../../../player/informations/EditPlayerOthers";

export default function InformationTab({
  player,
  setPlayer,
  isOwner,
  optionalRules = {},
  updateMaxStats,
  advancement,
  onLevelUpRequest,
}) {
  return (
    <>
      <EditPlayerBasics
        player={player}
        setPlayer={setPlayer}
        updateMaxStats={updateMaxStats}
        isEditMode={isOwner}
        advancement={advancement}
        onLevelUpRequest={onLevelUpRequest}
      />
      <Divider sx={{ my: 1 }} />
      <EditPlayerTraits player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <Divider sx={{ my: 1 }} />
      <EditPlayerBonds player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      {optionalRules.quirks && (
        <>
          <Divider sx={{ my: 1 }} />
          <EditPlayerQuirk player={player} setPlayer={setPlayer} isEditMode={isOwner} />
        </>
      )}
      {optionalRules.campActivities && (
        <>
          <Divider sx={{ my: 1 }} />
          <EditPlayerCampActivities player={player} setPlayer={setPlayer} isEditMode={isOwner} />
        </>
      )}
      {optionalRules.zeroPower && (
        <>
          <Divider sx={{ my: 1 }} />
          <EditPlayerZeroPower player={player} setPlayer={setPlayer} isEditMode={isOwner} />
        </>
      )}
      <Divider sx={{ my: 1 }} />
      <EditPlayerOther player={player} setPlayer={setPlayer} isEditMode={isOwner} />
    </>
  );
}
