import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  makePassivesTabField,
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { SPELL_SUBITEM_SCOPED_KEYS } from "../../../shared/itemScopedKeys";
import { availableSymbols } from "../../../../../../libs/player/spellOptionData";

export type SymbolItemState = {
  key: string;
  customName: string;
  effect: string;
  passives?: unknown[];
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
  makePassivesTabField(SPELL_SUBITEM_SCOPED_KEYS.symbol),
  behaviorsTabField,
];
