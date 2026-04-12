import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import MagiseedGeneralSection from "./sections/MagiseedGeneralSection";
import MagiseedContentSection from "./sections/MagiseedContentSection";

export default function SpellMagiseedModal({
  open,
  onClose,
  onSave,
  onDelete,
  magiseed,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="magiseed"
      spell={magiseed}
      sections={[
        {
          id: "content",
          title: "magiseed_edit_magiseeds_button",
          component: MagiseedContentSection,
          props: {},
        },
        {
          id: "general",
          title: "magiseed_settings_button",
          component: MagiseedGeneralSection,
          props: {},
        },
      ]}
    />
  );
}
