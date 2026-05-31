import React from "react";
import PcEquipment from "/src/components/shared/actors/common/PcEquipment";

export default function PlayerEquipment({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
  return (
    <PcEquipment
      player={player}
      setPlayer={setPlayer}
      isEditMode={isEditMode}
      compact={false}
      showSectionCard
      noShadow={isCharacterSheet}
      showBonusRows
    />
  );
}
