import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";

export type InfusionEffectItemState = {
  name: string;
  effect: string;
  infusionRank: number;
  behaviors?: unknown[];
};

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const infusionEffectItemFields: ItemFieldConfig<InfusionEffectItemState> =
  [
    {
      key: "name",
      kind: "editable",
      label: "Name",
      component: "text",
      defaultValue: "",
      group: "",
      order: 0,
      gridSize: { xs: 12, sm: 6 },
    },
    {
      key: "infusionRank",
      kind: "editable",
      label: "spell.tinkerer.infusionRank",
      component: "select",
      defaultValue: 1,
      group: "",
      order: 1,
      gridSize: { xs: 12, sm: 6 },
      parse: (v) => Number(v) || 1,
      componentProps: {
        options: [
          { value: 1, label: "Basic" },
          { value: 2, label: "Advanced" },
          { value: 3, label: "Superior" },
        ],
      },
    },
    {
      key: "effect",
      kind: "editable",
      label: "Effect",
      component: "textarea",
      defaultValue: "",
      group: "",
      order: 2,
      fullWidth: true,
    },
    behaviorsTabField,
  ];
