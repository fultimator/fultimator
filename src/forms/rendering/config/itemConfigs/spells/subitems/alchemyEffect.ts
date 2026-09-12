import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";

export type AlchemyEffectItemState = {
  dieValue: number;
  effect: string;
  behaviors?: unknown[];
};

const dieOptions = [
  { value: 0, label: "Any" },
  ...Array.from({ length: 20 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  })),
];

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const alchemyEffectItemFields: ItemFieldConfig<AlchemyEffectItemState> =
  [
    {
      key: "dieValue",
      kind: "editable",
      label: "Die",
      component: "select",
      defaultValue: 0,
      group: "",
      order: 0,
      gridSize: { xs: 12, sm: 4 },
      parse: (v) => Number(v) || 0,
      componentProps: { options: dieOptions },
    },
    {
      key: "effect",
      kind: "editable",
      label: "Effect",
      component: "textarea",
      defaultValue: "",
      group: "",
      order: 1,
      fullWidth: true,
    },
    behaviorsTabField,
  ];
