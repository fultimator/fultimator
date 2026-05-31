export const SAMPLE_PC = {
  "settings": { "defaultView": "normal", "automaticClassLevel": true, "advancement": false, "optionalRules": { "quirks": false, "campActivities": false, "zeroPower": false, "technospheres": false, "technospheresVariant": "standard", "innateClasses": [] } },
  "consumables": [],
  "dataType": "pc",
  "immunities": { "dazed": false, "slow": false, "shaken": false, "weak": false, "poisoned": false, "enraged": false },
  "rituals": { "spiritism": false, "chimerism": false, "arcanism": false, "entropism": false, "elementalism": false, "ritualism": false },
  "martials": { "ranged": false, "armor": false, "shields": false, "melee": false },
  "classes": [
    {
      "fuid": "tinkerer", "isHomebrew": false, "lvl": 10,
      "heroic": { "fuid": "upgrade", "description": "When you rest, you may choose any number of weapons, armor, and/or shields among those owned by your group.", "name": "Upgrade" },
      "skills": [
        { "fuid": "emergency-item", "currentLvl": 1, "maxLvl": 1, "skillName": "Emergency Item", "specialSkill": "", "description": "EmergencyItem_desc" },
        { "fuid": "gadgets", "skillName": "Gadgets", "maxLvl": 5, "description": "Gadgets_desc", "specialSkill": "", "currentLvl": 3 },
        { "fuid": "potion-rain", "specialSkill": "", "description": "PotionRain_desc", "maxLvl": 2, "skillName": "Potion Rain", "currentLvl": 0 },
        { "fuid": "secret-formula", "description": "SecretFormula_desc", "specialSkill": "", "skillName": "Secret Formula", "maxLvl": 5, "currentLvl": 1 },
        { "fuid": "visionary", "specialSkill": "", "description": "Visionary_desc", "maxLvl": 5, "skillName": "Visionary", "currentLvl": 5 }
      ],
      "name": "Tinkerer",
      "spells": [
        { "fuid": "heal", "isOffensive": false, "isMagisphere": true, "name": "Heal", "maxTargets": 3, "itemType": "spell", "showInPlayerSheet": true, "accuracy": { "defense": "mdef", "attr2": "dexterity", "value": 0, "attr1": "dexterity" }, "range": "ranged", "targetDescription": "Up to three creatures", "special": [], "cost": { "perTarget": true, "amount": 10, "resource": "mp" }, "spellType": "default", "duration": "Instantaneous", "description": "You invigorate your companions, soothing their pain and healing their fatigue. Each target recovers 40 Hit Points.", "damage": { "hrZero": false, "type": "physical", "value": 0 } },
        { "fuid": "reinforce", "special": [], "targetDescription": "Up to three creatures", "damage": { "type": "physical", "hrZero": false, "value": 0 }, "description": "You protect the targets from attacks that would corrupt their body and spirit.", "duration": "Scene", "cost": { "resource": "mp", "amount": 5, "perTarget": true }, "spellType": "default", "isMagisphere": true, "isOffensive": false, "range": "ranged", "accuracy": { "attr2": "dexterity", "value": 0, "defense": "mdef", "attr1": "dexterity" }, "showInPlayerSheet": true, "itemType": "spell", "name": "Reinforce", "maxTargets": 3 },
        { "fuid": "dispel", "range": "ranged", "itemType": "spell", "maxTargets": 1, "name": "Dispel", "accuracy": { "value": 0, "defense": "mdef", "attr2": "dexterity", "attr1": "dexterity" }, "showInPlayerSheet": true, "isOffensive": false, "isMagisphere": false, "duration": "Instantaneous", "description": "You release a wave of negative energy and cleanse all magic from a creature.", "damage": { "hrZero": false, "type": "physical", "value": 0 }, "cost": { "perTarget": true, "resource": "mp", "amount": 10 }, "spellType": "default", "special": [], "targetDescription": "One creature" }
      ],
      "benefits": { "rituals": { "ritualism": false }, "mpplus": 0, "ipplus": 2, "hpplus": 0, "isCustomBenefit": false, "spellClasses": ["tinkerer-alchemy", "tinkerer-infusion", "tinkerer-magitech", "default"], "martials": { "melee": false, "ranged": false, "shields": false, "armor": false } }
    },
    {
      "fuid": "pilot", "spells": [],
      "benefits": { "rituals": { "ritualism": false }, "ipplus": 0, "mpplus": 0, "hpplus": 5, "spellClasses": ["pilot-vehicle"], "isCustomBenefit": false, "martials": { "melee": true, "shields": false, "ranged": true, "armor": false } },
      "isHomebrew": false, "lvl": 10,
      "skills": [
        { "fuid": "compression-tech", "description": "CompressionTech_desc", "specialSkill": "", "skillName": "Compression Tech", "maxLvl": 1, "currentLvl": 1 },
        { "fuid": "flexible-configuration", "currentLvl": 2, "skillName": "Flexible Configuration", "maxLvl": 4, "description": "FlexibleConfiguration_desc", "specialSkill": "" },
        { "fuid": "heart-in-the-engine", "currentLvl": 3, "maxLvl": 3, "skillName": "Heart in the Engine", "specialSkill": "", "description": "HeartInTheEngine_desc" },
        { "fuid": "personal-vehicle", "maxLvl": 5, "skillName": "Personal Vehicle", "specialSkill": "", "description": "PersonalVehicle_desc", "currentLvl": 3 },
        { "fuid": "strong-grip", "currentLvl": 1, "skillName": "Strong Grip", "maxLvl": 1, "description": "StrongGrip_desc", "specialSkill": "" }
      ],
      "heroic": { "fuid": "deep-pockets", "name": "Deep Pockets", "description": "When you spend Inventory Points, you spend 1 less Inventory Point (minimum 1)." },
      "name": "Pilot"
    },
    {
      "fuid": "loremaster",
      "heroic": { "fuid": "mathemagic", "description": "When you cast a spell with a target of One creature, you may choose an Attribute and a die size.", "name": "Mathemagic" },
      "skills": [
        { "fuid": "flash-of-insight", "maxLvl": 3, "skillName": "Flash of Insight", "specialSkill": "", "description": "FlashOfInsight_desc", "currentLvl": 3 },
        { "fuid": "focused", "currentLvl": 5, "description": "Focused_desc", "specialSkill": "Focused", "skillName": "Focused", "maxLvl": 5 },
        { "fuid": "knowledge-is-power", "currentLvl": 1, "specialSkill": "", "description": "KnowledgeIsPower_desc", "maxLvl": 1, "skillName": "Knowledge Is Power" },
        { "fuid": "quick-assessment", "currentLvl": 0, "description": "QuickAssessment_desc", "specialSkill": "", "skillName": "Quick Assessment", "maxLvl": 6 },
        { "fuid": "trained-memory", "specialSkill": "", "description": "TrainedMemory_desc", "maxLvl": 1, "skillName": "Trained Memory", "currentLvl": 1 }
      ],
      "lvl": 10, "isHomebrew": false, "name": "Loremaster", "spells": [],
      "benefits": { "ipplus": 0, "mpplus": 5, "rituals": { "ritualism": false }, "isCustomBenefit": false, "hpplus": 0, "spellClasses": [], "martials": { "melee": false, "shields": false, "ranged": false, "armor": false } }
    },
    {
      "fuid": "wayfarer", "spells": [],
      "benefits": { "mpplus": 0, "ipplus": 2, "rituals": { "ritualism": false }, "martials": { "melee": false, "shields": false, "armor": false, "ranged": false }, "isCustomBenefit": false, "hpplus": 0, "spellClasses": [] },
      "isHomebrew": false, "lvl": 10,
      "skills": [
        { "fuid": "faithful-companion", "currentLvl": 0, "skillName": "Faithful Companion", "maxLvl": 5, "description": "FaithfulCompanion_desc", "specialSkill": "Faithful Companion" },
        { "fuid": "resourceful", "currentLvl": 4, "skillName": "Resourceful", "maxLvl": 4, "description": "Resourceful_desc", "specialSkill": "" },
        { "fuid": "tavern-talk", "currentLvl": 3, "specialSkill": "", "description": "TavernTalk_desc", "maxLvl": 3, "skillName": "Tavern Talk" },
        { "fuid": "treasure-hunter", "currentLvl": 2, "specialSkill": "", "description": "TreasureHunter_desc", "maxLvl": 2, "skillName": "Treasure Hunter" },
        { "fuid": "well-traveled", "skillName": "Well-Traveled", "maxLvl": 1, "description": "WellTraveled_desc", "specialSkill": "", "currentLvl": 1 }
      ],
      "heroic": { "fuid": "extra-spells", "name": "Extra Spells", "description": "Elementalist: Fulgur and Thunderbolt" },
      "name": "Wayfarer"
    },
    {
      "fuid": "weaponmaster", "name": "Weaponmaster", "isHomebrew": false,
      "skills": [
        { "fuid": "bladestorm", "description": "Bladestorm_desc", "specialSkill": "", "skillName": "Bladestorm", "maxLvl": 1, "currentLvl": 1 },
        { "fuid": "bone-crusher", "currentLvl": 4, "specialSkill": "", "description": "BoneCrusher_desc", "maxLvl": 4, "skillName": "Bone Crusher" },
        { "fuid": "breach", "currentLvl": 0, "skillName": "Breach", "maxLvl": 3, "description": "Breach_desc", "specialSkill": "" },
        { "fuid": "counterattack", "currentLvl": 1, "description": "Counterattack_desc", "specialSkill": "", "skillName": "Counterattack", "maxLvl": 1 },
        { "fuid": "melee-weapon-mastery", "currentLvl": 4, "maxLvl": 4, "skillName": "Melee Weapon Mastery", "specialSkill": "Melee Weapon Mastery", "description": "MeleeWeaponMastery_desc" }
      ],
      "lvl": 10,
      "heroic": { "fuid": "tempest-strike", "description": "When you perform a melee attack with the multi property, you gain a bonus to your Accuracy Check.", "name": "Tempest Strike" },
      "benefits": { "rituals": { "ritualism": false }, "ipplus": 0, "mpplus": 0, "martials": { "melee": true, "armor": false, "ranged": false, "shields": true }, "isCustomBenefit": false, "spellClasses": [], "hpplus": 5 },
      "spells": []
    }
  ],
  "affinities": {
    "physical": "rs",
    "air": "no",
    "bolt": "im",
    "dark": "no",
    "earth": "no",
    "fire": "vu",
    "ice": "rs",
    "light": "no",
    "poison": "ab"
  },
  "lvl": 50,
  "info": {
    "imgurl": "",
    "bonds": [
      { "loyality": false, "admiration": true, "name": "Reiko", "mistrust": true, "hatred": false, "inferiority": false, "affection": true },
      { "name": "Cryus", "admiration": false, "loyality": false, "affection": false, "inferiority": true, "mistrust": false, "hatred": true }
    ],
    "exp": 0, "theme": "Guilt", "pronouns": "He/him", "identity": "Magitech Engineer",
    "description": "Pellentesque elementum sed lacus ut aliquam maximus vel proin lorem sollicitudin maximus vivamus condimentum nisl lacus adipiscing nulla amet consectetur amet eu adipiscing felis nec.\n\nEget maecenas nec interdum tincidunt commodo nec pellentesque nisi commodo sollicitudin maximus et maximus arcu elit quisque nulla phasellus maximus arcu adipiscing molestie diam morbi.",
    "fabulapoints": 4, "origin": "Neo-Babylon", "zenit": 370, "portraitFitMode": "cover"
  },
  "notes": [
    {
      "name": "Mission: Test Ruins",
      "description": "Bibendum elementum molestie ac commodo erat sem porta est congue sed gravida condimentum sit arcu suspendisse sem facilisis ex quisque gravida commodo amet scelerisque elit facilisis.\n\nLacus metus molestie suspendisse tortor tincidunt magna pellentesque elementum eros nec ipsum morbi sem tempus congue.",
      "clocks": [{ "name": "Infiltrate", "sections": 4, "state": [true, true, false, false] }]
    },
    {
      "name": "Rumor: Ancient Arcanum",
      "description": "Bibendum elementum molestie ac commodo erat sem porta est congue sed gravida condimentum sit arcu suspendisse.",
      "clocks": [
        { "name": "Track Merchant", "sections": 6, "state": [false, false, false, false, false, false] },
        { "name": "Find Location", "sections": 8, "state": [false, false, false, false, false, false, false, false] },
        { "name": "Unlock Seal", "sections": 10, "state": [true, true, false, false, false, false, false, false, false, false] }
      ]
    }
  ],
  "equippedSlots": {
    "mainHand": { "source": "weapons", "name": "Magicannon", "index": 0 },
    "offHand": null,
    "armor": { "source": "armor", "name": "Engineer Jacket", "index": 0 },
    "accessory": { "source": "accessories", "name": "Portable Battery", "index": 0 }
  },
  "uid": "local-user",
  "attributes": { "might": { "base": 10 }, "insight": { "base": 10 }, "willpower": { "base": 8 }, "dexterity": { "base": 8 } },
  "items": [],
  "statuses": { "dazed": false, "migUp": false, "poisoned": false, "insUp": false, "dexUp": false, "slow": false, "shaken": false, "weak": false, "enraged": false, "wlpUp": false },
  "vehicleSlots": {
    "mainHand": { "vehicleName": "Magitek Armor", "moduleName": "pilot_module_claw" },
    "offHand": { "vehicleName": "Magitek Armor", "moduleName": "pilot_module_cannon" },
    "armor": { "vehicleName": "Magitek Armor", "moduleName": "pilot_module_standard_plating" },
    "accessory": null,
    "support": [{ "vehicleName": "Magitek Armor", "moduleName": "pilot_module_secondary_offensive" }]
  },
  "modifiers": { "mdef": 0, "init": 0, "hp": 0, "ip": 0, "meleePrec": 0, "magicPrec": 0, "rangedPrec": 0, "def": 0, "mp": 0 },
  "schemaVersion": 11,
  "name": "Cidolfus Orlandeau",
  "published": false,
  "stats": { "hp": { "max": 110, "current": 110 }, "ip": { "max": 10, "current": 10 }, "mp": { "max": 110, "current": 110 } },
  "equipment": [{
    "shields": [
      { "base": { "fuid": "bronze-shield", "category": "Shield", "name": "Bronze Shield", "cost": 100, "def": 2, "mdef": 0, "martial": false, "init": 0 }, "name": "Bronze Shield", "quality": "", "category": "Shield", "martial": false, "def": 2, "mdef": 0, "init": 0, "cost": 100 }
    ],
    "accessories": [
      { "quality": "Commodo phasellus vivamus varius sem morbi tincidunt suspendisse nec nulla urna ex metus ex bibendum metus tristique tortor accumsan lorem bibendum diam elementum gravida phasellus.", "name": "Portable Battery", "damageMeleeModifier": 0, "precModifier": 0, "mDefModifier": 0, "magicModifier": 0, "defModifier": 0, "qualityCost": "1500", "cost": 1500, "selectedQuality": "", "damageRangedModifier": 0, "initModifier": 0, "martial": false, "isMartial": false, "value": 1500, "modifiers": { "accuracy": 0 } }
    ],
    "weapons": [
      { "name": "Magicannon", "modifiers": { "damage": 0, "accuracy": 0, "def": 0, "mdef": 0 }, "itemType": "weapon", "rework": false, "accuracy": { "attr1": "dexterity", "attr2": "might", "value": 1, "defense": "def" }, "range": "melee", "quality": "", "totalBonus": 0, "magicannon": true, "base": { "hands": 2, "ranged": true, "martial": false, "category": "Firearm", "att1": "dexterity", "type": "physical", "damage": 10, "prec": 1, "cost": 0, "att2": "insight", "name": "Magicannon" }, "cost": 0, "damage": { "value": 0, "type": "physical", "hrZero": false }, "category": "Firearm", "martial": false, "dataType": "weapon", "selectedQuality": "", "hands": 2 },
      { "itemType": "weapon", "name": "Katana", "modifiers": { "damage": 0, "accuracy": 0, "def": 0, "mdef": 0 }, "accuracy": { "attr1": "dexterity", "attr2": "might", "value": 1, "defense": "def" }, "rework": false, "range": "melee", "quality": "", "totalBonus": 0, "base": { "name": "Katana", "cost": 200, "att2": "insight", "prec": 1, "damage": 10, "type": "physical", "melee": true, "att1": "dexterity", "category": "Sword", "martial": true, "hands": 2 }, "cost": 200, "damage": { "value": 0, "type": "physical", "hrZero": false }, "qualityCost": 0, "martial": true, "category": "Sword", "selectedQuality": "", "hands": 2 }
    ],
    "customWeapons": [
      { "name": "Switchblade", "fuid": "switchblade", "category": "weapon_category_sword", "range": "melee", "customizations": [{ "name": "weapon_customization_transforming", "effect": "weapon_customization_transforming_effect", "martial": false, "customCost": 1 }, { "name": "weapon_customization_defenseboost", "effect": "weapon_customization_defenseboost_effect", "martial": false, "customCost": 1 }, { "name": "weapon_customization_accurate", "effect": "weapon_customization_accurate_effect", "martial": false, "customCost": 1 }], "quality": "You have Resistance to two types of damage (except physical)", "qualityCost": 1000, "selectedQuality": "Dual Resistance", "cost": 1700, "hands": 2, "martial": false, "secondAccuracy": { "attr1": "dexterity", "attr2": "might", "value": 3, "defense": "def" }, "secondDamage": { "value": 11, "type": "physical", "hrZero": false }, "itemType": "customWeapon", "modifiers": { "damage": 0, "accuracy": 0, "def": 0, "mdef": 0 }, "secondModifiers": { "damage": 0, "accuracy": 0, "def": 0, "mdef": 0 }, "secondCustomizations": [{ "name": "weapon_customization_transforming", "effect": "weapon_customization_transforming_effect", "martial": false, "customCost": 1 }, { "name": "weapon_customization_accurate", "effect": "weapon_customization_accurate_effect", "martial": false, "customCost": 1 }], "activeForm": "primary", "accuracy": { "attr1": "dexterity", "attr2": "insight", "value": 3, "defense": "def" }, "damage": { "value": 9, "type": "physical", "hrZero": false }, "secondSelectedCategory": "weapon_category_bow", "secondSelectedRange": "melee" }
    ],
    "armor": [
      { "cost": 1000, "qualityCost": "900", "def": 1, "category": "Armor", "damageMeleeModifier": 0, "mdef": 1, "initModifier": 0, "martial": false, "selectedQuality": "", "precModifier": 0, "rework": false, "name": "Engineer Jacket", "damagedRangedModifier": 0, "quality": "Commodo phasellus vivamus varius sem morbi tincidunt suspendisse nec nulla urna ex metus ex bibendum metus tristique tortor accumsan lorem bibendum diam elementum gravida phasellus.", "init": -1, "defModifier": 0, "magicModifier": 0, "mDefModifier": 0, "base": { "armor": true, "def": 1, "martial": false, "cost": 100, "category": "Armor", "mdef": 1, "init": -1, "name": "Travel Garb" }, "isMartial": false, "value": 1000, "modifiers": { "accuracy": 0 } }
    ]
  }],
  "resources": { "hp": { "current": 110, "bonus": 0 }, "mp": { "current": 110, "bonus": 0 } },
  "derived": { "def": { "bonus": 0 }, "mdef": { "bonus": 0 }, "init": { "bonus": 0 } },
  "id": "dc5dc489-919c-4636-b2a4-c4f640fefc34"
};
