const affinity = (type, value) => ({ kind: "affinity", type, value });
const spell = (fuids) => ({ kind: "spell", fuids, mpBonus: 10 });
const roleSkill = (maxPicks) => ({ kind: "roleSkill", count: 1, maxPicks });
const flying = { kind: "reminder", note: "flying" };
const opposed = (note) => ({ kind: "reminder", note });

const RESIST_TWO_NON_PHYSICAL = {
  kind: "affinity",
  value: "rs",
  count: 2,
  note: "other than physical",
};

export const QA_SPECIES = {
  Beast: {
    choose: 2,
    options: [
      { kind: "hp", amount: 10 },
      spell(["lick-wounds", "shell", "war-cry"]),
      opposed("opposed_instinct"),
      flying,
      roleSkill(2),
    ],
  },

  Construct: {
    fixed: [
      affinity("earth", "rs"),
      affinity("poison", "im"),
      { kind: "statusImmunity", options: ["poisoned"] },
    ],
    optionalVuln: ["air", "bolt", "fire", "ice"],
    optionsRequireVuln: true,
    choose: 1,
    options: [
      { kind: "statusImmunity", count: 2 },
      opposed("opposed_design"),
      flying,
      roleSkill(),
    ],
  },

  Demon: {
    fixed: [{ kind: "affinity", value: "rs", count: 2 }],
    choose: 1,
    options: [
      { kind: "replaceAffinity", from: "rs", to: "ab" },
      spell(["breath", "curse-xl", "mind-theft", "weaken"]),
      flying,
      roleSkill(2),
    ],
  },

  Elemental: {
    fixed: [
      affinity("poison", "im"),
      {
        kind: "affinity",
        value: "im",
        count: 1,
        note: "another type",
        options: [
          "air",
          "bolt",
          "dark",
          "earth",
          "fire",
          "ice",
          "light",
          "physical",
        ],
      },
      { kind: "statusImmunity", options: ["poisoned"] },
    ],
    optionalVuln: ["air", "bolt", "dark", "earth", "fire", "ice", "light"],
    optionsRequireVuln: true,
    choose: 1,
    options: [
      { kind: "replaceAffinity", from: "im", to: "ab" },
      spell(["breath", "cursed-breath", "lick-wounds"]),
      flying,
      roleSkill(),
    ],
  },

  Humanoid: {
    fixed: [
      {
        kind: "affinity",
        value: "vu",
        count: 1,
        options: ["dark", "light", "physical", "poison"],
      },
    ],
    choose: 3,
    options: [
      RESIST_TWO_NON_PHYSICAL,
      spell(["lick-wounds", "shell", "war-cry"]),
      opposed("opposed_background"),
      flying,
      roleSkill(2),
    ],
  },

  Monster: {
    choose: 2,
    options: [
      { kind: "hp", amount: 10 },
      RESIST_TWO_NON_PHYSICAL,
      spell(["breath", "cursed-breath", "lick-wounds"]),
      flying,
      roleSkill(2),
    ],
  },

  Plant: {
    fixed: [
      {
        kind: "affinity",
        value: "vu",
        count: 1,
        options: ["air", "bolt", "fire", "ice"],
      },
      { kind: "statusImmunity", options: ["dazed", "enraged", "shaken"] },
    ],
    choose: 1,
    options: [
      { kind: "hp", amount: 10 },
      RESIST_TWO_NON_PHYSICAL,
      spell(["breath", "cursed-breath", "life-theft", "poison"]),
      // Thorns is a named Bestiary special rule: link to compendium, do not embed.
      { kind: "roleSkill", count: 1, note: "thorns" },
      flying,
      roleSkill(),
    ],
  },

  Undead: {
    fixed: [
      affinity("light", "vu"),
      affinity("dark", "im"),
      affinity("poison", "im"),
      { kind: "statusImmunity", options: ["poisoned"] },
    ],
    optionalVuln: ["air", "bolt", "earth", "fire", "ice"],
    optionsRequireVuln: true,
    choose: 1,
    options: [
      { kind: "replaceAffinity", from: "im", to: "ab", type: "dark" },
      spell(["breath", "curse", "life-theft", "poison"]),
      flying,
      roleSkill(),
    ],
  },
};

// "Variant Humanoid" shares the Humanoid quick-assembly profile.
QA_SPECIES["Variant Humanoid"] = QA_SPECIES.Humanoid;

export const QA_SPECIES_KEYS = Object.keys(QA_SPECIES);

export function getSpeciesStep(species) {
  return QA_SPECIES[species] ?? null;
}
