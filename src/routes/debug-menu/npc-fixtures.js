export const SAMPLE_NPC = {
  id: "debug-npc-1",
  uid: "debug",
  name: "Cryus",
  description:
    "A very bad man, he's part of a cult. Not good. It's a good thing we're going to defeat him soon so he can't hurt anyone anymore.",
  species: "Humanoid",
  lvl: 50,
  rank: "champion3",
  villain: "supreme",
  multipart: "Part of the Cult of Milagros",
  phases: 3,
  traits: "Scumbag, ex-reporter, NHP, togepi-man, bad!",
  attributes: {
    dexterity: { base: 8 },
    insight: { base: 6 },
    might: { base: 10 },
    will: { base: 8 },
    willpower: { base: 8 },
  },
  attacks: [
    {
      name: "Press Pass",
      range: "melee",
      accuracy: { attr1: "might", attr2: "might", value: 0 },
      damage: { value: 10, type: "physical", hrZero: false },
      special: [
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
      ],
    },
    {
      name: "Camera Flash",
      range: "melee",
      accuracy: { attr1: "might", attr2: "dexterity", value: 0 },
      damage: { value: 5, type: "physical", hrZero: false },
      special: [
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
      ],
    },
  ],
  spells: [],
  actions: [
    {
      name: "Cut & Paste",
      spCost: 2,
      effect:
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
    },
  ],
  special: [
    {
      name: "Unnamed Source",
      spCost: 1,
      effect:
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
    },
    {
      name: "Exclusive Interview",
      spCost: 1,
      effect:
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
    },
  ],
  affinities: {
    physical: "rs",
    air: "vu",
    bolt: "ab",
    dark: "no",
    earth: "no",
    fire: "no",
    ice: "no",
    light: "vu",
    poison: "im",
  },
  immunities: {
    slow: true,
    weak: true,
    poisoned: false,
    dazed: false,
    shaken: false,
    enraged: false,
    confused: false,
  },
  equipment: [],
  rareGear: [],
  notes: [
    {
      name: "NHP Nature",
      effect:
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
    },
    {
      name: "Field Observations",
      effect:
        "Interdum phasellus proin facilisis amet placerat suspendisse ipsum nulla varius urna vivamus ut quam facilisis varius ex et proin **placerat** ipsum **maximus** quisque sit lorem.",
    },
  ],
  isElite: false,
};
