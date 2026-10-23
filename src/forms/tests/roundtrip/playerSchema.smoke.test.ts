import { describe, expect, it } from "vitest";
import { validatePlayerPersisted } from "../../schema/actorSchemas/pc";

describe("PlayerPersistedSchema", () => {
  it("accepts a minimal canonical player payload", () => {
    const result = validatePlayerPersisted({
      id: "p1",
      uid: "uid-1",
      name: "Test Player",
      lvl: 5,
      info: {
        pronouns: "they/them",
        identity: "hero",
        theme: "courage",
        origin: "village",
        bonds: [],
        description: "",
        fabulapoints: 0,
        exp: 0,
        zenit: 0,
        imgurl: "",
      },
      attributes: {
        might: { base: 8 },
        insight: { base: 8 },
        willpower: { base: 8 },
        dexterity: { base: 8 },
      },
      stats: {
        hp: { base: 40, current: 40 },
        mp: { base: 30, current: 30 },
        ip: { base: 6, current: 6 },
      },
      statuses: {
        slow: false,
        dazed: false,
        weak: false,
        shaken: false,
        enraged: false,
        poisoned: false,
      },
      immunities: {
        slow: false,
        dazed: false,
        weak: false,
        shaken: false,
        enraged: false,
        poisoned: false,
      },
      affinities: {
        physical: "no",
        air: "no",
        bolt: "no",
        dark: "no",
        earth: "no",
        fire: "no",
        ice: "no",
        light: "no",
        poison: "no",
      },
      classes: [],
      equipment: [],
      martials: { armor: false, shields: false, melee: false, ranged: false },
      rituals: {
        ritualism: false,
        arcanism: false,
        chimerism: false,
        elementalism: false,
        entropism: false,
        spiritism: false,
      },
      items: [],
      consumables: [],
      notes: [],
      modifiers: {
        hp: 0,
        mp: 0,
        ip: 0,
        def: 0,
        mdef: 0,
        init: 0,
        meleePrec: 0,
        rangedPrec: 0,
        magicPrec: 0,
      },
    });

    expect(result.success).toBe(true);
  });
});
