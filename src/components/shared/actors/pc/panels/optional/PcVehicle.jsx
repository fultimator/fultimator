import PlayerVehicle from "/src/components/shared/actors/pc/playerSheet/optional/PlayerVehicle";

export default function PcVehicle({ pc, isInteractive = false, onUpdate }) {
  return (
    <PlayerVehicle
      player={pc}
      setPlayer={isInteractive ? onUpdate : undefined}
      isEditMode={isInteractive}
      isCharacterSheet={true}
    />
  );
}
