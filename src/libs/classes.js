import { t } from "../translation/translate";

const allowedLang = ["en", "it", "es", "pt-BR", "ru"];

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
    skills: [
      {
        skillName: t("Arcane Circle", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("ArcaneCircle_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Arcane Regeneration", false, allowedLang),
        currentLvl: 0,
        maxLvl: 2,
        description: t("ArcaneRegeneration_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Bind and Summon", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("BindAndSummon_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Emergency Arcanum", false, allowedLang),
        currentLvl: 0,
        maxLvl: 6,
        description: t("EmergencyArcanum_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Ritual Arcanism", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("RitualArcanism_desc", false, allowedLang),
        specialSkill: "Ritual Arcanism",
      },
    ],
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
    skills: [
      {
        skillName: t("Consume", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Consume_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Feral Speech", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("FeralSpeech_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Pathogenesis", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Pathogenesis_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Ritual Chimerism", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("RitualChimerism_desc", false, allowedLang),
        specialSkill: "Ritual Chimerism",
      },
      {
        skillName: t("Spell Mimic", false, allowedLang),
        currentLvl: 0,
        maxLvl: 10,
        description: t("SpellMimic_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Agony", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Agony_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Dark Blood", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("DarkBlood_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Heart of Darkness", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("HeartOfDarkness_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Painful Lessons", false, allowedLang),
        currentLvl: 0,
        maxLvl: 3,
        description: t("PainfulLessons_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Shadow Strike", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("ShadowStrike_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Cataclysm", false, allowedLang),
        currentLvl: 0,
        maxLvl: 3,
        description: t("Cataclysm_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Elemental Magic", false, allowedLang),
        currentLvl: 0,
        maxLvl: 10,
        description: t("ElementalMagic_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Magic Artillery", false, allowedLang),
        currentLvl: 0,
        maxLvl: 3,
        description: t("MagicArtillery_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Ritual Elementalism", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("RitualElementalism_desc", false, allowedLang),
        specialSkill: "Ritual Elementalism",
      },
      {
        skillName: t("Spellblade", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("Spellblade_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Absorb MP", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("AbsorbMP_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Entropic Magic", false, allowedLang),
        currentLvl: 0,
        maxLvl: 10,
        description: t("EntropicMagic_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Lucky Seven", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("LuckySeven_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Ritual Entropism", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("RitualEntropism_desc", false, allowedLang),
        specialSkill: "Ritual Entropism",
      },
      {
        skillName: t("Stolen Time", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("StolenTime_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Adrenaline", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Adrenaline_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Frenzy", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Frenzy_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Indomitable Spirit", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("IndomitableSpirit_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Provoke", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Provoke_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Withstand", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Withstand_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Bodyguard", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Bodyguard_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Defensive Mastery", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("DefensiveMastery_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Dual Shieldbearer", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("DualShieldbearer_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Fortress", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Fortress_desc", false, allowedLang),
        specialSkill: "Fortress",
      },
      {
        skillName: t("Protect", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Protect_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Flash of Insight", false, allowedLang),
        currentLvl: 0,
        maxLvl: 3,
        description: t("FlashOfInsight_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Focused", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Focused_desc", false, allowedLang),
        specialSkill: "Focused",
      },
      {
        skillName: t("Knowledge Is Power", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("KnowledgeIsPower_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Quick Assessment", false, allowedLang),
        currentLvl: 0,
        maxLvl: 6,
        description: t("QuickAssessment_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Trained Memory", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("TrainedMemory_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Condemn", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("Condemn_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Encourage", false, allowedLang),
        currentLvl: 0,
        maxLvl: 6,
        description: t("Encourage_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("My Trust In You", false, allowedLang),
        currentLvl: 0,
        maxLvl: 2,
        description: t("MyTrustInYou_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Persuasive", false, allowedLang),
        currentLvl: 0,
        maxLvl: 2,
        description: t("Persuasive_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Unexpected Ally", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("UnexpectedAlly_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Cheap Shot", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("CheapShot_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Dodge", false, allowedLang),
        currentLvl: 0,
        maxLvl: 3,
        description: t("Dodge_desc", false, allowedLang),
        specialSkill: "Dodge",
      },
      {
        skillName: t("High Speed", false, allowedLang),
        currentLvl: 0,
        maxLvl: 3,
        description: t("HighSpeed_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("See You Later", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("SeeYouLater_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Soul Steal", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("SoulSteal_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Barrage", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Barrage_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Crossfire", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Crossfire_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Hawkeye", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Hawkeye_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Ranged Weapon Mastery", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("RangedWeaponMastery_desc", false, allowedLang),
        specialSkill: "Ranged Weapon Mastery",
      },
      {
        skillName: t("Warning Shot", false, allowedLang),
        currentLvl: 0,
        maxLvl: 4,
        description: t("WarningShot_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Healing Power", false, allowedLang),
        currentLvl: 0,
        maxLvl: 2,
        description: t("HealingPower_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Ritual Spiritism", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("RitualSpiritism_desc", false, allowedLang),
        specialSkill: "Ritual Spiritism",
      },
      {
        skillName: t("Spiritual Magic", false, allowedLang),
        currentLvl: 0,
        maxLvl: 10,
        description: t("SpiritualMagic_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Support Magic", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("SupportMagic_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Vismagus", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("Vismagus_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [
      {
        skillName: t("Emergency Item", false, allowedLang),
        currentLvl: 0,
        maxLvl: 1,
        description: t("EmergencyItem_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Gadgets", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Gadgets_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Potion Rain", false, allowedLang),
        currentLvl: 0,
        maxLvl: 2,
        description: t("PotionRain_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Secret Formula", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("SecretFormula_desc", false, allowedLang),
        specialSkill: "",
      },
      {
        skillName: t("Visionary", false, allowedLang),
        currentLvl: 0,
        maxLvl: 5,
        description: t("Visionary_desc", false, allowedLang),
        specialSkill: "",
      },
    ],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
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
    skills: [],
  },
];

export const tinkererAlchemy = {
  spellType: "tinkerer-alchemy",
  rank: 1,
  targets: [
    {
      rangeFrom: 1,
      rangeTo: 6,
      effect: t("You or one ally you can see that is present on the scene"),
    },
    {
      rangeFrom: 7,
      rangeTo: 11,
      effect: t("One enemy you can see that is present on the scene"),
    },
    {
      rangeFrom: 12,
      rangeTo: 16,
      effect: t("You and every ally present on the scene"),
    },
    {
      rangeFrom: 17,
      rangeTo: 20,
      effect: t("Every enemy present on the scene"),
    },
  ],
  effects: [
    {
      dieValue: 0,
      effect: t("suffers 20 poison damage"),
    },
    {
      dieValue: 0,
      effect: t("recovers 30 Hit Points"),
    },
    {
      dieValue: 1,
      effect: t(
        "treats their Dexterity and Might dice as if they were one size higher (up to a maximum of d12) until the end of your next turn"
      ),
    },
    {
      dieValue: 2,
      effect: t(
        "treats their Insight and Willpower dice as if they were one size higher (up to a maximum of d12) until the end of your next turn"
      ),
    },
    {
      dieValue: 3,
      effect: t(
        "suffers 20 air damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher"
      ),
    },
    {
      dieValue: 4,
      effect: t(
        "suffers 20 bolt damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher"
      ),
    },
    {
      dieValue: 5,
      effect: t(
        "suffers 20 dark damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher"
      ),
    },
    {
      dieValue: 6,
      effect: t(
        "suffers 20 earth damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher"
      ),
    },
    {
      dieValue: 7,
      effect: t(
        "suffers 20 fire damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher"
      ),
    },
    {
      dieValue: 8,
      effect: t(
        "suffers 20 ice damage. This amount increases to 30 damage if you are level 20 or higher, or to 40 damage if you are level 40 or higher"
      ),
    },
    {
      dieValue: 9,
      effect: t(
        "gains Resistance to air and fire damage until the end of the scene"
      ),
    },
    {
      dieValue: 10,
      effect: t(
        "gains Resistance to bolt and ice damage until the end of the scene"
      ),
    },
    {
      dieValue: 11,
      effect: t(
        "gains Resistance to dark and earth damage until the end of the scene"
      ),
    },
    {
      dieValue: 12,
      effect: t("suffers enraged"),
    },
    {
      dieValue: 13,
      effect: t("suffers poisoned"),
    },
    {
      dieValue: 14,
      effect: t("suffers dazed, shaken, slow and weak"),
    },
    {
      dieValue: 15,
      effect: t("recovers from all status effects"),
    },
    {
      dieValue: 16,
      effect: t("recovers 50 Hit Points and 50 Mind Points"),
    },
    {
      dieValue: 17,
      effect: t("recovers 50 Hit Points and 50 Mind Points"),
    },
    {
      dieValue: 18,
      effect: t("recovers 100 Hit Points"),
    },
    {
      dieValue: 19,
      effect: t("recovers 100 Mind Points"),
    },
    {
      dieValue: 20,
      effect: t("recovers 100 Hit Points and 100 Mind Points"),
    },
  ],
};

export default classList;
