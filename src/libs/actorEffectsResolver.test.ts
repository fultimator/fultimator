import { describe, expect, it } from "vitest";
import { resolveActorEffects } from "./actorEffectsResolver";
import type { Passive } from "../types/Effects";
import type { TypeNpc } from "../types/Npcs";
import type { TypePlayer } from "../types/Players";

function transferredAccuracy(
  value: number,
  key = "bonuses.accuracy.all",
): Passive {
  return {
    id: `effect-${value}`,
    name: `Accuracy ${value}`,
    transfer: true,
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
              behavior: {
                effects: [transferredAccuracy(4, "bonuses.accuracy.melee")],
              },
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
          behavior: {
            effects: [transferredAccuracy(5, "bonuses.accuracy.ranged")],
          },
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
      passives: [transferredAccuracy(2, "bonuses.accuracy.sword")],
    };
    const inventory = {
      itemType: "weapon",
      name: "Inventory Sword",
      passives: [transferredAccuracy(7, "bonuses.accuracy.sword")],
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
          passives: [transferredAccuracy(3, "bonuses.accuracy.sword")],
        },
        {
          itemType: "weapon",
          name: "Old Inventory Sword",
          isEquipped: false,
          passives: [transferredAccuracy(9, "bonuses.accuracy.sword")],
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
            passives: [transferredAccuracy(2)],
          },
          {
            id: "hoplo-stored",
            name: "Stored Hoplo",
            description: "",
            socketable: "weapon",
            requiredSlots: 1,
            cost: 0,
            passives: [transferredAccuracy(5)],
          },
          {
            id: "hoplo-armor",
            name: "Armor Hoplo",
            description: "",
            socketable: "all",
            requiredSlots: 1,
            cost: 0,
            passives: [transferredAccuracy(11)],
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
                behavior: { effects: [transferredAccuracy(3)] },
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

  it("honors crisis predicates from the resolve context", () => {
    const player = {
      effects: [
        {
          id: "crisis",
          name: "Crisis Focus",
          predicate: { crisisInteraction: "active" },
          changes: [{ key: "bonuses.accuracy.all", mode: 2, value: "4" }],
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
