import UnifiedSpellModal from "./modals/UnifiedSpellModal";
import GeneralSection from "./sections/GeneralSection";
import MagichantKeysContentSection from "./sections/MagichantKeysContentSection";
import MagichantTonesContentSection from "./sections/MagichantTonesContentSection";

export default function SpellChanterTonesModal({
  open,
  onClose,
  onSave,
  onDelete,
  magichant,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="magichant"
      spell={magichant}
      initialSectionId="tones"
      sections={[
        {
          id: "keys",
          title: "magichant_edit_keys_button",
          component: MagichantKeysContentSection,
          props: {},
          order: 0,
        },
        {
          id: "tones",
          title: "magichant_edit_tones_button",
          component: MagichantTonesContentSection,
          props: {},
          order: 1,
        },
        {
          id: "general",
          title: "magichant_settings_button",
          component: GeneralSection,
          props: { customFields: [] },
          order: 2,
        },
      ]}
    />
  );
}
