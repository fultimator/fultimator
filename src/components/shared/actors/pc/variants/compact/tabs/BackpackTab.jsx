import React from "react";
import { Box } from "@mui/material";
import PcCompactLoadout from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactLoadout";
import SpellVehiclePanel from "/src/components/shared/actors/pc/variants/compact/spells/SpellVehiclePanel";
import CompactSphereInventory from "/src/components/shared/actors/pc/playerSheet/PlayerEquipment";
import PcEquipment from "/src/components/shared/actors/common/PcEquipment";

export default function BackpackTab({
  player,
  setPlayer,
  isEditMode = false,
  isMainTab = false,
  searchQuery = "",
}) {
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <PcCompactLoadout
        pc={player}
        onUpdate={setPlayer}
        isInteractive={isEditMode}
        searchQuery={searchQuery}
      />

      <SpellVehiclePanel player={player} searchQuery={searchQuery} />

      <PcEquipment
        player={player}
        setPlayer={setPlayer}
        isEditMode={isEditMode}
        compact
        isMainTab={isMainTab}
        searchQuery={searchQuery}
      />

      {isTechnospheres && (
        <CompactSphereInventory
          player={player}
          setPlayer={setPlayer}
          isEditMode={isEditMode}
          compact
        />
      )}
    </Box>
  );
}
