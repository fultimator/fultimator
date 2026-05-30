import PcCompactLoadout from "../panels/PcCompactLoadout";

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
