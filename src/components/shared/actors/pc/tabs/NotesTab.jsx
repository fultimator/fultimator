import { EditPlayerNotes } from "/src/components/shared/actors/pc/editors";

export default function NotesTab({ player, setPlayer, isOwner }) {
  return (
    <EditPlayerNotes
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
    />
  );
}
