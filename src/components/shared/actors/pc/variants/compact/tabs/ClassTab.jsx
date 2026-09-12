import PcClasses from "/src/components/shared/actors/common/PcClasses";

export default function ClassTab({
  player,
  setPlayer,
  isEditMode = false,
  searchQuery = "",
  defaultExpandAll = false,
}) {
  return (
    <PcClasses
      pc={player}
      variant="compact"
      isInteractive={isEditMode}
      onUpdate={setPlayer}
      searchQuery={searchQuery}
      defaultExpanded={defaultExpandAll}
    />
  );
}
