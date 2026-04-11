import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GeneralSection from "./sections/GeneralSection";
import DancerContentSection from "./sections/DancerContentSection";

export default function SpellDancerModal({
  open,
  onClose,
  onSave,
  onDelete,
  dance,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="dancer"
      spell={dance}
      sections={[
        {
          id: "content",
          title: "dance_edit_dances_button",
          component: DancerContentSection,
          props: {},
        },
        {
          id: "general",
          title: "dance_settings_button",
          component: GeneralSection,
          props: { customFields: [] },
        },
      ]}
    />
  );
}
