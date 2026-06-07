import PlayerCompanion from "/src/components/shared/actors/pc/playerSheet/optional/PlayerCompanion";

export default function PcCompanion({ pc, isInteractive = false, _onUpdate }) {
  return (
    <PlayerCompanion
      player={pc}
      isEditMode={isInteractive}
    />
  );
}
