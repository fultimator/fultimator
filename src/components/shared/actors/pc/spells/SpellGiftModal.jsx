import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import GiftContentSection from "/src/components/shared/actors/pc/spells/sections/GiftContentSection";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  playerSpellFieldConfig,
  playerSpellTabs,
} from "/src/forms/rendering/config/itemConfigs/spells";

const GIFT_EXCLUDED_KEYS = new Set(["spellType", "fuid", "class"]);
const giftFieldConfig = playerSpellFieldConfig.filter(
  (f) => !GIFT_EXCLUDED_KEYS.has(f.key),
);

function GiftSettingsSection({ formState, setFormState }) {
  return (
    <TabbedSchemaFormRenderer
      tabs={playerSpellTabs}
      config={giftFieldConfig}
      state={{ spellType: "gift", ...formState }}
      onChange={setFormState}
      surface="edit"
    />
  );
}

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
          component: GiftSettingsSection,
          props: {},
        },
      ]}
    />
  );
}
