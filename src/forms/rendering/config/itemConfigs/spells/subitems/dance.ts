import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableDances } from "../../../../../../libs/player/spellOptionData";

export type DanceItemState = {
  key: string;
  customName: string;
  duration: string;
  effect: string;
  behaviors?: unknown[];
};

const DANCE_OPTIONS = availableDances.map((d: { name: string }) => ({
  value: d.name,
  label: d.name,
}));

const isCustom = (s: DanceItemState) => s.key === "dance_custom_name";

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const danceItemFields: ItemFieldConfig<DanceItemState> = [
  {
    key: "key",
    kind: "editable",
    label: "dance_dance",
    component: "select",
    defaultValue: "dance_custom_name",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 4 },
    componentProps: { options: DANCE_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 4 },
    dependencies: isCustom,
  },
  {
    key: "duration",
    kind: "editable",
    label: "Duration",
    component: "text",
    defaultValue: "",
    group: "",
    order: 2,
    fullWidth: true,
    dependencies: isCustom,
  },
  {
    key: "duration",
    kind: "editable",
    label: "Duration",
    component: "readonly-markdown",
    defaultValue: "",
    group: "",
    order: 2,
    fullWidth: true,
    dependencies: (s) => !isCustom(s as DanceItemState),
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.dance.effect",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 3,
    fullWidth: true,
    dependencies: isCustom,
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.dance.effect",
    component: "readonly-markdown",
    defaultValue: "",
    group: "",
    order: 3,
    fullWidth: true,
    dependencies: (s) => !isCustom(s as DanceItemState),
  },
  behaviorsTabField,
];
