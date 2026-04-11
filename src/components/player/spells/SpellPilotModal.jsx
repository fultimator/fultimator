import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import PilotGeneralSection from "./sections/PilotGeneralSection";
import PilotContentSection from "./sections/PilotContentSection";

function normalizePilotSpell(pilot) {
  if (!pilot) return pilot;

  // Some callers may pass { spell, classIndex, spellIndex } instead of the spell itself.
  const base = pilot.spell ? { ...pilot.spell, index: pilot.spell.index ?? pilot.index } : pilot;

  // Ensure we have vehicles in the right place
  let vehicles = base.vehicles || base.currentVehicles;

  // If still no vehicles, try to find them in nested structures
  if (!vehicles && base.pilot?.vehicles) {
    vehicles = base.pilot.vehicles;
  }

  // Return with vehicles guaranteed at root level
  return {
    ...base,
    vehicles: Array.isArray(vehicles) ? vehicles : (base.vehicles || base.currentVehicles || []),
  };
}

export default function SpellPilotModal({
  open,
  onClose,
  onSave,
  onDelete,
  pilot,
}) {
  const normalizedPilot = normalizePilotSpell(pilot);

  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="pilot"
      spell={normalizedPilot}
      sections={[
        {
          id: "content",
          title: "pilot_vehicles",
          component: PilotContentSection,
          props: {},
        },
        {
          id: "general",
          title: "pilot_settings_button",
          component: PilotGeneralSection,
          props: {},
        },
      ]}
    />
  );
}
