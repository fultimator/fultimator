import {
  arcanumList,
  tinkererAlchemy,
  tinkererInfusion,
} from "../../../../libs/classes";
import {
  availableDances,
  availableGifts,
  availableMagichantKeys,
  availableMagichantTones,
  availableSymbols,
  availableTherioforms,
  invocationsByWellspring,
} from "../../../player/spells/spellOptionData";
import { magiseeds } from "../../../../libs/floralistMagiseedData";
import { availableModules } from "../../../../libs/pilotVehicleData";

export const SPELL_TYPE_DESC_KEYS = {
  dance: ["dance_details_1"],
  symbol: ["symbol_details_1"],
  magichant: [
    "magichant_details_1",
    "magichant_details_2",
    "magichant_details_3",
    "magichant_details_4",
  ],
  cooking: ["Cooking_desc"],
  invocation: ["Invocation_desc"],
  "pilot-vehicle": ["pilot_details_1"],
  magiseed: ["magiseed_details_1"],
  gift: [],
  therioform: [],
  deck: ["ace_card_set_reference"],
  arcanist: [],
  "arcanist-rework": [],
  "tinkerer-alchemy": ["Alchemy"],
  "tinkerer-infusion": ["Infusion"],
  "tinkerer-magitech": ["Magitech"],
  gamble: [],
};

const isCustomPilotModule = (module) =>
  module.customName || module.name?.startsWith("pilot_custom_");

export const INVOCATION_WELLSPRING_GROUPS = Object.entries(
  invocationsByWellspring,
).map(([wellspring, invocations]) => ({
  key: wellspring,
  label: wellspring,
  items: invocations.map((invocation) => ({
    name: invocation.name,
    subtype: invocation.type,
    details: [
      ...(invocation.type
        ? [{ label: "Type", value: invocation.type, rawValue: true }]
        : []),
      ...(invocation.effect
        ? [{ label: "Effect", value: invocation.effect }]
        : []),
    ],
  })),
}));

const pilotModuleDetailBuilders = {
  armor: (module) => [
    { label: "DEF", value: String(module.def ?? 0), rawValue: true },
    { label: "MDEF", value: String(module.mdef ?? 0), rawValue: true },
    ...(module.martial
      ? [{ label: "Armor", value: "Martial", rawValue: true }]
      : []),
    ...(module.cost
      ? [{ label: "Cost", value: String(module.cost), rawValue: true }]
      : []),
    ...(module.description
      ? [{ label: "Description", value: module.description }]
      : []),
  ],
  weapon: (module) => [
    ...(module.category ? [{ label: "Category", value: module.category }] : []),
    { label: "Accuracy", value: `+${module.prec ?? 0}`, rawValue: true },
    {
      label: "Damage",
      value: module.isShield ? "0" : `HR + ${module.damage ?? 0}`,
      rawValue: true,
    },
    ...(module.damageType
      ? [{ label: "Damage Type", value: module.damageType }]
      : []),
    ...(module.range ? [{ label: "Range", value: module.range }] : []),
    ...(module.description
      ? [{ label: "Description", value: module.description }]
      : []),
  ],
  support: (module) => [
    ...(module.isComplex
      ? [{ label: "pilot_complex", value: "pilot_takes_two_slots" }]
      : []),
    ...(module.description
      ? [{ label: "Effect", value: module.description }]
      : []),
  ],
};

export const PILOT_MODULE_GROUPS = [
  {
    key: "armor",
    label: "pilot_module_armor",
    items: availableModules.armor
      .filter((module) => !isCustomPilotModule(module))
      .map((module) => ({
        name: module.name,
        details: pilotModuleDetailBuilders.armor(module),
      })),
  },
  {
    key: "weapon",
    label: "pilot_module_weapon",
    items: availableModules.weapon
      .filter((module) => !isCustomPilotModule(module))
      .map((module) => ({
        name: module.name,
        details: pilotModuleDetailBuilders.weapon(module),
      })),
  },
  {
    key: "support",
    label: "pilot_module_support",
    items: availableModules.support
      .filter((module) => !isCustomPilotModule(module))
      .map((module) => ({
        name: module.name,
        details: pilotModuleDetailBuilders.support(module),
      })),
  },
];

export const TINKERER_SPELL_TYPES = new Set([
  "tinkerer-alchemy",
  "tinkerer-infusion",
  "tinkerer-magitech",
]);

export const SPELL_TYPE_ITEMS = {
  arcanist: arcanumList.map((a) => ({
    name: a.name,
    details: [
      ...(a.domainDesc ? [{ label: "Domains", value: a.domainDesc }] : []),
      ...(a.mergeDesc ? [{ label: "Merge", value: a.mergeDesc }] : []),
      ...(a.dismissDesc ? [{ label: "Dismiss", value: a.dismissDesc }] : []),
    ],
  })),
  "arcanist-rework": [],
  cooking: [
    {
      name: "gourmet_delicacy_effect_label",
      details: Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1),
        value: `gourmet_delicacy_effect_${i + 1}`,
      })),
    },
  ],
  deck: [
    {
      name: "ace_jackpot",
      details: [{ label: "Effect", value: "ace_jackpot_desc" }],
    },
    {
      name: "ace_magic_flush",
      details: [{ label: "Effect", value: "ace_magic_flush_desc" }],
    },
    {
      name: "ace_blinding_flush",
      details: [{ label: "Effect", value: "ace_blinding_flush_desc" }],
    },
    {
      name: "ace_full_status",
      details: [{ label: "Effect", value: "ace_full_status_desc" }],
    },
    {
      name: "ace_triple_support",
      details: [{ label: "Effect", value: "ace_triple_support_desc" }],
    },
    {
      name: "ace_double_trouble",
      details: [{ label: "Effect", value: "ace_double_trouble_desc" }],
    },
    {
      name: "ace_magic_pair",
      details: [{ label: "Effect", value: "ace_magic_pair_desc" }],
    },
  ],
  dance: availableDances
    .filter((d) => !d.name.includes("_custom_"))
    .map((d) => ({
      name: d.name,
      details: [
        ...(d.effect ? [{ label: "Effect", value: d.effect }] : []),
        ...(d.duration ? [{ label: "Duration", value: d.duration }] : []),
      ],
    })),
  symbol: availableSymbols
    .filter((s) => !s.name.includes("_custom_"))
    .map((s) => ({
      name: s.name,
      details: s.effect ? [{ label: "Effect", value: s.effect }] : [],
    })),
  magichant: [
    ...availableMagichantKeys
      .filter((k) => !k.name.includes("_custom_"))
      .map((k) => ({
        name: k.name,
        subtype: "Key",
        details: [
          ...(k.type ? [{ label: "Type", value: k.type }] : []),
          ...(k.status ? [{ label: "Status", value: k.status }] : []),
          ...(k.attribute ? [{ label: "Attribute", value: k.attribute }] : []),
          ...(k.recovery ? [{ label: "Recovery", value: k.recovery }] : []),
        ],
      })),
    ...availableMagichantTones
      .filter((t) => !t.name.includes("_custom_"))
      .map((t) => ({
        name: t.name,
        subtype: "Tone",
        details: t.effect ? [{ label: "Effect", value: t.effect }] : [],
      })),
  ],
  gift: availableGifts
    .filter((g) => !g.name.includes("_custom_"))
    .map((g) => ({
      name: g.name,
      details: [
        ...(g.event ? [{ label: "Trigger", value: g.event }] : []),
        ...(g.effect ? [{ label: "Effect", value: g.effect }] : []),
      ],
    })),
  therioform: availableTherioforms
    .filter((tf) => !tf.name.includes("_custom_"))
    .map((tf) => ({
      name: tf.name,
      details: [
        ...(tf.genoclepsis
          ? [{ label: "Genoclepsis", value: tf.genoclepsis }]
          : []),
        ...(tf.description
          ? [{ label: "Description", value: tf.description }]
          : []),
      ],
    })),
  invocation: [],
  magiseed: magiseeds.map((ms) => ({
    name: ms.name,
    details: [
      ...(ms.description
        ? [{ label: "Description", value: ms.description }]
        : []),
      ...Object.entries(ms.effects ?? {}).map(([tier, eff]) => ({
        label: `T${tier}`,
        value: eff,
      })),
    ],
  })),
  "tinkerer-alchemy": [
    {
      name: "Targets",
      details: tinkererAlchemy.targets.map((target) => ({
        label:
          target.rangeFrom === target.rangeTo
            ? `${target.rangeFrom}`
            : `${target.rangeFrom}-${target.rangeTo}`,
        value: target.effect,
        rawValue: true,
      })),
    },
    {
      name: "Effects",
      details: tinkererAlchemy.effects.map((effect) => ({
        label: String(effect.dieValue),
        value: effect.effect,
        rawValue: true,
      })),
    },
  ],
  "tinkerer-infusion": tinkererInfusion.effects.map((effect) => ({
    name: effect.name,
    subtype: `Rank ${effect.infusionRank}`,
    details: [{ label: "Effect", value: effect.effect, rawValue: true }],
  })),
  "tinkerer-magitech": [
    {
      name: "Magitech Override",
      subtype: "Basic",
      details: [{ label: "Details", value: "MagitechOverride_desc" }],
    },
    {
      name: "Magicannon",
      subtype: "Advanced",
      details: [
        { label: "Details", value: "Magicannon_desc1" },
        { label: "Details", value: "Magicannon_desc2" },
      ],
    },
    {
      name: "Magispheres",
      subtype: "Superior",
      details: [
        { label: "Details", value: "Magispheres_desc1" },
        { label: "Details", value: "Magispheres_desc2" },
        { label: "Details", value: "Magispheres_desc3" },
      ],
    },
  ],
};

export const getSpellTypeItemCount = (spellClass) => {
  if (spellClass === "invocation") {
    return INVOCATION_WELLSPRING_GROUPS.reduce(
      (sum, group) => sum + group.items.length,
      0,
    );
  }
  if (spellClass === "pilot-vehicle") {
    return PILOT_MODULE_GROUPS.reduce(
      (sum, group) => sum + group.items.length,
      0,
    );
  }
  return SPELL_TYPE_ITEMS[spellClass]?.length ?? 0;
};
