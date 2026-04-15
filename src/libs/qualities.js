import { t } from "../translation/translate";

const qualities = [
  // Defensive
  {
    name: t("Antistatus", true),
    category: "Defensive",
    quality: t("You are immune to a single status", true),
    cost: 500,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
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
    name: t("Amulet", true),
    category: "Defensive",
    quality: t("Get +1 bonus to Magic Defense", true),
    cost: 800,
    filter: ["weapon", "customWeapon", "accessory"],
  },
  {
    name: t("Bulwark", true),
    category: "Defensive",
    quality: t("You gain a +1 bonus to Defense.", true),
    cost: 800,
    filter: ["weapon", "customWeapon", "accessory"],
  },
  {
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
    name: t("Swordbreaker", true),
    category: "Defensive",
    quality: t("You have Resistance to physical damage", true),
    cost: 1000,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },
  {
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
    name: t("Omnishield", true),
    category: "Defensive",
    quality: t("Get +1 bonus to Defense and to Magic Defense", true),
    cost: 2000,
    filter: ["weapon", "customWeapon", "accessory"],
  },
  {
    name: t("Perfect Health", true),
    category: "Defensive",
    quality: t("You are immune to all status effects", true),
    cost: 2000,
    filter: ["weapon", "customWeapon", "armor", "shield", "accessory"],
  },

  // Offensive
  {
    name: t("Magical", true),
    category: "Offensive",
    quality: t("The Weapon targets Magic Defense instead of Defense", true),
    cost: 100,
    filter: ["weapon", "customWeapon"],
  },
  {
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
    name: t("Piercing", true),
    category: "Offensive",
    quality: t("Weapon damage ignores Resistances", true),
    cost: 400,
    filter: ["weapon", "customWeapon"],
  },
  {
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
    name: t("Multi", true),
    category: "Offensive",
    quality: t("Weapon attacks have multi (2) property", true),
    cost: 1000,
    filter: ["weapon", "customWeapon"],
  },
  {
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
    name: t("Initiative Up", true),
    category: "Enhancement",
    quality: t("You gain a +4 bonus to your Initiative modifier.", true),
    cost: 500,
    filter: ["armor", "shield", "accessory"],
  },
  {
    name: t("Accuracy Up", true),
    category: "Enhancement",
    quality: t("You gain a +1 bonus to your Accuracy Checks.", true),
    cost: 1000,
    filter: ["armor", "shield", "accessory"],
  },
  {
    name: t("Magic Up", true),
    category: "Enhancement",
    quality: t("You gain a +1 bonus to your Magic Checks.", true),
    cost: 1000,
    filter: ["armor", "shield", "accessory"],
  },
  {
    name: t("Vitality Up", true),
    category: "Enhancement",
    quality: t("When you recover HP, you recover 5 extra HP.", true),
    cost: 1000,
    filter: ["armor", "shield", "accessory"],
  },
  {
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
    name: t("Spell Up", true),
    category: "Enhancement",
    quality: t("Spells you cast deal 5 extra damage.", true),
    cost: 2000,
    filter: ["armor", "shield", "accessory"],
  },
  {
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

export default qualities;
