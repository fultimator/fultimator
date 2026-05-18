import type { ItemFieldConfig } from "../fieldConfig";
import type { NpcAttack } from "../../../schema/itemSchemas/npcAttack";
import { metaFieldConfig } from "../metaFieldConfig";
import { typeOptions } from "../typeOptions";

export type NpcAttackFormState = NpcAttack;

const G = {
  core: "core",
  accuracy: "accuracy",
  damage: "damage",
  special: "special",
} as const;

export const npcAttackFieldConfig: ItemFieldConfig<NpcAttackFormState> = [
  {
    key: "itemType",
    kind: "computed",
    label: "Item Type",
    defaultValue: "basic",
    group: G.core,
    order: 0,
  },
  {
    key: "fuid",
    kind: "editable",
    label: "ID",
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: 0,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    validationHints: { required: true },
    gridSize: 8,
  },
  {
    key: "range",
    kind: "editable",
    label: "Range",
    component: "select",
    defaultValue: "melee",
    group: G.core,
    order: 3,
    gridSize: 4,
    componentProps: {
      options: [
        { value: "melee", label: "Melee" },
        { value: "ranged", label: "Ranged" },
      ],
    },
    onChangeEffects: {
      category: (s) => (s.range === "ranged" ? "Ranged Attack" : "Melee Attack"),
    },
  },
  {
    key: "category",
    kind: "computed",
    label: "Category",
    defaultValue: "Melee Attack",
    group: G.core,
    order: 4,
  },
  {
    key: "accuracy.attr1",
    kind: "editable",
    label: "Attr 1",
    component: "select",
    defaultValue: "dexterity",
    group: G.accuracy,
    order: 10,
    gridSize: { xs: 6, md: 6 },
    componentProps: {
      options: [
        { value: "dexterity", label: "DEX" },
        { value: "insight", label: "INS" },
        { value: "might", label: "MIG" },
        { value: "will", label: "WLP" },
      ],
    },
  },
  {
    key: "accuracy.attr2",
    kind: "editable",
    label: "Attr 2",
    component: "select",
    defaultValue: "dexterity",
    group: G.accuracy,
    order: 11,
    gridSize: { xs: 6, md: 6 },
    componentProps: {
      options: [
        { value: "dexterity", label: "DEX" },
        { value: "insight", label: "INS" },
        { value: "might", label: "MIG" },
        { value: "will", label: "WLP" },
      ],
    },
  },
  {
    key: "accuracy.value",
    kind: "editable",
    label: "Accuracy Bonus",
    component: "number",
    defaultValue: 0,
    group: G.accuracy,
    order: 12,
    gridSize: { xs: 6, md: 6 },
    parse: (v) => Number(v) || 0,
  },
  {
    key: "accuracy.defense",
    kind: "editable",
    label: "Defense",
    component: "select",
    defaultValue: "def",
    group: G.accuracy,
    order: 13,
    gridSize: { xs: 6, md: 6 },
    componentProps: {
      options: [
        { value: "def", label: "DEF" },
        { value: "mdef", label: "MDEF" },
      ],
    },
  },
  {
    key: "damage.value",
    kind: "editable",
    label: "Damage Value",
    component: "number",
    defaultValue: 0,
    group: G.damage,
    order: 20,
    gridSize: { xs: 6, md: 4 },
    parse: (v) => Number(v) || 0,
  },
  {
    key: "damage.type",
    kind: "editable",
    label: "Damage Type",
    component: "type-select",
    defaultValue: "physical",
    group: G.damage,
    order: 21,
    gridSize: { xs: 6, md: 4 },
    componentProps: { options: typeOptions },
  },
  {
    key: "damage.hrZero",
    kind: "editable",
    label: "HR0",
    component: "checkbox",
    defaultValue: false,
    group: G.damage,
    order: 22,
    gridSize: { xs: 12, md: 4 },
  },
  {
    key: "special",
    kind: "editable",
    label: "Special",
    component: "textarea",
    defaultValue: [],
    group: G.special,
    order: 30,
    fullWidth: true,
    parse: (v) => {
      const text = String(v ?? "").trim();
      return text ? [text] : [];
    },
    format: (v) => (Array.isArray(v) ? String(v[0] ?? "") : String(v ?? "")),
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<NpcAttackFormState>),
];
