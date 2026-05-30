import EditPlayerSpells from "../../../../player/spells/EditPlayerSpells";

export default function SpellsTab({ player, setPlayer, isOwner }) {
  return (
    <EditPlayerSpells
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
    />
  );
}
