import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GeneralSection from "./sections/GeneralSection";
import MutantContentSection from "./sections/MutantContentSection";

export default function SpellMutantModal({
  open,
  onClose,
  onSave,
  onDelete,
  mutant,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="mutant"
      spell={mutant}
      sections={[
        {
          id: "content",
          title: "mutant_therioforms",
          component: MutantContentSection,
          props: {},
        },
        {
          id: "general",
          title: "mutant_settings_button",
          component: GeneralSection,
          props: { customFields: [] },
        },
      ]}
    />
  );
}
