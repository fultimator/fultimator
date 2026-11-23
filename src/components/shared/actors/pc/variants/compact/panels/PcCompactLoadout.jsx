import CompactLoadout from "/src/components/shared/actors/pc/playerSheet/CardLoadout";

export default function PcCompactLoadout({
  pc,
  onUpdate,
  isInteractive = false,
  searchQuery = "",
}) {
  return (
    <CompactLoadout
      player={pc}
      setPlayer={onUpdate}
      isEditMode={isInteractive}
      isMainTab={false}
      searchQuery={searchQuery}
      compact
    />
  );
}
