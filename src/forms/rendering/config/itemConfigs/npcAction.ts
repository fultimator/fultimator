import type { GroupLabels, ItemFieldConfig, FieldConfig } from "../fieldConfig";
import type { NpcAction } from "../../../schema/itemSchemas/npcAction";
import { metaFieldConfig } from "../metaFieldConfig";
import { SHARED_LABEL_KEYS, prefixedLabel } from "./sharedLabelKeys";
import {
  behaviorsTabField,
  behaviorGroupLabels,
  DEFAULT_ITEM_TABS,
} from "../shared/behaviorFields";

export type NpcActionFormState = NpcAction & Record<string, unknown>;
const NPC_ACTION_LABEL_PREFIX = "npc.action";

export { DEFAULT_ITEM_TABS as npcActionTabs };

const G = {
  core: "core",
  body: "body",
} as const;

export const npcActionGroupLabels: GroupLabels = {
  core: "section.core",
  meta: "section.meta",
  ...behaviorGroupLabels,
};

export const npcActionFieldConfig: ItemFieldConfig<NpcActionFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(NPC_ACTION_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: "",
    group: G.core,
    order: -1,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(NPC_ACTION_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
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
    label: prefixedLabel(NPC_ACTION_LABEL_PREFIX, SHARED_LABEL_KEYS.effect),
    component: "textarea",
    defaultValue: "",
    group: G.body,
    order: 2,
    fullWidth: true,
  },
  ...(metaFieldConfig as unknown as ItemFieldConfig<NpcActionFormState>),
  behaviorsTabField as unknown as FieldConfig<NpcActionFormState>,
];
