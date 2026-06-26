import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import GeneralSection from "/src/components/shared/actors/pc/spells/sections/GeneralSection";
import MutantContentSection from "/src/components/shared/actors/pc/spells/sections/MutantContentSection";

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
