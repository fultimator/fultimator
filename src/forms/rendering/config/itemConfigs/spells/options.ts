import { availableFrames } from "../../../../../libs/pilotVehicleData";
import { availableMagichantKeys } from "../../../../../components/player/spells/spellOptionData";

export const SPELL_TYPE_OPTIONS = [
  { value: "default", label: "Standard Spell" },
  { value: "gift", label: "Gift" },
  { value: "dance", label: "Dance" },
  { value: "therioform", label: "Therioform" },
  { value: "magichant-key", label: "Key (Chanter)" },
  { value: "magichant", label: "Tone (Chanter)" },
  { value: "symbol", label: "Symbol" },
  { value: "invocation", label: "Invocation" },
  { value: "arcanist", label: "Arcanum" },
  { value: "arcanist-rework", label: "Arcanum (Rework)" },
  { value: "tinkerer-alchemy", label: "Alchemy" },
  { value: "tinkerer-infusion", label: "Infusion" },
  { value: "cooking", label: "Delicacy" },
  { value: "magiseed", label: "Magiseed" },
  { value: "pilot-vehicle", label: "Pilot Vehicle" },
];

export const STANDARD_SPELL_CLASSES = [
  "Chimerist",
  "Tinkerer",
  "Elementalist",
  "Entropist",
  "Spiritist",
];

export const SPELL_CLASS_OPTIONS = [
  ...STANDARD_SPELL_CLASSES.map((c) => ({ value: c, label: c })),
  { value: "", label: "Custom" },
];

export const ATTR_OPTIONS = [
  { value: "dexterity", label: "DEX" },
  { value: "insight", label: "INS" },
  { value: "might", label: "MIG" },
  { value: "will", label: "WLP" },
];

export const DURATION_OPTIONS = [
  { value: "Scene", label: "Scene" },
  { value: "Instantaneous", label: "Instantaneous" },
  { value: "Special", label: "Special" },
];

export const TARGET_OPTIONS = [
  { value: "Self", label: "Self" },
  { value: "One creature", label: "One creature" },
  { value: "Up to two creatures", label: "Up to two creatures" },
  { value: "Up to three creatures", label: "Up to three creatures" },
  { value: "Up to four creatures", label: "Up to four creatures" },
  { value: "Up to five creatures", label: "Up to five creatures" },
  { value: "One equipped weapon", label: "One equipped weapon" },
  { value: "Special", label: "Special" },
];

export const WELLSPRING_OPTIONS = ["Air", "Earth", "Fire", "Lightning", "Water"].map(
  (w) => ({ value: w, label: w }),
);

export const INV_TYPE_OPTIONS = ["Blast", "Hex", "Utility"].map((t) => ({
  value: t,
  label: t,
}));

export const PILOT_SUBTYPE_OPTIONS = [
  { value: "frame", label: "Vehicle Frame" },
  { value: "armor", label: "Armor Module" },
  { value: "weapon", label: "Weapon Module" },
  { value: "support", label: "Support Module" },
];

export const PILOT_WEAPON_CATEGORY_OPTIONS = [
  "Arcane",
  "Brawling",
  "Bow",
  "Dagger",
  "Firearm",
  "Flail",
  "Heavy",
  "Spear",
  "Sword",
].map((c) => ({ value: c, label: c }));

export const PILOT_DAMAGE_TYPE_OPTIONS = [
  "Physical",
  "Air",
  "Bolt",
  "Dark",
  "Earth",
  "Fire",
  "Ice",
  "Light",
  "Poison",
].map((d) => ({ value: d.toLowerCase(), label: d }));

export const PILOT_ATTR_OPTIONS = [
  { value: "dexterity", label: "DEX" },
  { value: "insight", label: "INS" },
  { value: "might", label: "MIG" },
  { value: "willpower", label: "WLP" },
];

export const PILOT_RANGE_OPTIONS = [
  { value: "Melee", label: "Melee" },
  { value: "Ranged", label: "Ranged" },
];

export const FRAME_OPTIONS = (availableFrames as Array<Record<string, unknown>>).map(
  (f) => ({ value: f.name as string, label: f.name as string }),
);

const mkKeyOptions = (key: string) =>
  Array.from(
    new Set(
      (availableMagichantKeys as Array<Record<string, string>>)
        .map((k) => k[key])
        .filter(Boolean),
    ),
  ).map((v) => ({ value: v, label: v }));

export const MAGICHANT_KEY_TYPES = mkKeyOptions("type");
export const MAGICHANT_KEY_STATUSES = mkKeyOptions("status");
export const MAGICHANT_KEY_ATTRIBUTES = mkKeyOptions("attribute");
export const MAGICHANT_KEY_RECOVERIES = mkKeyOptions("recovery");
