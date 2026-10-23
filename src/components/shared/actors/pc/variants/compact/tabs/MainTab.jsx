import PcCompactLoadout from "/src/components/shared/actors/pc/variants/compact/panels/PcCompactLoadout";

export default function MainTab({
  player,
  setPlayer,
  isEditMode = false,
  searchQuery = "",
}) {
  return (
    <PcCompactLoadout
      pc={player}
      onUpdate={setPlayer}
      isInteractive={isEditMode}
      searchQuery={searchQuery}
    />
  );
}
