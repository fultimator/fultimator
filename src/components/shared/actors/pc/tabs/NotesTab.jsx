import PlayerNotes from "../playerSheet/PlayerNotes";

export default function NotesTab({ player, setPlayer, isOwner }) {
  return (
    <PlayerNotes
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
      showAll
    />
  );
}
