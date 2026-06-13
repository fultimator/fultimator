import type { ItemFieldConfig } from "../../../fieldConfig";
import {
  behaviorsTabField,
  DEFAULT_ITEM_TABS,
} from "../../../shared/behaviorFields";
import { availableMagichantTones } from "../../../../../../libs/player/spellOptionData";

export type MagichantToneItemState = {
  key: string;
  customName: string;
  effect: string;
  behaviors?: unknown[];
};

export const DEFAULT_SUBITEM_TABS = DEFAULT_ITEM_TABS;

const TONE_OPTIONS = availableMagichantTones.map((t: { name: string }) => ({
  value: t.name,
  label: t.name,
}));

const isCustom = (s: MagichantToneItemState) =>
  s.key === "magichant_custom_name" ||
  !availableMagichantTones.find((t) => t.name === s.key);

export const magichantToneItemFields: ItemFieldConfig<MagichantToneItemState> = [
  {
    key: "key",
    kind: "editable",
    label: "magichant_tone",
    component: "select",
    defaultValue: "magichant_custom_name",
    group: "",
    order: 0,
    gridSize: { xs: 12, sm: 6 },
    componentProps: { options: TONE_OPTIONS },
  },
  {
    key: "customName",
    kind: "editable",
    label: "magichant_name",
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
    label: "spell.magichant.toneEffect",
    component: "textarea",
    defaultValue: "",
    group: "",
    order: 2,
    fullWidth: true,
    dependencies: isCustom,
  },
  {
    key: "effect",
    kind: "editable",
    label: "spell.magichant.toneEffect",
    component: "readonly-markdown",
    defaultValue: "",
    group: "",
    order: 2,
    fullWidth: true,
    dependencies: (s) => !isCustom(s as MagichantToneItemState),
  },
  behaviorsTabField,
];
