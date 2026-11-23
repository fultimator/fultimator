import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import UnifiedSpellModal from "/src/components/shared/actors/pc/spells/modals/UnifiedSpellModal";
import AlchemyTargetsContentSection from "/src/components/shared/actors/pc/spells/sections/AlchemyTargetsContentSection";
import AlchemyEffectsContentSection from "/src/components/shared/actors/pc/spells/sections/AlchemyEffectsContentSection";

const alchemySettingsFields = [
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

function AlchemySettingsSection({ formState, setFormState }) {
  return (
    <TabbedSchemaFormRenderer
      tabs={[]}
      config={alchemySettingsFields}
      state={formState}
      onChange={setFormState}
      surface="edit"
      cols={2}
    />
  );
}

const ALCHEMY_SECTIONS = [
  {
    id: "targets",
    title: "Targets",
    component: AlchemyTargetsContentSection,
    props: {},
    order: 0,
  },
  {
    id: "effects",
    title: "Effects",
    component: AlchemyEffectsContentSection,
    props: {},
    order: 1,
  },
  {
    id: "settings",
    title: "Settings",
    component: AlchemySettingsSection,
    props: {},
    order: 2,
  },
];

function getEffectsValidationError(effects) {
  const usedValues = effects.map(({ dieValue }) => dieValue);
  const uniqueValues = new Set(usedValues.filter((value) => value !== 0));
  return usedValues.filter((value) => value !== 0).length !== uniqueValues.size;
}

function getTargetsValidationError(targets) {
  const ranges = targets.map(({ rangeFrom, rangeTo }) => ({
    rangeFrom,
    rangeTo,
  }));
  const flatRanges = ranges.flatMap(({ rangeFrom, rangeTo }) => {
    const rangeArray = [];
    for (let i = rangeFrom; i <= rangeTo; i++) {
      rangeArray.push(i);
    }
    return rangeArray;
  });

  const hasOverlap = flatRanges.some(
    (value, index, array) => array.indexOf(value) !== index,
  );

  return (
    hasOverlap ||
    flatRanges.length < 20 ||
    new Set(flatRanges).size !== 20 ||
    targets.length < 2
  );
}

function normalizeAlchemyPayload(payload) {
  const effects = payload.effects || [];
  const anyDieEffects = effects.filter((effect) => effect.dieValue === 0);
  const specificDieEffects = effects
    .filter((effect) => effect.dieValue !== 0)
    .sort((a, b) => a.dieValue - b.dieValue);
  const targets = [...(payload.targets || [])].sort(
    (a, b) => a.rangeFrom - b.rangeFrom,
  );

  return {
    ...payload,
    effects: [...anyDieEffects, ...specificDieEffects],
    targets,
  };
}

export default function SpellTinkererAlchemyModal({
  open,
  onClose,
  onSave,
  onDelete,
  alchemy,
  initialSectionId = "targets",
}) {
  const handleSave = (spellIndex, payload) => {
    const normalized = normalizeAlchemyPayload(payload);
    if (
      getEffectsValidationError(normalized.effects) ||
      getTargetsValidationError(normalized.targets)
    ) {
      return;
    }
    onSave(spellIndex, normalized);
  };

  return (
    <UnifiedSpellModal
      open={open}
      onClose={onClose}
      onSave={handleSave}
      onDelete={onDelete}
      spellType="tinkerer-alchemy"
      spell={alchemy}
      sections={ALCHEMY_SECTIONS}
      initialSectionId={initialSectionId}
    />
  );
}
