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
    name: t("Perfect Health", true),
    quality: t("You are immune to all status effects", true),
    cost: 2000,
  },

  {
    category: t("Enhancement Qualities", true),
    name: t("Accuracy Up", true),
    quality: t("You gain a +1 bonus to your Accuracy Checks.", true),
    cost: 1000,
  },
  {
    category: t("Enhancement Qualities", true),
    name: t("Magic Up", true),
    quality: t("You gain a +1 bonus to your Magic Checks.", true),
    cost: 1000,
  },
  {
    category: t("Enhancement Qualities", true),
    name: t("Vitality Up", true),
    quality: t("When you recover HP, you recover 5 extra HP.", true),
    cost: 1000,
  },
  {
    category: t("Enhancement Qualities", true),
    name: t("Healing Up", true),
    quality: t(
      "Spells you cast that whose effects restore Hit Points will restore 5 extra Hit Points.",
      true
    ),
    cost: 1500,
  },
  {
    category: t("Enhancement Qualities", true),
    name: t("Spell Up", true),
    quality: t("Spells you cast deal 5 extra damage.", true),
    cost: 2000,
  },
  {
    category: t("Enhancement Qualities", true),
    name: t("Weapon Up", true),
    quality: t(
      "Your attacks with (choose one: melee, ranged) weapons deal 5 extra damage.",
      true
    ),
    cost: 2000,
  },
];

export default qualities;
