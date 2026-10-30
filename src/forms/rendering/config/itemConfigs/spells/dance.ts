import type { ItemFieldConfig } from "../../fieldConfig";
import type { PlayerSpellFormState } from "./types";
import { isDance } from "./predicates";
import { DURATION_OPTIONS } from "./options";
import { SHARED_LABEL_KEYS, prefixedLabel } from "../sharedLabelKeys";

const SPELL_LABEL_PREFIX = "spell";

export const danceFields: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "duration",
    kind: "editable",
    label: prefixedLabel(SPELL_LABEL_PREFIX, SHARED_LABEL_KEYS.duration),
    component: "autocomplete",
    defaultValue: "Instantaneous",
    group: "effect",
    order: 65,
    gridSize: { xs: 12, sm: 6 },
    dependencies: isDance,
    componentProps: { options: DURATION_OPTIONS, freeSolo: true },
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.dance.effect",
    component: "textarea",
    defaultValue: "",
    group: "effect",
    order: 70,
    fullWidth: true,
    dependencies: isDance,
  },
];
