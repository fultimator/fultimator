import React from "react";
import { Box } from "@mui/material";
import PcCompactLoadout from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactLoadout";
import SpellVehiclePanel from "/src/components/shared/actors/pc/variants/compact/spells/SpellVehiclePanel";
import PcEquipment from "/src/components/shared/actors/common/PcEquipment";
import SphereInventory from "/src/components/shared/actors/pc/editors/equipment/technospheres/SphereInventory";

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
        <SphereInventory
          player={player}
          setPlayer={setPlayer}
          advancement={player?.settings?.advancement ?? false}
          compact
        />
      )}
    </Box>
  );
}
