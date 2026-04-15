import weapons from "./weapons";
import heroics from "./heroics";
import qualities from "./qualities";
import { baseArmors, baseShields } from "./equip";
import { npcSpells } from "./npcSpells";
import { npcAttacks } from "./npcAttacks";
import classList, {
  spellList,
  tinkererAlchemy,
  tinkererInfusion,
  arcanumList,
} from "./classes";
import { availableFrames, availableModules } from "./pilotVehicleData";
import { magiseeds } from "./floralistMagiseedData";
// import { getDelicacyEffects } from "./gourmetCookingData";
import {
  availableGifts,
  availableDances,
  availableTherioforms,
  availableMagichantKeys,
  availableMagichantTones,
  availableSymbols,
  invocationsByWellspring,
} from "../components/player/spells/spellOptionData";
import { t as staticT } from "../translation/translate";

export const CLASS_BOOK_OPTIONS = [
  { label: staticT("Core", true), value: "core" },
  { label: staticT("Rework", true), value: "rework" },
  { label: staticT("Bonus", true), value: "bonus" },
  { label: staticT("High Fantasy", true), value: "high" },
  { label: staticT("Techno Fantasy", true), value: "techno" },
  { label: staticT("Natural Fantasy", true), value: "natural" },
];

export const QUALITY_FILTER_OPTIONS = [
  { label: staticT("Weapons", true), value: "weapon" },
  { label: staticT("Custom Weapons", true), value: "customWeapon" },
  { label: staticT("Armor", true), value: "armor" },
  { label: staticT("Shields", true), value: "shield" },
  { label: staticT("Accessories", true), value: "accessory" },
];

export const QUALITY_CATEGORY_OPTIONS = [
  { label: staticT("Defensive", true), value: "Defensive" },
  { label: staticT("Offensive", true), value: "Offensive" },
  { label: staticT("Enhancement", true), value: "Enhancement" },
];

const armors = baseArmors
  .filter((a) => a.name !== "No Armor")
  .map((a) => ({ ...a, category: "Armor" }));

const shields = baseShields
  .filter((s) => s.name !== "No Shield")
  .map((s) => ({ ...s, category: "Shield" }));

export const ITEM_TYPES = [
  { key: "weapons", label: staticT("Weapons", true), context: "player" },
  {
    key: "custom-weapons",
    label: staticT("Custom Weapons", true),
    context: "player",
  },
  { key: "shields", label: staticT("Shields", true), context: "player" },
  { key: "armor", label: staticT("Armor", true), context: "player" },
  {
    key: "accessories",
    label: staticT("Accessories", true),
    context: "player",
  },
  { key: "spells", label: staticT("NPC Spells", true), context: "npc" },
  { key: "attacks", label: staticT("NPC Attacks", true), context: "npc" },
  { key: "special", label: staticT("Special Rules", true), context: "npc" },
  { key: "actions", label: staticT("Other Actions", true), context: "npc" },
  { key: "classes", label: staticT("Classes", true), context: "player" },
  { key: "player-spells", label: staticT("Spells", true), context: "both" },
  { key: "qualities", label: staticT("Qualities", true), context: "player" },
  { key: "heroics", label: staticT("Heroic Skills", true), context: "player" },
  { key: "optionals", label: staticT("Optionals", true), context: "player" },
];

export const PACK_ITEM_TYPES = [
  { key: "weapons", label: staticT("Weapons", true), context: "player" },
  { key: "armor", label: staticT("Armor", true), context: "player" },
  { key: "shields", label: staticT("Shields", true), context: "player" },
  {
    key: "custom-weapons",
    label: staticT("Custom Weapons", true),
    context: "player",
  },
  {
    key: "accessories",
    label: staticT("Accessories", true),
    context: "player",
  },
  { key: "spells", label: staticT("NPC Spells", true), context: "npc" },
  { key: "attacks", label: staticT("NPC Attacks", true), context: "npc" },
  { key: "special", label: staticT("Special Rules", true), context: "npc" },
  { key: "actions", label: staticT("Other Actions", true), context: "npc" },
  { key: "player-spells", label: staticT("Spells", true), context: "both" },
  { key: "qualities", label: staticT("Qualities", true), context: "player" },
  { key: "classes", label: staticT("Classes", true), context: "player" },
  { key: "heroics", label: staticT("Heroic Skills", true), context: "player" },
  { key: "optionals", label: staticT("Optionals", true), context: "player" },
];

export const VIEWER_TO_PACK_TYPE = {
  weapons: "weapon",
  armor: "armor",
  shields: "shield",
  "custom-weapons": "custom-weapon",
  accessories: "accessory",
  spells: "npc-spell",
  attacks: "npc-attack",
  special: "npc-special",
  actions: "npc-action",
  "player-spells": "player-spell",
  qualities: "quality",
  classes: "class",
  heroics: "heroic",
  optionals: "optional",
};

export function getItems(type) {
  switch (type) {
    case "weapons":
      return weapons;
    case "armor":
      return armors;
    case "shields":
      return shields;
    case "spells":
      return npcSpells;
    case "attacks":
      return npcAttacks;
    case "classes":
      return classList;
    case "player-spells":
      return spellList;
    case "qualities":
      return qualities;
    case "heroics":
      return heroics;
    case "special":
    case "actions":
    case "custom-weapons":
    case "accessories":
    case "optionals":
      return []; // pack-only, no official data
    default:
      return [];
  }
}

export function getItemSearchText(item) {
  const skillNames = item.skills
    ? item.skills.map((s) => s.skillName).join(" ")
    : "";
  return [
    item.name,
    item.category,
    item.type,
    item.range,
    item.book,
    skillNames,
    item.quality,
    item.subtype,
    item.description,
    item.effect,
    item.targetDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function toSlug(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeId(name, idx) {
  return `compendium-item-${name.replace(/[^a-zA-Z0-9]/g, "-")}-${idx}`;
}

//
// Pre-computed non-static spell items by type O(1) lookup
//
const _nonStaticItemsByType = {
  gift: availableGifts
    .filter((g) => !g.name.includes("_custom_"))
    .map((g) => ({ ...g, spellType: "gift" })),
  dance: availableDances
    .filter((d) => !d.name.includes("_custom_"))
    .map((d) => ({ ...d, spellType: "dance" })),
  therioform: availableTherioforms
    .filter((tf) => !tf.name.includes("_custom_"))
    .map((tf) => ({ ...tf, spellType: "therioform" })),
  magichant: [
    ...availableMagichantKeys
      .filter((key) => !key.name.includes("_custom_"))
      .map((key) => ({
        ...key,
        spellType: "magichant",
        magichantSubtype: "key",
      })),
    ...availableMagichantTones
      .filter((tone) => !tone.name.includes("_custom_"))
      .map((tone) => ({
        ...tone,
        spellType: "magichant",
        magichantSubtype: "tone",
      })),
  ],
  symbol: availableSymbols
    .filter((s) => !s.name.includes("_custom_"))
    .map((s) => ({ ...s, spellType: "symbol" })),
  invocation: Object.entries(invocationsByWellspring).flatMap(
    ([wellspring, invocations]) =>
      invocations.map((inv) => ({
        ...inv,
        spellType: "invocation",
        wellspring,
      })),
  ),
  magiseed: magiseeds.map((ms) => ({ ...ms, spellType: "magiseed" })),
  arcanist: arcanumList.map((arc) => ({ ...arc, spellType: "arcanist" })),
  "arcanist-rework": arcanumList.map((arc) => ({
    ...arc,
    spellType: "arcanist-rework",
  })),
  "tinkerer-alchemy": [
    ...tinkererAlchemy.targets.map((t) => ({
      name:
        t.rangeFrom === t.rangeTo
          ? `${t.rangeFrom}`
          : `${t.rangeFrom}–${t.rangeTo}`,
      spellType: "tinkerer-alchemy",
      category: "Target",
      effect: t.effect,
    })),
    ...tinkererAlchemy.effects.map((e) => ({
      name: `Die: ${e.dieValue}`,
      spellType: "tinkerer-alchemy",
      category: "Effect",
      effect: e.effect,
    })),
  ],
  "tinkerer-infusion": tinkererInfusion.effects.map((e) => ({
    name: `Rank ${e.infusionRank}: ${e.name ?? ""}`.trim().replace(/: $/, ""),
    spellType: "tinkerer-infusion",
    ...e,
  })),
  "pilot-vehicle": [
    ...availableFrames.map((f) => ({
      ...f,
      spellType: "pilot-vehicle",
      category: "Frame",
      pilotSubtype: "frame",
    })),
    ...availableModules.armor
      .filter((m) => !m.customName && m.name !== "pilot_custom_armor")
      .map((m) => ({
        ...m,
        spellType: "pilot-vehicle",
        category: "Armor Module",
        pilotSubtype: "armor",
      })),
    ...availableModules.weapon.map((m) => ({
      ...m,
      spellType: "pilot-vehicle",
      category: "Weapon Module",
      pilotSubtype: "weapon",
    })),
    ...availableModules.support
      .filter((m) => m.name !== "pilot_custom_support")
      .map((m) => ({
        ...m,
        spellType: "pilot-vehicle",
        category: "Support Module",
        pilotSubtype: "support",
      })),
  ],
};

export function getNonStaticSpellItems(sc) {
  return _nonStaticItemsByType[sc] ?? null;
}
