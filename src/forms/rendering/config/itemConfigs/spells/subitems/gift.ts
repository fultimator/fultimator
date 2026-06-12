import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableGifts } from "../../../../../../libs/player/spellOptionData";

export type GiftItemState = {
  key: string;
  customName: string;
  event: string;
  effect: string;
  behaviors?: unknown[];
};

const GIFT_OPTIONS = availableGifts.map((g: { name: string }) => ({
  value: g.name,
  label: g.name,
}));

const isCustom = (s: GiftItemState) => s.key === "esper_gift_custom_name";

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

export const giftItemFields: ItemFieldConfig<GiftItemState> = [
  {
    key: "key",
    kind: "editable",
    label: "esper_gift",
    component: "select",
    defaultValue: "esper_gift_custom_name",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 4 },
    componentProps: { options: GIFT_OPTIONS },
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
    key: "event",
    kind: "editable",
    label: "spell.gift.event",
    component: "text",
    defaultValue: "",
    group: "",
    order: 2,
    gridSize: { xs: 12, sm: 4 },
    componentProps: (s) => ({ disabled: !isCustom(s as GiftItemState) }),
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.gift.effect",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 3,
    fullWidth: true,
    componentProps: (s) => ({ disabled: !isCustom(s as GiftItemState) }),
  },
  behaviorsTabField,
];
