import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { magiseeds } from "../../../../../../libs/floralistMagiseedData";

export type MagiseedItemState = {
  key: string;
  customName: string;
  description: string;
  rangeStart: number;
  rangeEnd: number;
  effects: Record<number, string>;
  behaviors?: unknown[];
};

const MAGISEED_OPTIONS = (magiseeds as Array<{ name: string }>).map((m) => ({
  value: m.name,
  label: m.name,
}));

const isCustom = (s: MagiseedItemState) => s.key === "magiseed_custom";

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

const effectField = (
  dotKey: `effects.${number}`,
  label: string,
  order: number,
  rangeIndex: number,
): ItemFieldConfig<MagiseedItemState> => [
  {
    key: dotKey,
    kind: "editable",
    label,
    component: "textarea",
    defaultValue: "",
    group: "effects",
    order,
    gridSize: { xs: 12, sm: 6 },
    dependencies: (s) =>
      isCustom(s as MagiseedItemState) &&
      (s.rangeStart as number) <= rangeIndex &&
      (s.rangeEnd as number) >= rangeIndex,
  },
  {
    key: dotKey,
    kind: "editable",
    label,
    component: "readonly-markdown",
    defaultValue: "",
    group: "effects",
    order,
    gridSize: { xs: 12, sm: 6 },
    dependencies: (s) =>
      !isCustom(s as MagiseedItemState) &&
      (s.rangeStart as number) <= rangeIndex &&
      (s.rangeEnd as number) >= rangeIndex,
  },
];

export const magiseedItemFields: ItemFieldConfig<MagiseedItemState> = [
  {
    key: "key",
    kind: "editable",
    label: "spell.magiseed.type",
    component: "select",
    defaultValue: "magiseed_custom",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 6 },
    componentProps: { options: MAGISEED_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "spell.magiseed.customName",
    component: "text",
    defaultValue: "",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 6 },
    dependencies: isCustom,
  },
  {
    key: "rangeStart",
    kind: "editable",
    label: "spell.magiseed.rangeStart",
    component: "number",
    defaultValue: 0,
    group: "",
    order: 2,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => parseInt(String(v)) || 0,
  },
  {
    key: "rangeEnd",
    kind: "editable",
    label: "spell.magiseed.rangeEnd",
    component: "number",
    defaultValue: 3,
    group: "",
    order: 3,
    gridSize: { xs: 6, sm: 3 },
    parse: (v) => parseInt(String(v)) || 3,
  },
  {
    key: "description",
    kind: "editable",
    label: "spell.magiseed.description",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 4,
    fullWidth: true,
    dependencies: isCustom,
  },
  {
    key: "description",
    kind: "editable",
    label: "spell.magiseed.description",
    component: "readonly-markdown",
    defaultValue: "",
    group: "",
    order: 4,
    fullWidth: true,
    dependencies: (s) => !isCustom(s as MagiseedItemState),
  },
  ...effectField("effects.0", "spell.magiseed.effect0", 10, 0),
  ...effectField("effects.1", "spell.magiseed.effect1", 11, 1),
  ...effectField("effects.2", "spell.magiseed.effect2", 12, 2),
  ...effectField("effects.3", "spell.magiseed.effect3", 13, 3),
  behaviorsTabField,
];
