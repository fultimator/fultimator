import type { ItemFieldConfig } from "../fieldConfig";
import type { ShieldPersisted } from "../../../schema/itemSchemas/shield";
import shields from "../../../../libs/shields";
import qualities from "../../../../routes/equip/ArmorShield/qualities";
import groupBy from "../../../../libs/groupby";
import type { SelectOption, SelectGroup } from "../../fieldRenderers";

interface ShieldBase {
  name: string;
  cost: number;
  def: number;
  mdef: number;
  martial: boolean;
  init: number;
  category: string;
}

export type ShieldFormState = Omit<ShieldPersisted, "base"> & {
  base: ShieldBase | undefined;
};

const shieldOptions: SelectOption[] = (shields as ShieldBase[]).map((s) => ({
  value: s.name,
  label: s.name,
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
  modifiers: "modifiers",
  meta: "meta",
} as const;

export const shieldFieldConfig: ItemFieldConfig<ShieldFormState> = [
  {
    key: "base",
    kind: "form-state",
    label: "shield.base",
    component: "select",
    defaultValue: undefined,
    group: G.core,
    order: 0,
    componentProps: { options: shieldOptions },
    format: (v) => (v as ShieldBase | undefined)?.name ?? "",
    parse: (v) => {
      return (
        (shields as ShieldBase[]).find((s) => s.name === v) ??
        (shields as ShieldBase[])[0]
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
    label: "shield.name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
  },
  {
    key: "martial",
    kind: "editable",
    label: "shield.martial",
    component: "checkbox",
    defaultValue: false,
    group: G.core,
    order: 2,
  },
  {
    key: "rework",
    kind: "editable",
    label: "shield.rework",
    component: "checkbox",
    defaultValue: false,
    group: G.core,
    order: 3,
  },
  {
    key: "selectedQuality",
    kind: "form-state",
    label: "shield.quality.preset",
    component: "grouped-select",
    defaultValue: "",
    group: G.quality,
    order: 10,
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
    label: "shield.quality.cost",
    component: "number",
    defaultValue: 0,
    group: G.quality,
    order: 11,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
    onChangeEffects: {
      cost: (s) => (s.base?.cost ?? 0) + (Number(s.qualityCost) || 0),
    },
  },
  {
    key: "quality",
    kind: "editable",
    label: "shield.quality.text",
    component: "textarea",
    defaultValue: "",
    group: G.quality,
    order: 12,
    fullWidth: true,
  },
  {
    key: "defModifier",
    kind: "editable",
    label: "shield.modifiers.def",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 20,
    onChangeEffects: {
      "modifiers.def": (s) => s.defModifier,
    },
  },
  {
    key: "mDefModifier",
    kind: "editable",
    label: "shield.modifiers.mdef",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 21,
    onChangeEffects: {
      "modifiers.mdef": (s) => s.mDefModifier,
    },
  },
  {
    key: "initModifier",
    kind: "editable",
    label: "shield.modifiers.init",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 22,
    onChangeEffects: {
      "modifiers.init": (s) => s.initModifier,
    },
  },
  {
    key: "magicModifier",
    kind: "editable",
    label: "shield.modifiers.magic",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 23,
    onChangeEffects: {
      "modifiers.magic": (s) => s.magicModifier,
    },
  },
  {
    key: "precModifier",
    kind: "editable",
    label: "shield.modifiers.accuracy",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 24,
    onChangeEffects: {
      "modifiers.accuracy": (s) => s.precModifier,
    },
  },
  {
    key: "damageMeleeModifier",
    kind: "editable",
    label: "shield.modifiers.damageMelee",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 25,
    onChangeEffects: {
      "modifiers.damageMelee": (s) => s.damageMeleeModifier,
    },
  },
  {
    key: "damageRangedModifier",
    kind: "editable",
    label: "shield.modifiers.damageRanged",
    component: "number",
    defaultValue: 0,
    group: G.modifiers,
    order: 26,
    onChangeEffects: {
      "modifiers.damageRanged": (s) => s.damageRangedModifier,
    },
  },
  {
    key: "cost",
    kind: "computed",
    label: "shield.cost",
    component: "readonly-number",
    group: G.meta,
    order: 30,
  },
  {
    key: "isEquipped",
    kind: "form-state",
    label: "shield.isEquipped",
    component: "checkbox",
    defaultValue: false,
    group: G.meta,
    order: 31,
  },
];
