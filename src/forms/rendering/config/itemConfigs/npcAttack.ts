import type { GroupLabels, ItemFieldConfig, FieldConfig } from "../fieldConfig";
import type { NpcAttack } from "../../../schema/itemSchemas/npcAttack";
import { metaFieldConfig } from "../metaFieldConfig";
import { typeOptions } from "../typeOptions";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
import {
  behaviorsTabField,
  behaviorGroupLabels,
  DEFAULT_ITEM_TABS,
} from "../shared/behaviorFields";

export type NpcAttackFormState = NpcAttack & Record<string, unknown>;
const NPC_ATTACK_LABEL_PREFIX = "npc.attack";

export { DEFAULT_ITEM_TABS as npcAttackTabs };

const G = {
  core: "core",
  accuracy: "accuracy",
  damage: "damage",
  effect: "effect",
} as const;

export const npcAttackGroupLabels: GroupLabels = {
  core: "section.core",
  accuracy: "section.accuracy",
  damage: "section.damage",
  effect: "section.effect",
  meta: "section.meta",
  ...behaviorGroupLabels,
};

export const npcAttackFieldConfig: ItemFieldConfig<NpcAttackFormState> = [
  {
    key: "itemType",
    kind: "computed",
    label: "shared.itemType",
    defaultValue: "basic",
    group: G.core,
    order: 0,
  },
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(NPC_ATTACK_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: 0,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(NPC_ATTACK_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
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
    label: "shared.range",
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
      category: (s) =>
        s.range === "ranged" ? "Ranged Attack" : "Melee Attack",
    },
  },
  {
    key: "category",
    kind: "computed",
    label: "shared.category",
    defaultValue: "Melee Attack",
    group: G.core,
    order: 4,
  },
  {
    key: "accuracy.attr1",
    kind: "editable",
    label: "shared.accuracy.attr1",
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
    label: "shared.accuracy.attr2",
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
    label: "shared.accuracy.bonus",
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
    label: "shared.accuracy.defense",
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
    label: "shared.damage.value",
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
    label: "shared.damage.type",
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
    label: "shared.damage.hrZero",
    component: "checkbox",
    defaultValue: false,
    group: G.damage,
    order: 22,
    gridSize: { xs: 12, md: 4 },
  },
  {
    key: "description",
    kind: "editable",
    label: prefixedLabel(
      NPC_ATTACK_LABEL_PREFIX,
      SHARED_LABEL_KEYS.description,
    ),
    component: "textarea",
    defaultValue: "",
    group: G.effect,
    order: 29,
    fullWidth: true,
  },
  {
    key: "effect",
    kind: "editable",
    label: prefixedLabel(NPC_ATTACK_LABEL_PREFIX, SHARED_LABEL_KEYS.effect),
    component: "textarea",
    defaultValue: "",
    group: G.effect,
    order: 30,
    fullWidth: true,
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<NpcAttackFormState>),
  behaviorsTabField as unknown as FieldConfig<NpcAttackFormState>,
];
