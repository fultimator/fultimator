import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import InfusionEffectsContentSection from "/src/components/shared/actors/pc/spells/sections/InfusionEffectsContentSection";

const infusionSettingsFields = [
  {
    key: "rank",
    kind: "editable",
    label: "Select Rank",
    component: "select",
    defaultValue: 1,
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 6 },
    parse: (v) => Number(v) || 1,
    componentProps: {
      options: [
        { value: 1, label: "Basic" },
        { value: 2, label: "Advanced" },
        { value: 3, label: "Superior" },
      ],
    },
  },
  {
    key: "showInPlayerSheet",
    kind: "editable",
    label: "Show in Character Sheet",
    component: "checkbox",
    defaultValue: true,
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 6 },
  },
];

function InfusionSettingsSection({ formState, setFormState }) {
  return (
    <TabbedSchemaFormRenderer
      tabs={[]}
      config={infusionSettingsFields}
      state={formState}
      onChange={setFormState}
      surface="edit"
      cols={2}
    />
  );
}

const INFUSION_SECTIONS = [
  {
    id: "effects",
    title: "Infusions",
    component: InfusionEffectsContentSection,
    props: {},
    order: 0,
  },
  {
    id: "settings",
    title: "Settings",
    component: InfusionSettingsSection,
    props: {},
    order: 1,
  },
];

export default function SpellTinkererInfusionModal({
  open,
  onClose,
  onSave,
  onDelete,
  infusion,
}) {
  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      spellType="tinkerer-infusion"
      spell={infusion}
      sections={INFUSION_SECTIONS}
      initialSectionId="effects"
    />
  );
}
