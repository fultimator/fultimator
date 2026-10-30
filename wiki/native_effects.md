# Native Effects Model

The native effects system. Mechanical items carry a `behaviors` array; actors (PC/NPC)
carry an `effects` array of Actor Effects, each wrapping `behaviors`. This replaces the
deprecated `passives` field - `passives` is no longer a schema field.

Schema: `src/forms/schema/shared/behaviorSchemas.ts`

---

## Behavior

The unit of mechanics attached to an item or actor effect.

- `id` {string}
- `name` {string}: Default `""`
- `trigger` {ActionTrigger}: Default `{ kind: "passive" }`. See [Action Trigger](#action-trigger)
- `predicate` {EffectPredicate?}: See [Effect Predicate](#effect-predicate)
- `transfer` {bool?}: If `true`, the behavior transfers from the item onto the actor
- `changes` {EffectChange[]?}: See [Effect Change](#effect-change)
- `grants` {GrantData[]?}: See [Grant Data](#grant-data)
- `voluntaryNoDamage` {bool?}
- `appliesEffect` {AppliesEffect?}: See [Applies Effect](#applies-effect)
- `afterEffects` {AfterEffect[]?}: See [After Effect](#after-effect)
- `branches` {EffectBranch[]?}: See [Effect Branch](#effect-branch)
- `manual` {ManualBehavior?}: See [Manual Behavior](#manual-behavior)
- `chatOutput` {object?}: `{ text: string }`

---

## Effect Change

A single stat modification.

- `key` {string}: Target stat path, e.g. `"bonuses.accuracy.all"`
- `mode` {int}: Change mode, `0`-`5` (Foundry-style: `0` custom, `1` multiply, `2` add, `3` downgrade, `4` upgrade, `5` override)
- `value` {string}: Default `"0"`. String so it can hold expressions
- `priority` {number?}: Application order (nullable)

---

## Grant Data

Grants a sub-item or capability while the behavior is active.

- `type` {string}: What is granted
- `ref` {string?}: Reference to the granted content

---

## Effect Duration

Discriminated union on `event`.

- `{ event: "none" }`
- `{ event: "rest" }`
- `{ event: "end-of-scene" }`
- `{ event: "start-of-turn" | "end-of-turn" | "end-of-round", tracking: "self" | "source" }`

---

## Effect Predicate

Gates whether an effect is active.

- `crisisInteraction` {string?}: `"none"` / `"active"` / `"inactive"`

---

## Action Trigger

Discriminated union on `kind`.

- `{ kind: "passive" }`: Always on
- `{ kind: "active" }`: Used on demand
- `{ kind: "chat-action", action, condition? }`: `action` is `"guard"` / `"attack"` / `"spell"` / `"equipment"`; `condition.guardVariant` is `"cover"` / `"no-cover"`
- `{ kind: "reactive", event: "ally-targeted", cooldown? }`: `cooldown` is `"until-next-turn"` / `"until-next-round"`
- `{ kind: "combat-start" }`
- `{ kind: "combat-end" }`
- `{ kind: "on-hit", condition? }`: `condition.singleTarget` / `condition.targetHasStatusEffects` {bool?}
- `{ kind: "on-damage-taken" }`

---

## Applies Effect

An effect applied to a target when the behavior fires.

- `label` {string}: Default `""`
- `target` {string}: `"single"` / `"all"` / `"self"` / `"cover-target"`
- `duration` {EffectDuration}: See [Effect Duration](#effect-duration)
- `changes` {EffectChange[]?}
- `grants` {GrantData[]?}
- `predicate` {EffectPredicate?}

---

## After Effect

A resource change resolved after the action.

- `resource` {string}: `"hp"` / `"mp"` / `"ip"`
- `direction` {string}: `"loss"` / `"recovery"`
- `amount` {number | string | object}: A number, `"half-damage"`, `"half-loss"`, or `{ expr: string }`
- `target` {string}: `"self"` / `"targets"` / `"cover-target"`
- `predicate` {EffectPredicate?}

---

## Effect Branch

A labeled branch bundling an applied effect and/or after-effects.

- `label` {string}: Default `""`
- `appliesEffect` {AppliesEffect?}
- `afterEffects` {AfterEffect[]?}

---

## Manual Behavior

Marks a behavior that needs manual resolution.

- `reason` {string?}: `"prompt-required"` / `"free-attack"` / `"future-effect"` / `"other"`
- `hint` {string?}

---

## Actor Effect

Active effects on a PC or NPC `effects[]` array.

- `id` {string}
- `name` {string}: Default `""`
- `disabled` {bool?}
- `origin` {string?}: Source item or ability that created this effect
- `behaviors` {Behavior[]?}: See [Behavior](#behavior). Actor-effect behaviors omit `transfer`

---

## Carriers

- **Items** with a `behaviors` array: weapon, customWeapon, armor, shield, accessory, npc attack/spell/action/special, heroic, class `skills[]` / `heroic[]`, hoplosphere.
- **Actors** carry `effects` (Actor Effect) - see [npc_model.md](npc_model.md) and [pc_model.md](pc_model.md).
