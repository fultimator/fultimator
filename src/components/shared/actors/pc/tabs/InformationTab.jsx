import { Box } from "@mui/material";
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <EditPlayerBasics
        player={player}
        setPlayer={setPlayer}
        updateMaxStats={updateMaxStats}
        isEditMode={isOwner}
        advancement={advancement}
        onLevelUpRequest={onLevelUpRequest}
      />
      <EditPlayerTraits player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <EditPlayerBonds player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      <EditPlayerOther player={player} setPlayer={setPlayer} isEditMode={isOwner} />
      {optionalRules.quirks && <EditPlayerQuirk player={player} setPlayer={setPlayer} isEditMode={isOwner} />}
      {optionalRules.campActivities && <EditPlayerCampActivities player={player} setPlayer={setPlayer} isEditMode={isOwner} />}
      {optionalRules.zeroPower && <EditPlayerZeroPower player={player} setPlayer={setPlayer} isEditMode={isOwner} />}
    </Box>
  );
}
