import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isGift } from "./predicates";

export const giftFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "event",
    kind: "editable",
    label: "spell.gift.event",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 65,
    fullWidth: true,
    dependencies: isGift,
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.gift.effect",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 70,
    fullWidth: true,
    dependencies: isGift,
  },
  {
    key: "description",
    kind: "editable",
    label: "spell.gift.description",
    component: "textarea",
    defaultValue: "",
    group: "description",
    order: 80,
    fullWidth: true,
    dependencies: isGift,
  },
];
