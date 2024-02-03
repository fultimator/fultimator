import { t } from "../../../translation/translate";

const qualities = [
  {
    category: t("Defensive Qualities", true),
    name: t("Antistatus", true),
    quality: t("You are immune to a single status", true),
    cost: 500,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Resistance", true),
    quality: t(
      "You have Resistance to a single type of damage (except physical)",
      true
    ),
    cost: 700,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Amulet", true),
    quality: t("Get +1 bonus to Magic Defense", true),
    cost: 800,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Bulwark", true),
    quality: t("You gain a +1 bonus to Defense.", true),
    cost: 800,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Dual Resistance", true),
    quality: t(
      "You have Resistance to two types of damage (except physical)",
      true
    ),
    cost: 1000,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Swordbreaker", true),
    quality: t("You have Resistance to physical damage", true),
    cost: 1000,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Immunity", true),
    quality: t(
      "You are immune to a single type of damage (except physical)",
      true
    ),
    cost: 1500,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Omnishield", true),
    quality: t("Get +1 bonus to Defense and to Magic Defense", true),
    cost: 2000,
  },
  {
    category: t("Defensive Qualities", true),
    name: t("Perfect Health", true),
    quality: t("You are immune to all status effects", true),
    cost: 2000,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Magical", true),
    quality: t("The Weapon targets Magic Defense instead of Defense", true),
    cost: 100,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Hunter", true),
    quality: t(
      "The weapon deals 5 extra damage to creatures of a particular species",
      true
    ),
    cost: 300,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Piercing", true),
    quality: t("Weapon damage ignores Resistances", true),
    cost: 400,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Dual Hunter", true),
    quality: t(
      "The weapon deals 5 extra damage to the creatures of two particular species",
      true
    ),
    cost: 500,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Multi", true),
    quality: t("Weapon attacks have multi (2) property", true),
    cost: 1000,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Status", true),
    quality: t(
      "Each target hit by the weapon suffers (choose one: confused, weak, slow, shaken)",
      true
    ),
    cost: 1500,
  },
  {
    category: t("Offensive Qualities", true),
    name: t("Status Plus", true),
    quality: t(
      "Each target hit by the weapon suffers (choose one: poisoned, enraged)",
      true
    ),
    cost: 2000,
  },
];

export default qualities;
