import React from "react";
import PcEquipment from "/src/components/shared/actors/common/PcEquipment";

export default function PlayerEquipment({
  player,
  setPlayer,
  isEditMode,
  isLocked = false,
  isCharacterSheet,
}) {
  return (
    <PcEquipment
      player={player}
      setPlayer={setPlayer}
      isEditMode={isEditMode}
      isLocked={isLocked}
      compact={false}
      showSectionCard
      noShadow={isCharacterSheet}
      showBonusRows
    />
  );
}
