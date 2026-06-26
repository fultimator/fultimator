# NPC Model

Schema: `src/forms/schema/actorSchemas/npc.ts`

---

## Identity

- `id` {string}: Document ID
- `uid` {string}: Owner user ID
- `name` {string}: Display name
- `lvl` {int 1-60}: Level
- `imgurl` {string?}: Portrait URL
- `traits` {string?}: Comma-separated trait list. Intended for future rendering as individual tags
- `description` {string?}: Lore description
- `language` {string?}: ISO language code for the language this NPC was authored in. Known values: `"en"` `"it"` `"es"` `"fr"` `"de"` `"pt"` `"other"`
- `createdBy` {string?}: Creator display name
- `published` {bool?}: Firestore-only. Distinguishes published vs personal records; stripped on export
- `schemaVersion` {int?}: Bumped during post-load migration transforms

---

## Classification

- `species` {string}: Default `"Beast"`. One of: `"Beast"` `"Construct"` `"Demon"` `"Elemental"` `"Humanoid"` `"Variant Humanoid"` `"Monster"` `"Plant"` `"Undead"`
- `rank` {string?}: `"soldier"` `"elite"` `"champion1"`-`"champion6"` `"companion"` `"groupvehicle"`
- `sizes` {string?}: `"small"` `"medium"` `"large"` (empty string means none)
- `villain` {string?}: `"minor"` `"major"` `"supreme"` - grants Ultima Points (UP)
- `phases` {int?}: Number of boss phases
- `multipart` {string?}: Identifies one part of a multi-part encounter
- `companionlvl` {int?}: Companion level (1-5). Only used when `rank` is `"companion"`
- `companionpclvl` {int?}: Associated PC level. Only used when `rank` is `"companion"`

---

## Attributes

Replace `<key>` with: `dexterity` `insight` `might` `will`

- `attributes.<key>.base` {int}: Die size - one of `6` `8` `10` `12`

---

## Affinities

Replace `<key>` with: `physical` `air` `bolt` `dark` `earth` `fire` `ice` `light` `poison`

- `affinities.<key>` {string?}: Missing key means normal damage

Values: `"vu"` (Vulnerable) `"rs"` (Resistant) `"im"` (Immune) `"ab"` (Absorb) `"no"` (None)

---

## Immunities & Statuses

Replace `<key>` with: `slow` `dazed` `weak` `shaken` `enraged` `poisoned`

- `immunities.<key>` {bool}: Default `false`. If `true`, the NPC cannot be inflicted with that status
- `statuses.<key>` {bool}: Currently active status effects in combat

---

## Resources

- `resources.hp.current` {number}
- `resources.hp.bonus` {number}: Added on top of computed max HP
- `resources.mp.current` {number}
- `resources.mp.bonus` {number}: Added on top of computed max MP

---

## Derived Stats

- `derived.def.bonus` {number}: Added to computed Defense
- `derived.def.override` {number?}: Replaces computed Defense entirely
- `derived.mdef.bonus` {number}: Added to computed Magic Defense
- `derived.mdef.override` {number?}: Replaces computed Magic Defense entirely
- `derived.init.bonus` {number}: Added to computed Initiative

---

## Extra & Features

- `extra.statusImmunity` {int 0-3?}: Status immunity slots granted by rank

Replace `<key>` with: `init` `precision` `magic`

- `features.<key>.enabled` {bool}: Toggles optional stat block features

---

## Equipment

### Armor & Shield

Both fields use the same shape. Schema is `loose()` - unknown fields are preserved.

- `armor.name` / `shield.name` {string}
- `armor.def` / `shield.def` {number?}
- `armor.mdef` / `shield.mdef` {number?}
- `armor.init` / `shield.init` {number?}: Initiative modifier
- `armor.martial` / `shield.martial` {bool?}
- `armor.cost` / `shield.cost` {number?}: Cost in zenit
- `armor.category` / `shield.category` {string?}
- `armor.fuid` / `shield.fuid` {string?}: Compendium item ID
- `armor.armor` / `shield.armor` {bool?}: Legacy type discriminator

---

## Actions & Abilities

All of the following support optional `passives` and `behaviors` arrays. See [native_effects.md](native_effects.md).

### Attacks - `npc.attacks[]`

Schema is `loose()`. `weaponattacks` is identical - tracks weapon-sourced attacks separately from innate ones.

- `attacks[n].name` {string}
- `attacks[n].range` {string?}: `"melee"` / `"ranged"`
- `attacks[n].accuracy` {object?}: See [Accuracy](#accuracy)
- `attacks[n].damage` {object?}: See [Damage](#damage)
- `attacks[n].effect` {string?}
- `attacks[n].special` {string[]?}: Special rule tags
- `attacks[n].extraDamage` {bool?}
- `attacks[n].itemType` {string?}

### Weapon Attacks - `npc.weaponattacks[]`

Identical schema to `attacks`. See above.

### Spells - `npc.spells[]`

Schema is `loose()`.

- `spells[n].name` {string}
- `spells[n].isOffensive` {bool?}
- `spells[n].accuracy` {object?}: See [Accuracy](#accuracy)
- `spells[n].damage` {object?}: See [Damage](#damage)
- `spells[n].cost` {object?}: See [Resource Cost](#resource-cost)
- `spells[n].range` {string?}: `"melee"` / `"ranged"`
- `spells[n].maxTargets` {number?}
- `spells[n].targetDescription` {string?}
- `spells[n].duration` {string?}
- `spells[n].effect` {string?}
- `spells[n].description` {string?}
- `spells[n].special` {string[]?}
- `spells[n].spellType` {string?}
- `spells[n].itemType` {string?}

### Actions - `npc.actions[]`

Active abilities the NPC can use.

- `actions[n].name` {string}
- `actions[n].effect` {string?}
- `actions[n].spCost` {number?}: SP (Skill Point) cost, used to track available skills budget

### Special Rules - `npc.special[]`

Passive traits and innate rules on the NPC.

- `special[n].name` {string}
- `special[n].effect` {string?}
- `special[n].spCost` {number?}: SP (Skill Point) cost, used to track available skills budget

### Rare Gear - `npc.raregear[]`

- `raregear[n].name` {string}
- `raregear[n].effect` {string?}

### Notes - `npc.notes[]`

- `notes[n].fuid` {string?}: Compendium item ID
- `notes[n].name` {string}
- `notes[n].description` {string?}: Flavor text
- `notes[n].effect` {string?}: Mechanical rules text

---

## Actor Effects

Active effects on this NPC from items or persistent abilities.
Shape is [Passive](native_effects.md#passive) without `transfer`, plus `origin`.

- `effects[n].id` {string}
- `effects[n].name` {string}
- `effects[n].disabled` {bool?}
- `effects[n].origin` {string?}: Source item or ability that created this effect
- `effects[n].changes` {EffectChange[]?}: See [native_effects.md](native_effects.md#effect-change)
- `effects[n].grants` {GrantData[]?}: See [native_effects.md](native_effects.md#grant-data)
- `effects[n].duration` {EffectDuration?}: See [native_effects.md](native_effects.md#effect-duration)
- `effects[n].predicate` {EffectPredicate?}: See [native_effects.md](native_effects.md#effect-predicate)

---

## Bonuses

Flat numeric bonuses applied to rolls and resource changes.

### Resource Bonuses

- `bonuses.incomingRecovery.hp` / `.mp` / `.ip` {number}: Bonus HP/MP/IP received from recovery effects
- `bonuses.incomingLoss.hp` / `.mp` / `.ip` {number}
- `bonuses.outgoingRecovery.hp` / `.mp` / `.ip` {number}: Bonus HP/MP/IP granted when healing others

### Accuracy Bonuses

- `bonuses.accuracy.all` {number}
- `bonuses.accuracy.accuracyCheck` {number}
- `bonuses.accuracy.melee` {number}
- `bonuses.accuracy.ranged` {number}
- `bonuses.accuracy.magic` {number}
- `bonuses.accuracy.opposed` {number}
- `bonuses.accuracy.open` {number}

#### Melee Weapon Accuracy

- `bonuses.accuracy.arcane` / `.brawling` / `.dagger` / `.flail` / `.heavy` / `.spear` / `.sword` {number}

#### Ranged Weapon Accuracy

- `bonuses.accuracy.bow` / `.firearm` / `.thrown` {number}

### Damage Bonuses

- `bonuses.damage.all` {number}
- `bonuses.damage.melee` {number}
- `bonuses.damage.ranged` {number}
- `bonuses.damage.spell` {number}

#### Weapon Damage

- `bonuses.damage.arcane` / `.bow` / `.brawling` / `.dagger` / `.firearm` / `.flail` / `.heavy` / `.spear` / `.sword` / `.thrown` {number}

#### Elemental Damage

- `bonuses.damage.physical` / `.air` / `.bolt` / `.dark` / `.earth` / `.fire` / `.ice` / `.light` / `.poison` {number}

#### Species Damage

- `bonuses.damage.beast` / `.construct` / `.demon` / `.elemental` / `.humanoid` / `.monster` / `.plant` / `.undead` {number}

### Incoming Damage Bonuses

Same structure as damage bonuses under `bonuses.incomingDamage.*`.

---

## Multipliers

Multiplicative modifiers on resource changes (1.0 = no change).

- `multipliers.incomingRecovery.hp` / `.mp` / `.ip` {number}
- `multipliers.incomingLoss.hp` / `.mp` / `.ip` {number}
- `multipliers.outgoingRecovery.hp` / `.mp` / `.ip` {number}

---

## Sub-object Reference

### Accuracy

Used in `attacks`, `weaponattacks`, `spells`.

- `attr1` {string}: Primary attribute - `"dexterity"` `"insight"` `"might"` `"will"`
- `attr2` {string}: Secondary attribute
- `value` {number?}: Flat accuracy bonus
- `defense` {string?}: Targeted defense - `"def"` `"mdef"`

### Damage

Used in `attacks`, `weaponattacks`, `spells`.

- `value` {number?}: Flat damage bonus
- `type` {string?}: Damage type e.g. `"physical"` `"fire"` `"bolt"`
- `hrZero` {bool?}: If `true`, HR is treated as 0

### Resource Cost

Used in `spells`.

- `resource` {string?}: `"hp"` `"mp"` `"ip"`
- `amount` {number?}
- `perTarget` {bool?}: If `true`, cost is paid per target hit
