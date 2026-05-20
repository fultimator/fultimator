import type { ItemFieldConfig } from "../../fieldConfig";
import { metaFieldConfig } from "../../metaFieldConfig";
import type { PlayerSpellFormState } from "./types";
import { SPELL_TYPE_OPTIONS } from "./options";
import { defaultFields } from "./default";
import { arcanistFields } from "./arcanist";
import { tinkererFields } from "./tinkerer";
import { pilotVehicleFields } from "./pilotVehicle";
import { giftFields } from "./gift";
import { danceFields } from "./dance";
import { therioformFields } from "./therioform";
import { magichantFields } from "./magichant";
import { symbolFields } from "./symbol";
import { invocationFields } from "./invocation";
import { cookingFields } from "./cooking";
import { magiseedFields } from "./magiseed";
import { SHARED_LABEL_KEYS, prefixedLabel } from "../sharedLabelKeys";

export type { PlayerSpellFormState, PlayerSpellUiType } from "./types";
const SPELL_LABEL_PREFIX = "spell";

export const playerSpellFieldConfig: ItemFieldConfig<PlayerSpellFormState> = [
  {
    key: "spellType",
    kind: "editable",
    label: prefixedLabel(SPELL_LABEL_PREFIX, SHARED_LABEL_KEYS.type),
    component: "select",
    defaultValue: "default",
    group: "core",
    order: 0,
    gridSize: { xs: 12, sm: 5 },
    componentProps: { options: SPELL_TYPE_OPTIONS },
  },
  {
    key: "fuid",
    kind: "editable",
    label: prefixedLabel(SPELL_LABEL_PREFIX, SHARED_LABEL_KEYS.fuid),
    component: "fuid",
    defaultValue: undefined,
    group: "core",
    order: 3,
    gridSize: 12,
  },
  {
    key: "name",
    kind: "editable",
    label: prefixedLabel(SPELL_LABEL_PREFIX, SHARED_LABEL_KEYS.name),
    component: "text",
    defaultValue: "",
    group: "core",
    order: 4,
    gridSize: "grow",
    validationHints: { required: true },
  },

  ...defaultFields,
  ...arcanistFields,
  ...tinkererFields,
  ...pilotVehicleFields,
  ...giftFields,
  ...danceFields,
  ...therioformFields,
  ...magichantFields,
  ...symbolFields,
  ...invocationFields,
  ...cookingFields,
  ...magiseedFields,
  ...(metaFieldConfig as unknown as ItemFieldConfig<PlayerSpellFormState>),
];
