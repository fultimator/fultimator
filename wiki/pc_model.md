# PC Model

Schema: `src/forms/schema/actorSchemas/pc.ts`

For item schemas (weapons, armor, shields, accessories, custom weapons, spells) see [item_model.md](item_model.md).

---

## Identity

- `id` {string}: Document ID
- `uid` {string}: Owner user ID
- `name` {string}: Display name
- `lvl` {int}: Level
- `dataType` {string?}: Document discriminator, commonly `"pc"`
- `published` {bool?}: Firestore-only. Stripped on export

---

## Traits

- `info.pronouns` {string}
- `info.identity` {string}
- `info.theme` {string}
- `info.origin` {string}
- `info.description` {string}
- `info.zenit` {int}: Currency
- `info.fabulapoints` {int}: Fabula Points
- `info.exp` {int}: Experience Points
- `info.imgurl` {string}: Portrait URL

### Bonds

- `info.bonds[n].name` {string}
- `info.bonds[n].admiration` / `.loyality` / `.affection` {bool}
- `info.bonds[n].inferiority` / `.mistrust` / `.hatred` {bool}

---

## Attributes

Replace `<key>` with: `dexterity` `insight` `might` `willpower`

- `attributes.<key>` {object}: `{ base: int }` - die size stored in `base`

---

## Stats

- `stats.hp` {object}: `{ base: int, current: int }` - Hit Points
- `stats.mp` {object}: `{ base: int, current: int }` - Mind Points
- `stats.ip` {object}: `{ base: int, current: int }` - Inventory Points

---

## Statuses

Replace `<key>` with: `slow` `dazed` `enraged` `weak` `shaken` `poisoned` `dexUp` `insUp` `migUp` `wlpUp`

- `statuses.<key>` {bool}

---

## Modifiers

Flat numeric modifiers applied to derived stats.

- `modifiers.hp` / `.mp` / `.ip` {int}
- `modifiers.def` / `.mdef` / `.init` {int}
- `modifiers.meleePrec` / `.rangedPrec` / `.magicPrec` {int}

---

## Affinities

Replace `<key>` with: `physical` `air` `bolt` `dark` `earth` `fire` `ice` `light` `poison`

- `affinities.<key>` {string}: `"rs"` (Resistant) `"vu"` (Vulnerable) `"ab"` (Absorb) `"im"` (Immune) `"no"` (None)

---

## Immunities

Replace `<key>` with: `slow` `dazed` `enraged` `weak` `shaken` `poisoned`

- `immunities.<key>` {bool}: `true` means immune to that status

---

## Martials

Aggregate martial proficiency flags derived from equipped classes.

- `martials.armor` / `.shields` / `.melee` / `.ranged` {bool}

---

## Rituals

Aggregate ritual discipline access derived from equipped classes.

- `rituals.ritualism` / `.arcanism` / `.chimerism` / `.elementalism` / `.entropism` / `.spiritism` {bool}

---

## Classes - `pc.classes[]`

- `classes[n].name` {string}
- `classes[n].lvl` {int}
- `classes[n].benefits.hpplus` / `.mpplus` / `.ipplus` {int}
- `classes[n].benefits.martials` {object}: `{ armor, shields, melee, ranged }` booleans
- `classes[n].benefits.rituals` {object}: `{ ritualism }` boolean
- `classes[n].benefits.other` {object[]}: `{ description: string }[]` custom benefit entries
- `classes[n].benefits.custom` {string[]}: Custom benefit labels
- `classes[n].benefits.spellClasses` {string[]}: Spell discipline tags e.g. `"default"`

### Skills - `classes[n].skills[m]`

- `classes[n].skills[m].name` {string}
- `classes[n].skills[m].currentLvl` / `.maxLvl` {int}: Default `0`
- `classes[n].skills[m].description` {string}
- `classes[n].skills[m].specialSkill` {string?}: Key of a special skill override
- `classes[n].skills[m].fuid` {string?}: Compendium item ID
- `classes[n].skills[m].passives` {Passive[]?}
- `classes[n].skills[m].behaviors` {Behavior[]?}

### Heroic Skills - `classes[n].heroic[m]`

- `classes[n].heroic[m].name` {string}
- `classes[n].heroic[m].quote` {string}
- `classes[n].heroic[m].description` {string}
- `classes[n].heroic[m].meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference
- `classes[n].heroic[m].fuid` {string?}: Compendium item ID
- `classes[n].heroic[m].passives` {Passive[]?}
- `classes[n].heroic[m].behaviors` {Behavior[]?}

### Spells - `classes[n].spells[m]`

Spell fields vary by discipline. See [item_model.md](item_model.md) for full spell schemas.

- `classes[n].spells[m].spellType` {string}: Matches a value from `benefits.spellClasses`
- `classes[n].spells[m].name` {string}
- `classes[n].spells[m].index` {int}

---

## Equipment Container

Active inventory lives in `equipment[0]`. The array wrapper is a legacy artifact.

- `equipment[0].weapons` {Weapon[]}
- `equipment[0].customWeapons` {CustomWeapon[]}
- `equipment[0].shields` {Shield[]}
- `equipment[0].accessories` {Accessory[]}
- `equipment[0].armor` {Armor[]}
- `equipment[0].mnemospheres` {object[]?}
- `equipment[0].hoplospheres` {object[]?}
- `equipment[0].mnemoReceptacle` {string[]?}: Integrated technosphere slot IDs

See [item_model.md](item_model.md) for item field definitions.

---

## Equipped Slots

Active slot bindings. Each value is a slot reference or `null`.

Slots: `mainHand` `offHand` `armor` `accessory`

- `equippedSlots.<slot>` {SlotRef | null}

**SlotRef:** `{ source: "weapons" | "customWeapons" | "shields" | "armor" | "accessories", name: string, index?: int }`

### Vehicle Slots

Same structure as `equippedSlots` plus a `support` array. Slot references use `{ vehicleName, moduleName }`.

---

## Inventory - `pc.items[]`

- `items[n].fuid` {string?}: Compendium item ID
- `items[n].name` {string}
- `items[n].description` {string}
- `items[n].value` {int}
- `items[n].quantity` {int}

---

## Consumables - `pc.consumables[]`

- `consumables[n].fuid` {string?}: Compendium item ID
- `consumables[n].name` {string}
- `consumables[n].description` {string}
- `consumables[n].ipCost` {int}

---

## Notes - `pc.notes[]`

- `notes[n].fuid` {string?}: Compendium item ID
- `notes[n].name` {string}
- `notes[n].description` {string}: Flavor text
- `notes[n].effect` {string?}: Mechanical rules text

---

## Settings

- `settings.defaultView` {string?}: `"compact"` / `"normal"`
- `settings.advancement` {bool?}
- `settings.automaticClassLevel` {bool?}
- `settings.autoEquipUnarmed` {bool?}
- `settings.defaultUnarmedStrikeRef` {SlotRef?}
- `settings.optionalRules.quirks` {bool?}
- `settings.optionalRules.campActivities` {bool?}
- `settings.optionalRules.zeroPower` {bool?}
- `settings.optionalRules.technospheres` {bool?}
- `settings.optionalRules.technospheresVariant` {string?}: `"standard"` `"integrated"` `"mnemospheres"` `"hoplospheres"`
- `settings.optionalRules.innateClasses` {string[]?}
- `settings.specialSkillOverrides` {object?}: Map of skill name to `true`

---

## Runtime Computed Fields

These fields are optional on the persisted document and populated by the engine at runtime. Do not write them manually.

- `resources.hp` / `.mp` {object}: `{ current, bonus }` - live resource pools
- `derived.def` / `.mdef` {object}: `{ bonus, override? }` - computed defense values
- `derived.init` {object}: `{ bonus }` - computed initiative
- `bonuses` {object}: Aggregated flat bonuses split into `incomingRecovery`, `incomingLoss`, `outgoingRecovery`, `accuracy`, `damage`, `incomingDamage`
- `multipliers` {object}: Aggregated multipliers for `incomingRecovery`, `incomingLoss`, `outgoingRecovery`
- `effects` {ActorEffect[]?}: Active effects applied to this actor (PassiveSchema minus `transfer`, plus `origin?`)

---

## Legacy Compatibility

- `isEquipped` on items is legacy - authoritative equipped state lives in `equippedSlots` / `vehicleSlots`
- On load: root inventory arrays normalize into `equipment[0]`, `currentSL` becomes `currentLvl`, string notes become `{ name, description }`
