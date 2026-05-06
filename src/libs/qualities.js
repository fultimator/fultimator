import { t } from "../translation/translate";

const qualities = [
  // Defensive
  {
    fuid: "antistatus",
    name: t("Antistatus", true),
    category: "Defensive",
    quality: t("You are immune to a single status", true),
    cost: 500,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
    fuid: "resistance",
    name: t("Resistance", true),
    category: "Defensive",
    quality: t(
      "You have Resistance to a single type of damage (except physical)",
      true,
    ),
    cost: 700,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
    fuid: "amulet",
    name: t("Amulet", true),
    category: "Defensive",
    quality: t("Get +1 bonus to Magic Defense", true),
    cost: 800,
    filter: ["weapon", "customWeapon", "accessory"],
  },
  {
    fuid: "bulwark",
    name: t("Bulwark", true),
    category: "Defensive",
    quality: t("You gain a +1 bonus to Defense.", true),
    cost: 800,
    filter: ["weapon", "customWeapon", "accessory"],
  },
  {
    fuid: "dual-resistance",
    name: t("Dual Resistance", true),
    category: "Defensive",
    quality: t(
      "You have Resistance to two types of damage (except physical)",
      true,
    ),
    cost: 1000,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
    fuid: "swordbreaker",
    name: t("Swordbreaker", true),
    category: "Defensive",
    quality: t("You have Resistance to physical damage", true),
    cost: 1000,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
    fuid: "immunity",
    name: t("Immunity", true),
    category: "Defensive",
    quality: t(
      "You are immune to a single type of damage (except physical)",
      true,
    ),
    cost: 1500,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
    fuid: "omnishield",
    name: t("Omnishield", true),
    category: "Defensive",
    quality: t("Get +1 bonus to Defense and to Magic Defense", true),
    cost: 2000,
    filter: ["weapon", "customWeapon", "accessory"],
  },
  {
    fuid: "perfect-health",
    name: t("Perfect Health", true),
    category: "Defensive",
    quality: t("You are immune to all status effects", true),
    cost: 2000,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },

  // Offensive
  {
    fuid: "magical",
    name: t("Magical", true),
    category: "Offensive",
    quality: t("The Weapon targets Magic Defense instead of Defense", true),
    cost: 100,
    filter: ["weapon", "customWeapon"],
  },
  {
    fuid: "hunter",
    name: t("Hunter", true),
    category: "Offensive",
    quality: t(
      "The weapon deals 5 extra damage to creatures of a particular species",
      true,
    ),
    cost: 300,
    filter: ["weapon", "customWeapon"],
  },
  {
    fuid: "piercing",
    name: t("Piercing", true),
    category: "Offensive",
    quality: t("Weapon damage ignores Resistances", true),
    cost: 400,
    filter: ["weapon", "customWeapon"],
  },
  {
    fuid: "dual-hunter",
    name: t("Dual Hunter", true),
    category: "Offensive",
    quality: t(
      "The weapon deals 5 extra damage to the creatures of two particular species",
      true,
    ),
    cost: 500,
    filter: ["weapon", "customWeapon"],
  },
  {
    fuid: "multi",
    name: t("Multi", true),
    category: "Offensive",
    quality: t("Weapon attacks have multi (2) property", true),
    cost: 1000,
    filter: ["weapon", "customWeapon"],
  },
  {
    fuid: "status",
    name: t("Status", true),
    category: "Offensive",
    quality: t(
      "Each target hit by the weapon suffers (choose one: confused, weak, slow, shaken)",
      true,
    ),
    cost: 1500,
    filter: ["weapon", "customWeapon"],
  },
  {
    fuid: "status-plus",
    name: t("Status Plus", true),
    category: "Offensive",
    quality: t(
      "Each target hit by the weapon suffers (choose one: poisoned, enraged)",
      true,
    ),
    cost: 2000,
    filter: ["weapon", "customWeapon"],
  },

  // Enhancement
  {
    fuid: "damage-change",
    name: t("Damage Change", true),
    category: "Enhancement",
    quality: t(
      "All damage dealt by your weapons, spells, and Skills becomes of a specific type.",
      true,
    ),
    cost: 300,
    filter: ["accessory"],
  },
  {
    fuid: "initiative-up",
    name: t("Initiative Up", true),
    category: "Enhancement",
    quality: t("You gain a +4 bonus to your Initiative modifier.", true),
    cost: 500,
    filter: ["armor", "shield", "accessory"],
  },
  {
    fuid: "accuracy-up",
    name: t("Accuracy Up", true),
    category: "Enhancement",
    quality: t("You gain a +1 bonus to your Accuracy Checks.", true),
    cost: 1000,
    filter: ["armor", "shield", "accessory"],
  },
  {
    fuid: "magic-up",
    name: t("Magic Up", true),
    category: "Enhancement",
    quality: t("You gain a +1 bonus to your Magic Checks.", true),
    cost: 1000,
    filter: ["armor", "shield", "accessory"],
  },
  {
    fuid: "vitality-up",
    name: t("Vitality Up", true),
    category: "Enhancement",
    quality: t("When you recover HP, you recover 5 extra HP.", true),
    cost: 1000,
    filter: ["armor", "shield", "accessory"],
  },
  {
    fuid: "healing-up",
    name: t("Healing Up", true),
    category: "Enhancement",
    quality: t(
      "Spells you cast that whose effects restore Hit Points will restore 5 extra Hit Points.",
      true,
    ),
    cost: 1500,
    filter: ["armor", "shield", "accessory"],
  },
  {
    fuid: "spell-up",
    name: t("Spell Up", true),
    category: "Enhancement",
    quality: t("Spells you cast deal 5 extra damage.", true),
    cost: 2000,
    filter: ["armor", "shield", "accessory"],
  },
  {
    fuid: "weapon-up",
    name: t("Weapon Up", true),
    category: "Enhancement",
    quality: t(
      "Your attacks with (choose one: melee, ranged) weapons deal 5 extra damage.",
      true,
    ),
    cost: 2000,
    filter: ["armor", "shield", "accessory"],
  },
];

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

qualities.forEach((item) => {
  if (item.fuid === undefined && item.name) item.fuid = slugify(item.name);
});

export default qualities;
