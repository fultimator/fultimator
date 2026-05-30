import PlayerZeroPower from "../../playerSheet/optional/PlayerZeroPower";

export default function PcZeroPower({ pc, isInteractive = false, onUpdate }) {
  return (
    <PlayerZeroPower
      player={pc}
      setPlayer={isInteractive ? onUpdate : undefined}
      isEditMode={isInteractive}
    />
  );
}
