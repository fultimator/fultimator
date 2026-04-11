import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GeneralSection from "./sections/GeneralSection";
import GiftContentSection from "./sections/GiftContentSection";

export default function SpellGiftModal({
  open,
  onClose,
  onSave,
  onDelete,
  gift,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="gift"
      spell={gift}
      sections={[
        {
          id: "content",
          title: "esper_gifts",
          component: GiftContentSection,
          props: {},
        },
        {
          id: "general",
          title: "esper_settings_modal",
          component: GeneralSection,
          props: { customFields: [] },
        },
      ]}
    />
  );
}
