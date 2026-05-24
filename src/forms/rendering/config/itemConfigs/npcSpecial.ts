import type { GroupLabels, ItemFieldConfig, FieldConfig } from "../fieldConfig";
import type { NpcSpecial } from "../../../schema/itemSchemas/npcSpecial";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
import {
  makePassivesTabField,
  behaviorsTabField,
  behaviorGroupLabels,
  DEFAULT_ITEM_TABS,
} from "../shared/behaviorFields";
import { ITEM_SCOPED_KEYS } from "../shared/itemScopedKeys";

export type NpcSpecialFormState = NpcSpecial & Record<string, unknown>;
const NPC_SPECIAL_LABEL_PREFIX = "npc.special";

export { DEFAULT_ITEM_TABS as npcSpecialTabs };

const G = {
  core: "core",
  body: "body",
} as const;

export const npcSpecialGroupLabels: GroupLabels = {
  core: "section.core",
  meta: "section.meta",
  ...behaviorGroupLabels,
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
  makePassivesTabField(
    ITEM_SCOPED_KEYS.npcSpecial,
  ) as unknown as FieldConfig<NpcSpecialFormState>,
  behaviorsTabField as unknown as FieldConfig<NpcSpecialFormState>,
];
