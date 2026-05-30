import EditPlayerEquipment from "../../../../player/equipment/EditPlayerEquipment";

export default function BackpackTab({ player, setPlayer, isOwner }) {
  return (
    <EditPlayerEquipment
      player={player}
      setPlayer={setPlayer}
      isEditMode={isOwner}
    />
  );
}
