import PlayerCompanion from "/src/components/shared/actors/pc/playerSheet/optional/PlayerCompanion";

export default function PcCompanion({ pc, isInteractive = false, onUpdate }) {
  return (
    <PlayerCompanion
      player={pc}
      setPlayer={isInteractive ? onUpdate : undefined}
      isEditMode={isInteractive}
      isCharacterSheet={true}
    />
  );
}
