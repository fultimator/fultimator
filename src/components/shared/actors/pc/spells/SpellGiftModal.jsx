import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import GeneralSection from "/src/components/shared/actors/pc/spells/sections/GeneralSection";
import GiftContentSection from "/src/components/shared/actors/pc/spells/sections/GiftContentSection";

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
