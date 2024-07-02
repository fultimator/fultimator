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

export default classList;
