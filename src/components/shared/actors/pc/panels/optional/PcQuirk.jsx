import PlayerQuirk from "/src/components/shared/actors/pc/playerSheet/optional/PlayerQuirk";

export default function PcQuirk({ pc, isInteractive = false, onUpdate }) {
  return (
    <PlayerQuirk
      player={pc}
      setPlayer={isInteractive ? onUpdate : undefined}
      isEditMode={isInteractive}
    />
  );
}
