import React from "react";
import { Box } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import PcEquipment from "/src/components/shared/actors/common/PcEquipment";
import SphereInventory from "/src/components/shared/actors/pc/editors/equipment/technospheres/SphereInventory";

export default function EditPlayerEquipment({ player, setPlayer, isEditMode }) {
  const _t = useTranslate();
  const isTechnospheres =
    player?.settings?.optionalRules?.technospheres ?? false;

  return (
    <>
      <PcEquipment
        player={player}
        setPlayer={setPlayer}
        isEditMode={isEditMode}
        compact={false}
        showSectionCard
      />

      {isTechnospheres && (
        <>
          <Box sx={{ my: 2 }} />
          <SphereInventory
            player={player}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
            advancement={player?.settings?.advancement ?? false}
          />
        </>
      )}
    </>
  );
}
