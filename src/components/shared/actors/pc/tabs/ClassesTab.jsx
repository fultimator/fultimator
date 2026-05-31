import PcClasses from "../../common/PcClasses";

export default function ClassesTab({ player, setPlayer, isOwner, updateMaxStats }) {
  return (
    <PcClasses
      pc={player}
      variant="full"
      isInteractive={isOwner}
      onUpdate={setPlayer}
      updateMaxStats={updateMaxStats}
      defaultExpanded={!isOwner}
    />
  );
}
