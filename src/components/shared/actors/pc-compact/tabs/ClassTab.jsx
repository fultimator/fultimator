import PcClasses from "../../common/PcClasses";

export default function ClassTab({
  player,
  setPlayer,
  isEditMode = false,
  searchQuery = "",
}) {
  return (
    <PcClasses
      pc={player}
      variant="compact"
      isInteractive={isEditMode}
      onUpdate={setPlayer}
      searchQuery={searchQuery}
    />
  );
}
