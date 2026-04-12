import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GeneralSection from "./sections/GeneralSection";
import SymbolistContentSection from "./sections/SymbolistContentSection";

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
