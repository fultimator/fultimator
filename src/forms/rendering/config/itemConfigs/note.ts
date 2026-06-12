import type { ItemFieldConfig, GroupLabels, FieldConfig } from "../fieldConfig";
import type { Note } from "../../../schema/itemSchemas/note";
import { SHARED_LABEL_KEYS } from "./sharedLabelKeys";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../shared/behaviorFields";

export type NoteFormState = Note;

const G = { core: "core" } as const;

export { DEFAULT_ITEM_TABS as noteTabs };

export const noteGroupLabels: GroupLabels = {
  core: "section.core",
};

export const noteFieldConfig: ItemFieldConfig<NoteFormState> = [
  {
    key: "fuid",
    kind: "editable",
    label: SHARED_LABEL_KEYS.fuid,
    component: "fuid",
    defaultValue: undefined,
    group: G.core,
    order: 0,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: SHARED_LABEL_KEYS.name,
    component: "text",
    defaultValue: "",
    group: G.core,
    order: 1,
    gridSize: 12,
    componentProps: { maxLength: 100, autoFocus: true },
    validationHints: { required: false },
  },
  {
    key: "description",
    kind: "editable",
    label: SHARED_LABEL_KEYS.description,
    component: "textarea",
    defaultValue: "",
    group: G.core,
    order: 2,
    gridSize: 12,
    componentProps: { maxLength: 2000 },
  },
  {
    key: "effect",
    kind: "editable",
    label: SHARED_LABEL_KEYS.effect,
    component: "textarea",
    defaultValue: "",
    group: G.core,
    order: 3,
    gridSize: 12,
    componentProps: { maxLength: 2000 },
  },
  behaviorsTabField as unknown as FieldConfig<NoteFormState>,
];
