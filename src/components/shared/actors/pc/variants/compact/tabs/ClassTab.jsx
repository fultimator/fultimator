import PcClasses from "/src/components/shared/actors/common/PcClasses";

export default function ClassTab({
  player,
  setPlayer,
  isEditMode = false,
  isLocked,
  searchQuery = "",
  defaultExpandAll = false,
}) {
  return (
    <PcClasses
      pc={player}
      variant="compact"
      isInteractive={isEditMode}
      isLocked={isLocked}
      onUpdate={setPlayer}
      searchQuery={searchQuery}
      defaultExpanded={defaultExpandAll}
    />
  );
}
