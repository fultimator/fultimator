import PlayerRituals from "/src/components/shared/actors/pc/playerSheet/optional/PlayerRituals";

export default function PcRituals({
  pc,
  isInteractive = false,
  clockSections,
  setClockSections,
  clockState,
  setClockState,
}) {
  return (
    <PlayerRituals
      player={pc}
      isEditMode={isInteractive}
      isCharacterSheet={true}
      clockSections={clockSections}
      setClockSections={setClockSections}
      clockState={clockState}
      setClockState={setClockState}
    />
  );
}
