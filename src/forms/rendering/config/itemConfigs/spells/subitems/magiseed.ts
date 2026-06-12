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

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

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
    dependencies: (s) => s.key === "magiseed_custom",
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
    componentProps: (s) => ({ disabled: s.key !== "magiseed_custom" }),
  },
  {
    key: "effects.0",
    kind: "editable",
    label: "spell.magiseed.effect0",
    component: "textarea",
    defaultValue: "",
    group: "effects",
    order: 10,
    gridSize: { xs: 12, sm: 6 },
    dependencies: (s) =>
      (s.rangeStart as number) <= 0 && (s.rangeEnd as number) >= 0,
    componentProps: (s) => ({ disabled: s.key !== "magiseed_custom" }),
  },
  {
    key: "effects.1",
    kind: "editable",
    label: "spell.magiseed.effect1",
    component: "textarea",
    defaultValue: "",
    group: "effects",
    order: 11,
    gridSize: { xs: 12, sm: 6 },
    dependencies: (s) =>
      (s.rangeStart as number) <= 1 && (s.rangeEnd as number) >= 1,
    componentProps: (s) => ({ disabled: s.key !== "magiseed_custom" }),
  },
  {
    key: "effects.2",
    kind: "editable",
    label: "spell.magiseed.effect2",
    component: "textarea",
    defaultValue: "",
    group: "effects",
    order: 12,
    gridSize: { xs: 12, sm: 6 },
    dependencies: (s) =>
      (s.rangeStart as number) <= 2 && (s.rangeEnd as number) >= 2,
    componentProps: (s) => ({ disabled: s.key !== "magiseed_custom" }),
  },
  {
    key: "effects.3",
    kind: "editable",
    label: "spell.magiseed.effect3",
    component: "textarea",
    defaultValue: "",
    group: "effects",
    order: 13,
    gridSize: { xs: 12, sm: 6 },
    dependencies: (s) =>
      (s.rangeStart as number) <= 3 && (s.rangeEnd as number) >= 3,
    componentProps: (s) => ({ disabled: s.key !== "magiseed_custom" }),
  },
  behaviorsTabField,
];
