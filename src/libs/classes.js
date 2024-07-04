const classList = [
  {
    name: "Arcanist",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: ["arcanist"],
    },
  },
  {
    name: "Chimerist",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: true,
      },
      spellClasses: ["default"],
    },
  },
  {
    name: "Darkblade",
    book: "core",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: true,
        shields: false,
        melee: true,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Elementalist",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: true,
      },
      spellClasses: ["default"],
    },
  },
  {
    name: "Entropist",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: true,
      },
      spellClasses: ["default"],
    },
  },
  {
    name: "Fury",
    book: "core",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: true,
        shields: false,
        melee: true,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Guardian",
    book: "core",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: true,
        shields: true,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Loremaster",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Orator",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Rogue",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 2,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Sharpshooter",
    book: "core",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: true,
        melee: false,
        ranged: true,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Spiritist",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: ["default"],
    },
  },
  {
    name: "Tinkerer",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 2,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [
        "tinkerer-alchemy",
        "tinkerer-infusion",
        "tinkerer-magitech",
      ],
    },
  },
  {
    name: "Wayfarer",
    book: "core",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 2,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Weaponmaster",
    book: "core",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: true,
        melee: true,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Arcanist-Rework",
    book: "rework",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: ["arcanist-rework"],
    },
  },
  {
    name: "Ace of Cards",
    book: "bonus",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: true,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      custom: [
        "You may choose to permanently increase your maximum Hit Points or Mind Points by 5 (your choice).",
      ],
      spellClasses: [],
    },
  },
  {
    name: "Necromancer",
    book: "bonus",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: true,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      custom: [
        "You may choose to permanently increase your maximum Hit Points or Mind Points by 5 (your choice).",
      ],
      spellClasses: [],
    },
  },
  {
    name: "Chanter",
    book: "high",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: ["default"],
    },
  },
  {
    name: "Commander",
    book: "high",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: true,
        ranged: true,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Dancer",
    book: "high",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: true,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      custom: [
        "You may choose to permanently increase your maximum Hit Points or Mind Points by 5 (your choice).",
      ],
      spellClasses: ["default"],
    },
  },
  {
    name: "Symbolist",
    book: "high",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 2,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: ["default"],
    },
  },
  {
    name: "Esper",
    book: "techno",
    benefits: {
      hpplus: 0,
      mpplus: 5,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Mutant",
    book: "techno",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Pilot",
    book: "techno",
    benefits: {
      hpplus: 5,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: true,
        ranged: true,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: [],
    },
  },
  {
    name: "Blank Class",
    book: "homebrew",
    benefits: {
      hpplus: 0,
      mpplus: 0,
      ipplus: 0,
      isCustomBenefit: false,
      martials: {
        armor: false,
        shields: false,
        melee: false,
        ranged: false,
      },
      rituals: {
        ritualism: false,
      },
      spellClasses: ["default"],
    },
  },
];

export const tinkererAlchemy = {
  spellType: "tinkerer-alchemy",
  rank: 1,
  targets: [
    {
      rangeFrom: 1,
      rangeTo: 6,
      effect: "You or one ally you can see that is present on the scene",
    },
    {
      rangeFrom: 7,
      rangeTo: 11,
      effect: "One enemy you can see that is present on the scene",
    },
    {
      rangeFrom: 12,
      rangeTo: 16,
      effect: "You and every ally present on the scene",
    },
    {
      rangeFrom: 17,
      rangeTo: 20,
      effect: "Every enemy present on the scene",
    },
  ],
  effects: [
    {
      dieValue: 0,
      effect: "suffers 20 poison damage",
    },
    {
      dieValue: 0,
      effect: "recovers 30 Hit Points",
    },
    {
      dieValue: 1,
      effect:
        "treats their Dexterity and Might dice as if they were one size higher (up to a maximum of d12 ) until the end of your next turn",
    },
    {
      dieValue: 2,
      effect:
        "treats their Insight and Willpower dice as if they were one size higher (up to a maximum of d12 ) until the end of your next turn",
    },
    {
      dieValue: 3,
      effect:
        "suffers 20 air damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher",
    },
    {
      dieValue: 4,
      effect:
        "suffers 20 bolt damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher",
    },
    {
      dieValue: 5,
      effect:
        "suffers 20 dark damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher",
    },
    {
      dieValue: 6,
      effect:
        "suffers 20 earth damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher",
    },
    {
      dieValue: 7,
      effect:
        "suffers 20 fire damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher",
    },
    {
      dieValue: 8,
      effect:
        "suffers 20 ice damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher",
    },
    {
      dieValue: 9,
      effect:
        "gains Resistance to air and fire damage until the end of the scene",
    },
    {
      dieValue: 10,
      effect:
        "gains Resistance to bolt and ice damage until the end of the scene",
    },
    {
      dieValue: 11,
      effect:
        "gains Resistance to dark and earth damage until the end of the scene",
    },
    {
      dieValue: 12,
      effect: "suffers enraged",
    },
    {
      dieValue: 13,
      effect: "suffers poisoned",
    },
    {
      dieValue: 14,
      effect: "suffers dazed, shaken, slow and weak",
    },
    {
      dieValue: 15,
      effect: "recovers from all status effects",
    },
    {
      dieValue: 16,
      effect: "recovers 50 Hit Points and 50 Mind Points",
    },
    {
      dieValue: 17,
      effect: "recovers 50 Hit Points and 50 Mind Points",
    },
    {
      dieValue: 18,
      effect: "recovers 100 Hit Points",
    },
    {
      dieValue: 19,
      effect: "recovers 100 Mind Points",
    },
    {
      dieValue: 20,
      effect: "recovers 100 Hit Points and 100 Mind Points",
    },
  ],
};

export default classList;
