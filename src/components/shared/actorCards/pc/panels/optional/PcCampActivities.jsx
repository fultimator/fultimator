import PlayerCampActivities from "../../playerSheet/optional/PlayerCampActivities";

export default function PcCampActivities({
  pc,
  isInteractive = false,
  onUpdate,
}) {
  return (
    <PlayerCampActivities
      player={pc}
      setPlayer={isInteractive ? onUpdate : undefined}
      isEditMode={isInteractive}
    />
  );
}
