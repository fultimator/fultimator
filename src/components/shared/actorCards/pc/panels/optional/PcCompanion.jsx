import PlayerCompanion from "../../playerSheet/optional/PlayerCompanion";

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
