// Curated item-scoped stat key options per item type.
// These are the only paths that are safe to modify via a non-transferring passive
// (i.e. one that modifies the item's own data rather than the actor).
// Keys use dot-notation matching the item schema shape.

export const ITEM_SCOPED_KEYS: Record<string, string[]> = {
  npcAttack: ["accuracy.value", "damage.value"],
  npcSpell: ["accuracy.value", "damage.value", "cost.amount", "maxTargets"],
  npcAction: [],
  npcSpecial: [],
  heroic: [],
  weapon: ["accuracy.value", "damage.value"],
  customWeapon: ["accuracy.value", "damage.value"],
  armor: [
    "def",
    "mdef",
    "init",
    "modifiers.def",
    "modifiers.mdef",
    "modifiers.init",
    "modifiers.accuracy",
    "modifiers.damageMelee",
    "modifiers.damageRanged",
  ],
  shield: [
    "def",
    "mdef",
    "init",
    "modifiers.def",
    "modifiers.mdef",
    "modifiers.init",
    "modifiers.accuracy",
    "modifiers.damageMelee",
    "modifiers.damageRanged",
  ],
  accessory: [
    "modifiers.def",
    "modifiers.mdef",
    "modifiers.init",
    "modifiers.accuracy",
    "modifiers.damageMelee",
    "modifiers.damageRanged",
  ],
  hoplosphere: [],
  playerSpell: ["accuracy.value", "damage.value", "cost.amount", "maxTargets"],
};
