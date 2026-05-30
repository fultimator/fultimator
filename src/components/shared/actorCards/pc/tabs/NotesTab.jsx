import EditPlayerNotes from "../../../../player/informations/EditPlayerNotes";

export default function NotesTab({ player, setPlayer, isOwner }) {
  return (
    <EditPlayerNotes
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
    />
  );
}
