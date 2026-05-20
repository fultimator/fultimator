import { describe, expect, it } from "vitest";
import {
  applyPostLoadTransforms,
  applyPreSaveTransforms,
  PLAYER_CURRENT_SCHEMA_VERSION,
} from "../../../components/player/playerTransforms";

describe("Player v0 transform compatibility", () => {
  it("migrates a legacy v0-style player with broad class/item coverage", () => {
    const ALL_CLASS_NAMES = [
      "Arcanist",
      "Chimerist",
      "Darkblade",
      "Elementalist",
      "Entropist",
      "Fury",
      "Guardian",
      "Loremaster",
      "Orator",
      "Rogue",
      "Sharpshooter",
      "Spiritist",
      "Tinkerer",
      "Weaponmaster",
      "Dancer",
      "Esper",
      "Invoker",
      "Mutant",
      "Pilot",
      "Floralist",
      "Gourmet",
      "Symbolist",
      "Chanter",
      "Ace of Cards",
    ];

    const makeClass = (name: string) => ({
      name,
      lvl: 1,
      benefits: { hpplus: 0, mpplus: 0, ipplus: 0, other: [] },
      skills: [
        {
          name: `${name} Skill`,
          description: "",
          currentSL: 1,
          maxLvl: 1,
        },
      ],
      heroic: [],
      spells: [] as unknown[],
    });

    const legacyPlayer = {
      id: "player-v0-1",
      uid: "user-1",
      name: "Legacy Hero",
      lvl: 23,
      info: {
        bonds: [],
      },
      attributes: {
        might: 9,
        insight: 8,
        will: 7,
        dexterity: 10,
      },
      stats: {
        hp: { base: 42, current: 42 },
        mp: { base: 30, current: 30 },
        ip: { base: 8, current: 8 },
      },
      modifiers: {
        hp: 2,
        mp: 1,
        ip: 0,
        def: 1,
        mdef: 0,
        init: 2,
        meleePrec: 1,
        rangedPrec: 0,
        magicPrec: 1,
      },
      classes: [
        {
          ...makeClass("Arcanist"),
          spells: [
            {
              name: "Old Default Spell",
              class: "Arcanist",
              spellType: "default",
              isOffensive: true,
              mp: "5 MP",
              attr1: "insight",
              attr2: "will",
              targetDesc: "One creature",
              damage: 8,
              damagetype: "wind",
            },
            {
              name: "Old Arcanist",
              class: "Arcanist",
              spellType: "arcanist",
              domain: "fire",
              domainDesc: "domain desc",
              merge: "merge",
              mergeDesc: "merge desc",
              dismiss: "dismiss",
              dismissDesc: "dismiss desc",
            },
            {
              name: "Old Arcanist Rework",
              class: "Arcanist",
              spellType: "arcanist-rework",
              domain: "ice",
              domainDesc: "domain desc",
              merge: "merge",
              mergeDesc: "merge desc",
              dismiss: "dismiss",
              dismissDesc: "dismiss desc",
              pulse: "pulse",
              pulseDesc: "pulse desc",
            },
            {
              name: "Old Alchemy",
              class: "Tinkerer",
              spellType: "tinkerer-alchemy",
              category: "bomb",
            },
            {
              name: "Old Infusion",
              class: "Tinkerer",
              spellType: "tinkerer-infusion",
              infusionRank: 2,
            },
            {
              name: "Old Magitech",
              class: "Tinkerer",
              spellType: "tinkerer-magitech",
              rank: 2,
              magispheres: [],
            },
            {
              name: "Old Gift",
              class: "Esper",
              spellType: "gift",
              gifts: [{ name: "esper_gift_custom_name", event: "x", effect: "y" }],
            },
            {
              name: "Old Dance",
              class: "Dancer",
              spellType: "dance",
              dances: [{ name: "dance_custom", duration: "Scene", effect: "z" }],
            },
            {
              name: "Old Therioform",
              class: "Mutant",
              spellType: "therioform",
              therioforms: [{ name: "mutant_therioform_custom_name", description: "shape" }],
            },
            {
              name: "Old Magichant",
              class: "Chanter",
              spellType: "magichant",
              keys: [{ name: "magichant_custom_name", type: "k" }],
              tones: [{ name: "magichant_custom_name", effect: "tone" }],
            },
            {
              name: "Old Symbol",
              class: "Symbolist",
              spellType: "symbol",
              symbols: [{ name: "symbol_custom_name", effect: "sigil" }],
            },
            {
              name: "Old Invocation",
              class: "Invoker",
              spellType: "invocation",
              innerWellspring: true,
              chosenWellspring: "Air",
              activeWellsprings: ["Fire", "Water"],
              invocations: [{ name: "invoker_custom_name", type: "Blast", effect: "boom" }],
            },
            {
              name: "Old Gamble",
              class: "Entropist",
              spellType: "gamble",
              maxTargets: 2,
              duration: "Instantaneous",
              targetDescription: "Special",
            },
            {
              name: "Old Deck",
              class: "Ace of Cards",
              spellType: "deck",
              cardsInDeck: 30,
              hand: [],
              discardPile: [],
            },
            {
              name: "Old Cooking",
              class: "Gourmet",
              spellType: "cooking",
              cookbookEffects: {
                "earth_fire": { taste1: "earth", taste2: "fire", effect: "burn" },
              },
              ingredientInventory: [{ id: "i1", name: "Salt", quantity: 2, taste: "earth" }],
            },
            {
              name: "Old Magiseed",
              class: "Floralist",
              spellType: "magiseed",
              magiseeds: [{ name: "magiseed_custom", description: "seed", rangeStart: 1, rangeEnd: 4 }],
            },
            {
              name: "Old Pilot",
              class: "Pilot",
              spellType: "pilot-vehicle",
              pilotSubtype: "frame",
              vehicles: [
                {
                  name: "legacy_vehicle",
                  customName: "Bike",
                  enabled: true,
                  modules: [
                    {
                      name: "pilot_custom_weapon",
                      type: "pilot_module_weapon",
                      equipped: true,
                      equippedSlot: "main",
                      att1: "might",
                      att2: "dexterity",
                      prec: 1,
                      damage: 6,
                      damageType: "lightning",
                    },
                    {
                      name: "pilot_custom_armor",
                      type: "pilot_module_armor",
                      equipped: true,
                    },
                    {
                      name: "pilot_custom_support",
                      type: "pilot_module_support",
                      equipped: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        ...ALL_CLASS_NAMES.filter((n) => n !== "Arcanist").map(makeClass),
      ],
      // Legacy root-level inventory arrays (v0 style)
      weapons: [
        {
          name: "Old Sword",
          category: "spear_category",
          type: "wind",
          att1: "might",
          att2: "dexterity",
          prec: 1,
          damage: 7,
          isEquipped: true,
        },
      ],
      customWeapons: [
        {
          name: "Old Custom",
          selectedCategory: "Heavy",
          selectedAccuracyCheck: { att1: "might", att2: "insight" },
          currentCustomizations: [{ name: "weapon_customization_powerful" }],
          isEquipped: true,
        },
      ],
      armor: [{ name: "Old Armor", martial: true, cost: 1200, isEquipped: true }],
      shields: [{ name: "Old Shield", martial: false, cost: 500, isEquipped: true }],
      accessories: [{ name: "Old Ring", cost: 300, isEquipped: true }],
      equipment: [
        {
          mnemospheres: [
            {
              id: "mn-1",
              class: "Arcanist",
              lvl: 10,
              skills: [],
              heroic: [],
              spells: [],
            },
          ],
          hoplospheres: [
            {
              id: "hp-1",
              name: "Hoplo A",
              description: "hoplo",
              socketable: "all",
              requiredSlots: 1,
              cost: 1000,
            },
          ],
          mnemoReceptacle: ["mn-1"],
        },
      ],
      items: [{ name: "Potion", description: "", value: 50, quantity: 2 }],
      consumables: [{ name: "Elixir", description: "", ipCost: 1 }],
      notes: ["legacy plain note", { name: "Named note", description: "desc" }],
      schemaVersion: 0,
    } as const;

    const migrated = applyPostLoadTransforms(legacyPlayer as never);

    // Migration stamped and core required shape present
    expect(migrated.schemaVersion).toBe(PLAYER_CURRENT_SCHEMA_VERSION);
    expect(Array.isArray(migrated.equipment)).toBe(true);
    expect(migrated.equipment[0]).toBeDefined();
    expect(Array.isArray(migrated.classes)).toBe(true);
    expect(migrated.classes.length).toBeGreaterThanOrEqual(ALL_CLASS_NAMES.length);
    expect(Array.isArray(migrated.notes)).toBe(true);
    expect(typeof migrated.attributes.willpower.base).toBe("number");
    expect(migrated.resources?.hp).toBeDefined();
    expect(migrated.derived?.def).toBeDefined();

    // Legacy root arrays were moved into equipment[0]
    const raw = migrated as unknown as Record<string, unknown>;
    expect(raw.weapons).toBeUndefined();
    expect(raw.armor).toBeUndefined();
    expect(raw.shields).toBeUndefined();
    expect(raw.accessories).toBeUndefined();

    const eq0 = migrated.equipment[0];
    expect(eq0.weapons?.length).toBeGreaterThan(0);
    expect(eq0.customWeapons?.length).toBeGreaterThan(0);
    expect(eq0.armor?.length).toBeGreaterThan(0);
    expect(eq0.shields?.length).toBeGreaterThan(0);
    expect(eq0.accessories?.length).toBeGreaterThan(0);
    expect(eq0.mnemospheres?.length).toBeGreaterThan(0);
    expect(eq0.hoplospheres?.length).toBeGreaterThan(0);

    // Notes normalized from strings to objects
    expect(typeof migrated.notes[0].description).toBe("string");

    // Spell v11 migrations
    const spells = migrated.classes[0].spells as unknown as Array<
      Record<string, unknown>
    >;
    const findSpell = (type: string) => spells.find((s) => s.spellType === type);
    expect((findSpell("gift")?.gifts as Array<Record<string, unknown>>)?.[0]?.key).toBeDefined();
    expect((findSpell("dance")?.dances as Array<Record<string, unknown>>)?.[0]?.key).toBeDefined();
    expect(
      (findSpell("therioform")?.therioforms as Array<Record<string, unknown>>)?.[0]
        ?.key,
    ).toBeDefined();
    expect((findSpell("symbol")?.symbols as Array<Record<string, unknown>>)?.[0]?.key).toBeDefined();
    expect((findSpell("magichant")?.keys as Array<Record<string, unknown>>)?.[0]?.key).toBeDefined();
    expect((findSpell("magichant")?.tones as Array<Record<string, unknown>>)?.[0]?.key).toBeDefined();
    expect(findSpell("invocation")?.tracker).toBeDefined();
    expect(findSpell("invocation")?.activeWellsprings).toBeUndefined();
    expect(findSpell("cooking")?.cookbook).toBeDefined();
    expect(findSpell("cooking")?.cookbookEffects).toBeUndefined();
    expect(findSpell("deck")).toBeDefined();
    expect(findSpell("gamble")).toBeDefined();
    expect(findSpell("arcanist")).toBeDefined();
    expect(findSpell("arcanist-rework")).toBeDefined();
    expect(findSpell("tinkerer-alchemy")).toBeDefined();
    expect(findSpell("tinkerer-infusion")).toBeDefined();
    expect(findSpell("tinkerer-magitech")).toBeDefined();

    const pilot = findSpell("pilot-vehicle");
    const pilotVehicles = pilot?.vehicles as Array<Record<string, unknown>>;
    const pilotModules = pilotVehicles?.[0]?.modules as Array<
      Record<string, unknown>
    >;
    expect(pilotVehicles?.[0]?.slots).toBeDefined();
    expect(pilotModules?.[0]?.accuracy).toBeDefined();
    expect(pilotModules?.[0]?.damage).toBeDefined();
    expect(pilotModules?.[0]?.key).toBeDefined();

    // Pre-save strips runtime flags; post-load rehydrates safely
    const saved = applyPreSaveTransforms(migrated);
    const savedEq0 = saved.equipment[0];
    expect(savedEq0.weapons?.[0]?.isEquipped).toBeUndefined();
    expect(savedEq0.customWeapons?.[0]?.isEquipped).toBeUndefined();
    expect(savedEq0.armor?.[0]?.isEquipped).toBeUndefined();
    expect(savedEq0.shields?.[0]?.isEquipped).toBeUndefined();
    expect(savedEq0.accessories?.[0]?.isEquipped).toBeUndefined();

    const reloaded = applyPostLoadTransforms(saved);
    expect(reloaded.schemaVersion).toBe(PLAYER_CURRENT_SCHEMA_VERSION);
    expect(reloaded.equipment[0].weapons?.[0]?.isEquipped).toBeDefined();
  });
});
