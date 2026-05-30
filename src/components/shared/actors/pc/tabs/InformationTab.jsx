import { Divider } from "@mui/material";
import { EditPlayerBasics } from "/src/components/shared/actors/pc/editors";
import { EditPlayerTraits } from "/src/components/shared/actors/pc/editors";
import { EditPlayerBonds } from "/src/components/shared/actors/pc/editors";
import { EditPlayerQuirk } from "/src/components/shared/actors/pc/editors";
import { EditPlayerCampActivities } from "/src/components/shared/actors/pc/editors";
import { EditPlayerZeroPower } from "/src/components/shared/actors/pc/editors";
import { EditPlayerOthers as EditPlayerOther } from "/src/components/shared/actors/pc/editors";

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
