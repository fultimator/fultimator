import { describe, expect, it } from "vitest";
import { applyNpcPostLoadTransforms } from "../../../libs/actor";
import { validateNpcPersisted } from "../../../forms/schema/actorSchemas/npc";

describe("NPC v0 transform compatibility", () => {
  it("migrates legacy v0-ish npc actor/items into current persisted schema", () => {
    const legacyNpc = {
      id: "npc-v0-1",
      uid: "user-1",
      name: "Legacy Beast",
      lvl: 12,
      species: "Beast",
      rank: "elite",
      sizes: "large",
      attributes: {
        might: 9,
        insight: 8,
        will: 7,
        dexterity: 10,
      },
      affinities: {
        physical: "rs",
        wind: "vu",
      },
      extra: {
        hp: 5,
        mp: 3,
        def: 2,
        mDef: 1,
        extrainit: 2,
        init: true,
        precision: true,
        magic: false,
      },
      armor: {
        name: "old_armor",
        martial: true,
        cost: 1500,
        def: 1,
        mdef: 2,
      },
      sheild: {
        name: "old_shield",
        martial: false,
        cost: 500,
        def: 1,
      },
      attacks: [
        {
          name: "Claw",
          attr1: "dexterity",
          attr2: "might",
          type: "wind",
          range: "distance",
          special: ["target is knocked prone"],
        },
      ],
      weaponattacks: [
        {
          name: "Spear Thrust",
          range: "melee",
          special: ["piercing"],
          weapon: {
            category: "spear_category",
            att1: "dexterity",
            att2: "might",
            prec: 1,
            damage: 6,
            type: "wind",
            range: "distance",
          },
        },
      ],
      spells: [
        {
          name: "Gust",
          type: "offensive",
          target: "one creature",
          mp: "5 MP",
          damagetype: "wind",
          damage: 8,
          attr1: "insight",
          attr2: "will",
          special: ["push target 1 zone"],
        },
      ],
      actions: [{ name: "Roar", effect: "Intimidate nearby enemies" }],
      special: [{ name: "Thick Hide", effect: "Reduce incoming damage by 2" }],
      notes: [],
      raregear: [],
      immunities: { slow: true },
      schemaVersion: 0,
    } as const;

    const migrated = applyNpcPostLoadTransforms(legacyNpc as never);
    const parsed = validateNpcPersisted(migrated);

    expect(parsed.success, JSON.stringify(parsed, null, 2)).toBe(true);
    expect(migrated.schemaVersion).toBeGreaterThanOrEqual(10);
    expect(migrated.attacks?.[0]?.damage?.type).toBe("air");
    expect(migrated.weaponattacks?.[0]?.damage?.type).toBe("air");
    expect(migrated.spells?.[0]?.damage?.type).toBe("air");
    expect(
      (migrated as unknown as Record<string, unknown>).sheild,
    ).toBeUndefined();
  });

  it("migrates a fully-populated legacy npc with all option buckets filled", () => {
    const legacyNpcFull = {
      id: "npc-v0-2",
      uid: "user-2",
      name: "Legacy Archfiend",
      lvl: 45,
      imgurl: "https://example.com/npc.png",
      traits: "flying, armored",
      description: "A fully-loaded legacy npc fixture.",
      species: "Demon",
      rank: "boss",
      sizes: "huge",
      phases: 3,
      villain: "true",
      companionlvl: 2,
      companionpclvl: 20,
      multipart: "yes",
      attributes: { might: 12, insight: 11, will: 10, dexterity: 9 },
      affinities: { wind: "ab", physical: "im", fire: "rs", ice: "vu" },
      immunities: {
        slow: true,
        dazed: true,
        weak: true,
        shaken: true,
        enraged: true,
        poisoned: true,
      },
      extra: {
        hp: 20,
        mp: 10,
        def: 3,
        mDef: 4,
        defOverride: false,
        mDefOverride: true,
        extrainit: 5,
        init: true,
        precision: true,
        magic: true,
        statusImmunity: 2,
      },
      armor: {
        name: "Abyss Plate",
        martial: true,
        cost: 5000,
        def: 4,
        mdef: 3,
      },
      shield: {
        name: "Void Guard",
        martial: true,
        cost: 2800,
        def: 2,
        mdef: 2,
      },
      attacks: [
        {
          name: "Rend",
          attr1: "might",
          attr2: "dexterity",
          type: "lightning",
          range: "melee",
          special: ["inflicts shaken"],
          extraDamage: true,
        },
      ],
      weaponattacks: [
        {
          name: "Lance Burst",
          range: "distance",
          special: ["pierces armor"],
          weapon: {
            category: "spear_category",
            att1: "dexterity",
            att2: "might",
            prec: 2,
            damage: 10,
            type: "wind",
            range: "distance",
          },
        },
      ],
      spells: [
        {
          name: "Cataclysm",
          type: "offensive",
          target: "all enemies",
          mp: "20 MP",
          damagetype: "lightning",
          damage: 14,
          attr1: "insight",
          attr2: "will",
          special: ["inflicts dazed"],
        },
      ],
      special: [{ name: "Aegis", effect: "Reduce all damage by 4", spCost: 1 }],
      actions: [{ name: "Command", effect: "Summon minions", spCost: 2 }],
      notes: [{ name: "Tactics", effect: "Focus weakest target" }],
      raregear: [{ name: "Relic Core", effect: "Drops on defeat" }],
      label: "boss-tag",
      tags: [{ name: "endgame" }],
      createdBy: "tester",
      language: "en",
      published: true,
      schemaVersion: 0,
    } as const;

    const migrated = applyNpcPostLoadTransforms(legacyNpcFull as never);
    const parsed = validateNpcPersisted(migrated);

    expect(parsed.success, JSON.stringify(parsed, null, 2)).toBe(true);
    expect(migrated.schemaVersion).toBeGreaterThanOrEqual(10);
    expect(migrated.features?.init?.enabled).toBe(true);
    expect(migrated.features?.precision?.enabled).toBe(true);
    expect(migrated.features?.magic?.enabled).toBe(true);
    expect(migrated.resources?.hp.bonus).toBe(20);
    expect(migrated.derived?.mdef.override).toBe(4);
    expect(migrated.affinities?.air).toBe("ab");
    expect(migrated.attacks?.[0]?.damage?.type).toBe("bolt");
    expect(migrated.weaponattacks?.[0]?.damage?.type).toBe("air");
    expect(migrated.spells?.[0]?.damage?.type).toBe("bolt");
  });
});
