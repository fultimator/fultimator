import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import GeneralSection from "/src/components/shared/actors/pc/spells/sections/GeneralSection";
import SymbolistContentSection from "/src/components/shared/actors/pc/spells/sections/SymbolistContentSection";

export default function SpellSymbolistModal({
  open,
  onClose,
  onSave,
  onDelete,
  symbol,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="symbolist"
      spell={symbol}
      sections={[
        {
          id: "content",
          title: "symbol_edit_symbols_button",
          component: SymbolistContentSection,
          props: {},
        },
        {
          id: "general",
          title: "symbol_settings_button",
          component: GeneralSection,
          props: { customFields: [] },
        },
      ]}
    />
  );
}
