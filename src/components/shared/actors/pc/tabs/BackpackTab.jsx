import { EditPlayerEquipment } from "/src/components/shared/actors/pc/editors";

export default function BackpackTab({ player, setPlayer, isOwner }) {
  return (
    <EditPlayerEquipment
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
    />
  );
}
