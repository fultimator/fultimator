import type { ItemFieldConfig } from "../fieldConfig";
import type { ArmorPersisted } from "../../../schema/itemSchemas/armor";
import armor from "../../../../libs/armor";
import qualities from "../../../../routes/equip/ArmorShield/qualities";
import groupBy from "../../../../libs/groupby";
import type { SelectOption, SelectGroup } from "../../fieldRenderers";

interface ArmorBase {
  name: string;
  cost: number;
  def: number;
  mdef: number;
  martial: boolean;
  init: number;
  category: string;
}

export type ArmorFormState = Omit<ArmorPersisted, "base"> & {
  base: ArmorBase | undefined;
};

const armorOptions: SelectOption[] = (armor as ArmorBase[]).map((a) => ({
  value: a.name,
  label: a.name,
}));

const qualityGroups: SelectGroup[] = Object.entries(
  groupBy(qualities, "category") as Record<
    string,
    { name: string; cost: number; quality: string; category: string }[]
  >,
).map(([category, qs]) => ({
  header: category,
  options: qs.map((q) => ({ value: q.name, label: `${q.name} (${q.cost}z)` })),
}));

const G = {
  core: "core",
  quality: "quality",
  slots: "slots",
  modifiers: "modifiers",
  meta: "meta",
} as const;

export const armorFieldConfig: ItemFieldConfig<ArmorFormState> = [
  {
    key: "base",
    kind: "form-state",
    label: "armor.base",
    component: "select",
    defaultValue: undefined,
    group: G.core,
    order: 0,
    componentProps: { options: armorOptions },
    format: (v) => (v as ArmorBase | undefined)?.name ?? "",
    parse: (v) => {
      return (
        (armor as ArmorBase[]).find((a) => a.name === v) ??
        (armor as ArmorBase[])[0]
      );
    },
    onChangeEffects: {
      name: (s) => s.base?.name ?? s.name,
      martial: (s) => s.base?.martial ?? s.martial,
      def: (s) => s.base?.def ?? s.def,
      mdef: (s) => s.base?.mdef ?? s.mdef,
      init: (s) => s.base?.init ?? s.init,
      cost: (s) => (s.base?.cost ?? 0) + (Number(s.qualityCost) || 0),
    },
  },
  {
    key: "name",
    kind: "editable",
    label: "armor.name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
  },
  {
    key: "martial",
    kind: "editable",
    label: "armor.martial",
    component: "checkbox",
    defaultValue: false,
    group: G.core,
    order: 2,
  },
  {
    key: "rework",
    kind: "editable",
    label: "armor.rework",
    component: "checkbox",
    defaultValue: false,
    group: G.core,
    order: 3,
  },
  // Quality — hidden when technospheres slots variant is active
  {
    key: "selectedQuality",
    kind: "form-state",
    label: "armor.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.quality,
    order: 10,
    dependencies: (s) => !s.isSlotsVariant,
    componentProps: { groups: qualityGroups, allowClear: true },
    onChangeEffects: {
      quality: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        return q?.quality ?? s.quality;
      },
      qualityCost: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        return q?.cost ?? s.qualityCost;
      },
      cost: (s) => {
        const q = qualities.find(
          (el: { name: string }) => el.name === s.selectedQuality,
        );
        const qCost = q?.cost ?? s.qualityCost;
        return (s.base?.cost ?? 0) + (Number(qCost) || 0);
      },
    },
  },
  {
    key: "qualityCost",
    kind: "form-state",
    label: "armor.quality.cost",
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 11,
    dependencies: (s) => !s.isSlotsVariant,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
    onChangeEffects: {
      cost: (s) => (s.base?.cost ?? 0) + (Number(s.qualityCost) || 0),
    },
  },
  {
    key: "quality",
    kind: "editable",
    label: "armor.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 12,
    dependencies: (s) => !s.isSlotsVariant,
    fullWidth: true,
  },
  // Slots — shown only when technospheres slots variant is active
  {
    key: "slots",
    kind: "editable",
    label: "armor.slots",
    component: "slot-tier-picker",
    defaultValue: "alpha",
    group: G.slots,
    order: 20,
    dependencies: (s) => s.isSlotsVariant === true,
    componentProps: { isWeapon: false },
  },
  {
    key: "slotted",
    kind: "editable",
    label: "armor.slotted",
    component: "slot-editor",
    defaultValue: [],
    group: G.slots,
    order: 21,
    dependencies: (s) => s.isSlotsVariant === true,
    fullWidth: true,
  },
  {
    key: "defModifier",
    kind: "editable",
    label: "armor.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 30,
    onChangeEffects: {
      "modifiers.def": (s) => s.defModifier,
    },
  },
  {
    key: "mDefModifier",
    kind: "editable",
    label: "armor.modifiers.mdef",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 31,
    onChangeEffects: {
      "modifiers.mdef": (s) => s.mDefModifier,
    },
  },
  {
    key: "initModifier",
    kind: "editable",
    label: "armor.modifiers.init",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 32,
    onChangeEffects: {
      "modifiers.init": (s) => s.initModifier,
    },
  },
  {
    key: "magicModifier",
    kind: "editable",
    label: "armor.modifiers.magic",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 33,
    onChangeEffects: {
      "modifiers.magic": (s) => s.magicModifier,
    },
  },
  {
    key: "precModifier",
    kind: "editable",
    label: "armor.modifiers.accuracy",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 34,
    onChangeEffects: {
      "modifiers.accuracy": (s) => s.precModifier,
    },
  },
  {
    key: "damageMeleeModifier",
    kind: "editable",
    label: "armor.modifiers.damageMelee",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 35,
    onChangeEffects: {
      "modifiers.damageMelee": (s) => s.damageMeleeModifier,
    },
  },
  {
    key: "damageRangedModifier",
    kind: "editable",
    label: "armor.modifiers.damageRanged",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 36,
    onChangeEffects: {
      "modifiers.damageRanged": (s) => s.damageRangedModifier,
    },
  },
  {
    key: "cost",
    kind: "computed",
    label: "armor.cost",
    component: "readonly-number",
    group: G.meta,
    order: 40,
  },
  {
    key: "isSlotsVariant",
    kind: "form-state",
    label: "armor.isSlotsVariant",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 41,
  },
  {
    key: "isEquipped",
    kind: "form-state",
    label: "armor.isEquipped",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 42,
  },
];
