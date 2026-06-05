import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isWellspring } from "./predicates";
import { AFFINITY_ICON_OPTIONS, affinityIconSrc } from "/src/libs/player/wellsprings";

const ICON_OPTIONS = AFFINITY_ICON_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
  icon: affinityIconSrc(o.value),
}));

export const wellspringFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "color",
    kind: "editable",
    label: "spell.wellspring.color",
    component: "color",
    defaultValue: "#888888",
    group: "effect",
    order: 70,
    gridSize: { xs: 12, sm: 4 },
    dependencies: isWellspring,
  },
  {
    key: "textColor",
    kind: "editable",
    label: "spell.wellspring.textColor",
    component: "select",
    defaultValue: "white",
    group: "effect",
    order: 71,
    gridSize: { xs: 12, sm: 4 },
    dependencies: isWellspring,
    componentProps: {
      options: [
        { value: "white", label: "White" },
        { value: "black", label: "Black" },
      ],
    },
  },
  {
    key: "icon",
    kind: "editable",
    label: "spell.wellspring.icon",
    component: "select",
    defaultValue: "untyped",
    group: "effect",
    order: 72,
    gridSize: { xs: 12, sm: 4 },
    dependencies: isWellspring,
    componentProps: { options: ICON_OPTIONS },
  },
];
