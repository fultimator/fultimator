// Gourmet Cooking System Data
export const getDelicacyEffects = (t) => [
  {
    id: 1,
    effect: t("gourmet_delicacy_effect_1")
  },
  {
    id: 2,
    effect: t("gourmet_delicacy_effect_2")
  },
  {
    id: 3,
    effect: t("gourmet_delicacy_effect_3")
  },
  {
    id: 4,
    effect: t("gourmet_delicacy_effect_4")
  },
  {
    id: 5,
    effect: t("gourmet_delicacy_effect_5")
  },
  {
    id: 6,
    effect: t("gourmet_delicacy_effect_6")
  },
  {
    id: 7,
    effect: t("gourmet_delicacy_effect_7")
  },
  {
    id: 8,
    effect: t("gourmet_delicacy_effect_8")
  },
  {
    id: 9,
    effect: t("gourmet_delicacy_effect_9")
  },
  {
    id: 10,
    effect: t("gourmet_delicacy_effect_10")
  },
  {
    id: 11,
    effect: t("gourmet_delicacy_effect_11")
  },
  {
    id: 12,
    effect: t("gourmet_delicacy_effect_12")
  }
];

// Fallback for components that don't have access to translation function
export const delicacyEffects = [
  {
    id: 1,
    effect: "Each of this delicacy's targets recovers from the (choose one: dazed; enraged; poisoned; shaken; slow; weak) status effect."
  },
  {
    id: 2,
    effect: "Each of this delicacy's targets suffers the (choose one: dazed; shaken; slow; weak) status effect."
  },
  {
    id: 3,
    effect: "Each of this delicacy's targets recovers 40 Hit Points. This amount increases to 50 if you are level 30 or higher."
  },
  {
    id: 4,
    effect: "Each of this delicacy's targets recovers 40 Mind Points. This amount increases to 50 if you are level 30 or higher."
  },
  {
    id: 5,
    effect: "This delicacy deals 20 (choose one: air; bolt; earth; fire; ice; poison) damage to each of its targets. This amount increases to 30 damage if you are level 30 or higher."
  },
  {
    id: 6,
    effect: "Until the end of your next turn, every source that deals (choose one: air; bolt; earth; fire; ice; poison) damage deals 5 extra damage to each of this delicacy's targets."
  },
  {
    id: 7,
    effect: "Each of this delicacy's targets cannot perform the Guard action during their next turn."
  },
  {
    id: 8,
    effect: "Each of this delicacy's targets cannot perform the Spell action during their next turn."
  },
  {
    id: 9,
    effect: "Each of this delicacy's targets cannot perform the Skill action during their next turn."
  },
  {
    id: 10,
    effect: "Each of this delicacy's targets gains Resistance to (choose one: air; bolt; earth; fire; ice; poison) damage until the end of your next turn."
  },
  {
    id: 11,
    effect: "Each of this delicacy's targets treats their (choose one: Dexterity; Insight; Might; Willpower) as if it were one die size higher (up to a maximum of d12) until the end of your next turn."
  },
  {
    id: 12,
    effect: "During the next turn of each of this delicacy's targets, all damage they deal becomes (choose one: air; bolt; earth; fire; ice; poison) and its type cannot change."
  }
];

export const getIngredientTastes = (t) => [
  { id: 1, name: t("gourmet_taste_bitter") },
  { id: 2, name: t("gourmet_taste_salty") },
  { id: 3, name: t("gourmet_taste_sour") },
  { id: 4, name: t("gourmet_taste_sweet") },
  { id: 5, name: t("gourmet_taste_umami") },
  { id: 6, name: t("gourmet_taste_your_choice") }
];

// Fallback for components that don't have access to translation function
export const ingredientTastes = [
  { id: 1, name: "Bitter" },
  { id: 2, name: "Salty" },
  { id: 3, name: "Sour" },
  { id: 4, name: "Sweet" },
  { id: 5, name: "Umami" },
  { id: 6, name: "choice" }
];

// All possible taste combinations (15 total)
export const getTasteCombinations = (t) => [
  { combination: t("gourmet_bitter_bitter"), key: "bitter_bitter" },
  { combination: t("gourmet_bitter_salty"), key: "bitter_salty" },
  { combination: t("gourmet_bitter_sour"), key: "bitter_sour" },
  { combination: t("gourmet_bitter_sweet"), key: "bitter_sweet" },
  { combination: t("gourmet_bitter_umami"), key: "bitter_umami" },
  { combination: t("gourmet_salty_salty"), key: "salty_salty" },
  { combination: t("gourmet_salty_sour"), key: "salty_sour" },
  { combination: t("gourmet_salty_sweet"), key: "salty_sweet" },
  { combination: t("gourmet_salty_umami"), key: "salty_umami" },
  { combination: t("gourmet_sour_sour"), key: "sour_sour" },
  { combination: t("gourmet_sour_sweet"), key: "sour_sweet" },
  { combination: t("gourmet_sour_umami"), key: "sour_umami" },
  { combination: t("gourmet_sweet_sweet"), key: "sweet_sweet" },
  { combination: t("gourmet_sweet_umami"), key: "sweet_umami" },
  { combination: t("gourmet_umami_umami"), key: "umami_umami" }
];

// Fallback for components that don't have access to translation function
export const tasteCombinations = [
  { combination: "Bitter + Bitter", key: "bitter_bitter" },
  { combination: "Bitter + Salty", key: "bitter_salty" },
  { combination: "Bitter + Sour", key: "bitter_sour" },
  { combination: "Bitter + Sweet", key: "bitter_sweet" },
  { combination: "Bitter + Umami", key: "bitter_umami" },
  { combination: "Salty + Salty", key: "salty_salty" },
  { combination: "Salty + Sour", key: "salty_sour" },
  { combination: "Salty + Sweet", key: "salty_sweet" },
  { combination: "Salty + Umami", key: "salty_umami" },
  { combination: "Sour + Sour", key: "sour_sour" },
  { combination: "Sour + Sweet", key: "sour_sweet" },
  { combination: "Sour + Umami", key: "sour_umami" },
  { combination: "Sweet + Sweet", key: "sweet_sweet" },
  { combination: "Sweet + Umami", key: "sweet_umami" },
  { combination: "Umami + Umami", key: "umami_umami" }
];

// Status effects for delicacy effect options
export const getStatusEffects = (t) => [
  t("dazed"), t("enraged"), t("poisoned"), t("shaken"), t("slow"), t("weak")
];

// Fallback for components that don't have access to translation function
export const statusEffects = [
  "dazed", "enraged", "poisoned", "shaken", "slow", "weak"
];

// Damage types for delicacy effect options
export const getDamageTypes = (t) => [
  t("air"), t("bolt"), t("earth"), t("fire"), t("ice"), t("poison")
];

// Fallback for components that don't have access to translation function
export const damageTypes = [
  "air", "bolt", "earth", "fire", "ice", "poison"
];

// Attributes for delicacy effect options
export const getAttributes = (t) => [
  t("Dexterity"), t("Insight"), t("Might"), t("Willpower")
];

// Fallback for components that don't have access to translation function
export const attributes = [
  "Dexterity", "Insight", "Might", "Willpower"
];

// Helper function to roll for a random delicacy effect
export const rollDelicacyEffect = (t = null) => {
  const roll = Math.floor(Math.random() * 12) + 1;
  const effects = t ? getDelicacyEffects(t) : delicacyEffects;
  return effects.find(effect => effect.id === roll);
};

// Helper function to get localized ingredient taste by roll
export const rollIngredientTaste = (t = null) => {
  const roll = Math.floor(Math.random() * 6) + 1;
  const tastes = t ? getIngredientTastes(t) : ingredientTastes;
  return tastes.find(taste => taste.id === roll);
};

// Helper function to get all taste combinations that include a specific taste
export const getCombinationsWithTaste = (taste) => {
  const lowerTaste = taste.toLowerCase();
  return tasteCombinations.filter(combo => 
    combo.key.includes(lowerTaste)
  );
};

export default {
  delicacyEffects,
  getDelicacyEffects,
  ingredientTastes,
  getIngredientTastes,
  tasteCombinations,
  getTasteCombinations,
  statusEffects,
  getStatusEffects,
  damageTypes,
  getDamageTypes,
  attributes,
  getAttributes,
  rollDelicacyEffect,
  rollIngredientTaste,
  getCombinationsWithTaste
};