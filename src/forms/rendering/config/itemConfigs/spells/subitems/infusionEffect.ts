import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  makePassivesTabField,
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { SPELL_SUBITEM_SCOPED_KEYS } from "../../../shared/itemScopedKeys";

export type InfusionEffectItemState = {
  name: string;
  effect: string;
  infusionRank: number;
  passives?: unknown[];
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
    makePassivesTabField(SPELL_SUBITEM_SCOPED_KEYS.infusionEffect),
    behaviorsTabField,
  ];
