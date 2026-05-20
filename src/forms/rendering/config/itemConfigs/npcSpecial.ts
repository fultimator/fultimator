import type { GroupLabels, ItemFieldConfig } from "../fieldConfig";
import type { NpcSpecial } from "../../../schema/itemSchemas/npcSpecial";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";

export type NpcSpecialFormState = NpcSpecial;
const NPC_SPECIAL_LABEL_PREFIX = "npc.special";

const G = {
  core: "core",
  body: "body",
} as const;

export const npcSpecialGroupLabels: GroupLabels = {
  core: "section.core",
  meta: "section.meta",
};

export const npcSpecialFieldConfig: ItemFieldConfig<NpcSpecialFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(NPC_SPECIAL_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(NPC_SPECIAL_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 0,
    validationHints: { required: true },
    gridSize: "grow",
  },
  {
    key: "spCost",
    kind: "editable",
    label: "shared.spCost",
    component: "number",
    defaultValue: 1,
    group: G.core,
    order: 1,
    gridSize: 4,
    parse: (v) => Number(v) || 0,
    validationHints: { min: 0 },
  },
  {
    key: "effect",
    kind: "editable",
    label: prefixedLabel(NPC_SPECIAL_LABEL_PREFIX, SHARED_LABEL_KEYS.effect),
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 2,
    fullWidth: true,
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<NpcSpecialFormState>),
];
