import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  playerSpellFieldConfig,
  playerSpellTabs,
} from "/src/forms/rendering/config/itemConfigs/spells";

const MAGITECH_EXCLUDED_KEYS = new Set(["spellType", "fuid", "name", "class"]);
const magitechFieldConfig = playerSpellFieldConfig.filter(
  (f) => !MAGITECH_EXCLUDED_KEYS.has(f.key),
);

function MagitechSettingsSection({ formState, setFormState }) {
  return (
    <TabbedSchemaFormRenderer
      tabs={playerSpellTabs}
      config={magitechFieldConfig}
      state={{ spellType: "tinkerer-magitech", ...formState }}
      onChange={setFormState}
      surface="edit"
    />
  );
}

export default function SpellTinkererMagitechRankModal({
  open,
  onClose,
  onSave,
  onDelete,
  magitech,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="tinkerer-magitech"
      spell={magitech}
      sections={[
        {
          id: "general",
          title: "esper_settings_modal",
          component: MagitechSettingsSection,
          props: {},
        },
      ]}
    />
  );
}
