import { describe, expect, it } from "vitest";
import { resolveActorEffects } from "./actorEffectsResolver";
import type { Behavior } from "../types/Effects";
import type { TypeNpc } from "../types/Npcs";
import type { TypePlayer } from "../types/Players";
import { Affinities } from "../types/Misc";

function transferBehavior(
  value: number,
  key = "bonuses.accuracy.all",
): Behavior {
  return {
    id: `effect-${value}`,
    name: `Accuracy ${value}`,
    transfer: true,
    trigger: { kind: "passive" },
    changes: [{ key, mode: 2, value: String(value) }],
  };
}

function playerWithEquipment(
  equipment: TypePlayer["equipment"][number],
): TypePlayer {
  return {
    classes: [],
    equipment: [equipment],
  } as unknown as TypePlayer;
}

describe("resolveActorEffects", () => {
  it("transfers non-equipment player item effects just by existing", () => {
    const player = {
      classes: [
        {
          name: "Weaponmaster",
          lvl: 1,
          skills: [
            {
              name: "Training",
              maxLvl: 1,
              currentLvl: 1,
              behaviors: [transferBehavior(4, "bonuses.accuracy.melee")],
            },
          ],
          heroic: [],
          spells: [],
        },
      ],
      equipment: [],
    } as unknown as TypePlayer;

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.melee).toBe(4);
  });

  it("transfers non-equipment NPC item effects just by existing", () => {
    const npc = {
      actions: [
        {
          name: "Tactical Orders",
          effect: "",
          behaviors: [transferBehavior(5, "bonuses.accuracy.ranged")],
        },
      ],
    } as unknown as TypeNpc;

    const { bonuses } = resolveActorEffects(npc);

    expect(bonuses.accuracy.ranged).toBe(5);
  });

  it("transfers effects only from equipped player equipment", () => {
    const equipped = {
      itemType: "weapon",
      name: "Equipped Sword",
      behaviors: [transferBehavior(2, "bonuses.accuracy.sword")],
    };
    const inventory = {
      itemType: "weapon",
      name: "Inventory Sword",
      behaviors: [transferBehavior(7, "bonuses.accuracy.sword")],
    };
    const player = {
      ...playerWithEquipment({
        weapons: [equipped, inventory],
        customWeapons: [],
        shields: [],
        armor: [],
        accessories: [],
      } as unknown as TypePlayer["equipment"][number]),
      equippedSlots: {
        mainHand: { source: "weapons", name: "Equipped Sword", index: 0 },
      },
    } as unknown as TypePlayer;

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.sword).toBe(2);
  });

  it("uses legacy isEquipped flags when equippedSlots is missing", () => {
    const player = playerWithEquipment({
      weapons: [
        {
          itemType: "weapon",
          name: "Old Equipped Sword",
          isEquipped: true,
          behaviors: [transferBehavior(3, "bonuses.accuracy.sword")],
        },
        {
          itemType: "weapon",
          name: "Old Inventory Sword",
          isEquipped: false,
          behaviors: [transferBehavior(9, "bonuses.accuracy.sword")],
        },
      ],
      customWeapons: [],
      shields: [],
      armor: [],
      accessories: [],
    } as unknown as TypePlayer["equipment"][number]);

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.sword).toBe(3);
  });

  it("ignores null/undefined equipment entries without crashing", () => {
    const player = playerWithEquipment({
      weapons: [
        null,
        {
          itemType: "weapon",
          name: "Equipped Sword",
          isEquipped: true,
          behaviors: [transferBehavior(3, "bonuses.accuracy.sword")],
        },
      ],
      customWeapons: [undefined],
      shields: [null],
      armor: [],
      accessories: [null],
    } as unknown as TypePlayer["equipment"][number]);

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.sword).toBe(3);
  });

  it("transfers hoplosphere and mnemosphere effects only when slotted into equipped weapons", () => {
    const player = {
      ...playerWithEquipment({
        weapons: [],
        customWeapons: [
          {
            itemType: "customWeapon",
            name: "Socketed Bow",
            slotted: ["hoplo-equipped", "mnemo-equipped"],
          },
          {
            itemType: "customWeapon",
            name: "Stored Bow",
            slotted: ["hoplo-stored"],
          },
        ],
        shields: [],
        armor: [
          {
            itemType: "armor",
            name: "Socketed Armor",
            slotted: ["hoplo-armor"],
            isEquipped: true,
          },
        ],
        accessories: [],
        hoplospheres: [
          {
            id: "hoplo-equipped",
            name: "Equipped Hoplo",
            description: "",
            socketable: "weapon",
            requiredSlots: 1,
            cost: 0,
            behaviors: [transferBehavior(2)],
          },
          {
            id: "hoplo-stored",
            name: "Stored Hoplo",
            description: "",
            socketable: "weapon",
            requiredSlots: 1,
            cost: 0,
            behaviors: [transferBehavior(5)],
          },
          {
            id: "hoplo-armor",
            name: "Armor Hoplo",
            description: "",
            socketable: "all",
            requiredSlots: 1,
            cost: 0,
            behaviors: [transferBehavior(11)],
          },
        ],
        mnemospheres: [
          {
            id: "mnemo-equipped",
            class: "Sharpshooter",
            lvl: 1,
            skills: [
              {
                name: "Aim",
                maxLvl: 1,
                currentLvl: 1,
                behaviors: [transferBehavior(3)],
              },
            ],
            heroic: [],
            spells: [],
          },
        ],
      } as unknown as TypePlayer["equipment"][number]),
      equippedSlots: {
        mainHand: { source: "customWeapons", name: "Socketed Bow", index: 0 },
        armor: { source: "armor", name: "Socketed Armor", index: 0 },
      },
    } as unknown as TypePlayer;

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.all).toBe(5);
  });

  it("transfers behaviors from spell sub-items (gifts, tones, etc.)", () => {
    const player = {
      classes: [
        {
          name: "Esper",
          lvl: 1,
          skills: [],
          heroic: [],
          spells: [
            {
              name: "Telekinesis",
              spellType: "gift",
              behaviors: [],
              gifts: [
                {
                  key: "esper_gift_atmokinesis",
                  behaviors: [transferBehavior(3, "bonuses.accuracy.all")],
                },
                {
                  key: "esper_gift_clairvoyance",
                  behaviors: [],
                },
              ],
            },
          ],
        },
      ],
      equipment: [],
    } as unknown as TypePlayer;

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.all).toBe(3);
  });

  it("transfers behaviors from pilot vehicle modules", () => {
    const player = {
      classes: [
        {
          name: "Pilot",
          lvl: 1,
          skills: [],
          heroic: [],
          spells: [
            {
              name: "Mech",
              spellType: "pilot-vehicle",
              behaviors: [],
              vehicles: [
                {
                  customName: "Iron Golem",
                  behaviors: [transferBehavior(1, "bonuses.accuracy.all")],
                  modules: [
                    {
                      name: "pilot_custom_weapon",
                      behaviors: [transferBehavior(2, "bonuses.accuracy.all")],
                    },
                    {
                      name: "pilot_module_sword",
                      behaviors: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      equipment: [],
    } as unknown as TypePlayer;

    const { bonuses } = resolveActorEffects(player);

    expect(bonuses.accuracy.all).toBe(3);
  });

  it("honors crisis predicates from the resolve context", () => {
    const player = {
      effects: [
        {
          id: "crisis",
          name: "Crisis Focus",
          behaviors: [
            {
              id: "crisis-beh",
              name: "Crisis Focus",
              trigger: { kind: "passive" },
              predicate: { crisisInteraction: "active" },
              changes: [{ key: "bonuses.accuracy.all", mode: 2, value: "4" }],
            },
          ],
        },
      ],
      classes: [],
      equipment: [],
    } as unknown as TypePlayer;

    expect(
      resolveActorEffects(player, { inCrisis: false }).bonuses.accuracy.all,
    ).toBe(0);
    expect(
      resolveActorEffects(player, { inCrisis: true }).bonuses.accuracy.all,
    ).toBe(4);
  });
});

describe("resolveActorEffects - affinityGrants", () => {
  function npcWithAffinityBehavior(
    element: string,
    affinity: string,
    mode: number,
  ): TypeNpc {
    return {
      attacks: [
        {
          behaviors: [
            {
              id: "aff-1",
              name: "Affinity Grant",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                { key: `affinities.${element}`, mode, value: affinity },
              ],
            },
          ],
        },
      ],
    } as unknown as TypeNpc;
  }

  it("grants a single resistance via mode 4", () => {
    const npc = npcWithAffinityBehavior("fire", Affinities.Resistance, 4);
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.fire).toBe(Affinities.Resistance);
  });

  it("grants immunity via mode 0 override", () => {
    const npc = npcWithAffinityBehavior("ice", Affinities.Immunity, 0);
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.ice).toBe(Affinities.Immunity);
  });

  it("vu + rs upgrades to none (cancellation rule)", () => {
    const npc = {
      attacks: [
        {
          behaviors: [
            {
              id: "aff-vu",
              name: "Vuln",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                {
                  key: "affinities.fire",
                  mode: 4,
                  value: Affinities.Vulnerability,
                },
              ],
            },
            {
              id: "aff-rs",
              name: "Resist",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                {
                  key: "affinities.fire",
                  mode: 4,
                  value: Affinities.Resistance,
                },
              ],
            },
          ],
        },
      ],
    } as unknown as TypeNpc;
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.fire).toBe(Affinities.None);
  });

  it("immunity supersedes resistance + vulnerability", () => {
    const npc = {
      attacks: [
        {
          behaviors: [
            {
              id: "aff-rs",
              name: "Resist",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                {
                  key: "affinities.fire",
                  mode: 4,
                  value: Affinities.Resistance,
                },
              ],
            },
            {
              id: "aff-im",
              name: "Immune",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                { key: "affinities.fire", mode: 4, value: Affinities.Immunity },
              ],
            },
          ],
        },
      ],
    } as unknown as TypeNpc;
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.fire).toBe(Affinities.Immunity);
  });

  it("absorption supersedes immunity", () => {
    const npc = {
      attacks: [
        {
          behaviors: [
            {
              id: "aff-im",
              name: "Immune",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                { key: "affinities.fire", mode: 4, value: Affinities.Immunity },
              ],
            },
            {
              id: "aff-ab",
              name: "Absorb",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                {
                  key: "affinities.fire",
                  mode: 4,
                  value: Affinities.Absorpbtion,
                },
              ],
            },
          ],
        },
      ],
    } as unknown as TypeNpc;
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.fire).toBe(Affinities.Absorpbtion);
  });

  it("mode 0 override ignores existing grant", () => {
    const npc = {
      attacks: [
        {
          behaviors: [
            {
              id: "aff-im",
              name: "Immune",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                {
                  key: "affinities.fire",
                  mode: 4,
                  value: Affinities.Immunity,
                  priority: 0,
                },
                {
                  key: "affinities.fire",
                  mode: 0,
                  value: Affinities.Resistance,
                  priority: 1,
                },
              ],
            },
          ],
        },
      ],
    } as unknown as TypeNpc;
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.fire).toBe(Affinities.Resistance);
  });

  it("downgrade: rs + vu via mode 3 cancels to none", () => {
    const npc = {
      attacks: [
        {
          behaviors: [
            {
              id: "aff-rs",
              name: "Resist",
              transfer: true,
              trigger: { kind: "passive" },
              changes: [
                {
                  key: "affinities.fire",
                  mode: 4,
                  value: Affinities.Resistance,
                  priority: 0,
                },
                {
                  key: "affinities.fire",
                  mode: 3,
                  value: Affinities.Vulnerability,
                  priority: 1,
                },
              ],
            },
          ],
        },
      ],
    } as unknown as TypeNpc;
    const { affinityGrants } = resolveActorEffects(npc);
    expect(affinityGrants.fire).toBe(Affinities.None);
  });
});
