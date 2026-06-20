import { EditPlayerSpells } from "/src/components/shared/actors/pc/editors";

export default function SpellsTab({ player, setPlayer, isOwner, defaultExpandAll = false }) {
  return (
    <EditPlayerSpells
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
      defaultExpandAll={defaultExpandAll}
    />
  );
}
