import PlayerOthers from "../../playerSheet/optional/PlayerOthers";

export default function PcOthers({ pc, isInteractive = false, onUpdate }) {
  return (
    <PlayerOthers
      player={pc}
      setPlayer={isInteractive ? onUpdate : undefined}
      isEditMode={isInteractive}
      isCharacterSheet={true}
    />
  );
}
