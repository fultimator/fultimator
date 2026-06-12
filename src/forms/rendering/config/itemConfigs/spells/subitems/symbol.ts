import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableSymbols } from "../../../../../../libs/player/spellOptionData";

export type SymbolItemState = {
  key: string;
  customName: string;
  effect: string;
  behaviors?: unknown[];
};

const SYMBOL_OPTIONS = availableSymbols.map((s: { name: string }) => ({
  value: s.name,
  label: s.name,
}));

const isCustom = (s: SymbolItemState) => s.key === "symbol_custom_name";

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const symbolItemFields: ItemFieldConfig<SymbolItemState> = [
  {
    key: "key",
    kind: "editable",
    label: "symbol_symbols",
    component: "select",
    defaultValue: "symbol_custom_name",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 6 },
    componentProps: { options: SYMBOL_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "Name",
    component: "text",
    defaultValue: "",
    group: "",
    order: 1,
    gridSize: { xs: 12, sm: 6 },
    dependencies: isCustom,
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.symbol.effect",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 2,
    fullWidth: true,
    componentProps: (s) => ({ disabled: !isCustom(s as SymbolItemState) }),
  },
  behaviorsTabField,
];
