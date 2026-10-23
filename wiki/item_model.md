# Item Model

Item schemas live in `src/forms/schema/itemSchemas/`.

All items that support mechanics carry a `behaviors` array. See [native_effects.md](native_effects.md).

---

## Item Types by Actor

| `itemType`            | Schema file                      | Available to                                                      |
| --------------------- | -------------------------------- | ----------------------------------------------------------------- |
| `"weapon"`            | `weapon.ts`                      | PC                                                                |
| `"customWeapon"`      | `customWeapon.ts`                | PC                                                                |
| `"armor"`             | `armor.ts`                       | PC                                                                |
| `"shield"`            | `shield.ts`                      | PC                                                                |
| `"accessory"`         | `accessory.ts`                   | PC                                                                |
| `"basic"`             | `npcAttack.ts`                   | NPC (embedded in `attacks`)                                       |
| `"spell"`             | `npcSpell.ts` / `playerSpell.ts` | NPC (embedded in `spells`) / PC (embedded in `classes[n].spells`) |
| `"action"`            | `npcAction.ts`                   | NPC (embedded in `actions`)                                       |
| `"special"`           | `npcSpecial.ts`                  | NPC (embedded in `special`)                                       |
| `"heroic"`            | `heroic.ts`                      | PC (embedded in `classes[n].heroic`)                              |
| `"campActivity"`      | `campActivity.ts`                | PC (optional rule)                                                |
| `"quirkOptional"`     | `quirkOptional.ts`               | PC (optional rule)                                                |
| `"otherOptional"`     | `otherOptional.ts`               | PC (optional rule)                                                |
| `"zeroPowerOptional"` | `zeroPowerOptional.ts`           | PC (optional rule)                                                |
| `"mnemosphere"`       | `mnemosphere.ts`                 | PC (`equipment[0].mnemospheres`)                                  |
| `"hoplosphere"`       | `hoplosphere.ts`                 | PC (`equipment[0].hoplospheres`)                                  |
| `"class"`             | `class.ts`                       | PC (`classes[]`)                                                  |
| `"quality"`           | `quality.ts`                     | Compendium reference only                                         |
| `"item"`              | `item.ts`                        | PC (`items[]`) / Compendium                                       |
| `"consumable"`        | `consumable.ts`                  | PC (`consumables[]`) / Compendium                                 |
| `"note"`              | `note.ts`                        | PC (`notes[]`) / NPC (`notes[]`) / Compendium                     |

NPC item types (`basic`, `spell`, `action`, `special`) are embedded directly in the NPC document and never stored as standalone records.

---

## PC Equipment

### Weapon (`"weapon"`)

Canonical fields (`WeaponSchema`):

- `id` {string?}: Persistent item ID
- `itemType` {string}: `"weapon"`
- `name` {string}
- `description` {string?}
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference (replaces the old top-level `book`)
- `category` {string}: e.g. `"sword"` `"bow"` `"brawling"`
- `range` {string}: `"melee"` / `"ranged"`
- `hands` {1 | 2}
- `martial` {bool}
- `accuracy` {object}: `{ attr1, attr2, value, defense }` - see `WeaponAccuracySchema`
- `damage` {object}: `{ value, type, hrZero }` - see `WeaponDamageSchema`
- `modifiers` {object?}: `{ damage, accuracy, def, mdef }` - customization overrides
- `rare` {object?}: `{ accuracyBonus, damageBonus }` bools
- `quality` {string?}: Quality name
- `cost` {int?}
- `special` {string[]?}

Persisted-only fields (form state, stored alongside canonical):

- `fuid` {string?}
- `selectedQuality` / `qualityName` / `qualityCost` {string / int}
- `type` {string?}: Flat mirror of `damage.type`
- `rareBonuses` {object?}: Rare weapon bonus flags
- `damageBonus` / `precBonus` / `rework` / `damageReworkBonus` {bool}
- `damageHrZero` {bool}
- `precModifier` / `damageModifier` / `defModifier` / `mDefModifier` {int}
- `totalBonus` {int}
- `isEquipped` {bool?}: Legacy equipped flag - authoritative state is `equippedSlots`
- `base` {object}: Unmodified base weapon from compendium
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Custom Weapon (`"customWeapon"`)

Canonical fields (`CustomWeaponSchema`):

- `id` {string?}: Persistent item ID
- `itemType` {string}: `"customWeapon"`
- `name` {string}
- `description` {string?}
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference (replaces the old top-level `book`)
- `category` {string}
- `range` {string}: `"melee"` / `"ranged"`
- `hands` {1 | 2}
- `martial` {bool}
- `accuracy` {object}: `{ attr1, attr2, value, defense }` - shared `WeaponAccuracySchema`
- `damage` {object}: `{ value, type, hrZero }` - shared `WeaponDamageSchema`
- `modifiers` {object?}: `{ damage, accuracy, def, mdef }`
- `rare` {object?}: `{ accuracyBonus, damageBonus, overrideDamageType, overrideAccuracyAttributes, overrideDamageTypeValue?, overrideAccuracyAttr1?, overrideAccuracyAttr2? }`
- `customizations` {object[]}: `{ name, effect, martial, customCost }`
- `quality` {string?} - `qualityName` {string?} - `qualityCost` {int?}
- `cost` {int?}
- `slots` {string?}: Technosphere slot tier - `"alpha"` `"beta"` `"gamma"` `"delta"`
- `slotted` {string[]?}: Slotted hoplosphere IDs
- `second*`: Mirrors `name`, `category`, `range`, `accuracy`, `damage`, `modifiers`, `customizations` for the paired off-hand form (Transforming customization)

Persisted-only fields (form state):

- `dataType` {string}: `"weapon"`
- `selectedQuality` {string?}
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Armor (`"armor"`)

Canonical fields (`ArmorSchema`):

- `id` {string?}: Persistent item ID
- `itemType` {string}: `"armor"`
- `name` {string}
- `description` {string?}
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference (replaces the old top-level `book`)
- `martial` {bool}
- `def` / `mdef` / `init` {int}
- `rework` {bool}
- `quality` {string?}
- `cost` {int?}
- `modifiers` {object?}: `{ def, mdef, init, magic, accuracy, damageMelee, damageRanged }`
- `slots` {string?}: Technosphere slot tier - `"alpha"` `"beta"` `"gamma"` `"delta"`
- `slotted` {string[]?}

Persisted-only fields:

- `fuid` {string?}
- `base` {object}: Unmodified base armor from compendium
- `selectedQuality` / `qualityCost` {string / int}
- `defModifier` / `mDefModifier` / `initModifier` / `magicModifier` / `precModifier` {int}
- `damageMeleeModifier` / `damageRangedModifier` {int}
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Shield (`"shield"`)

Same canonical shape as Armor minus `slots` / `slotted`. `itemType` is `"shield"`. Persisted fields are identical to Armor.

### Accessory (`"accessory"`)

Canonical fields (`AccessorySchema`):

- `id` {string?}: Persistent item ID
- `itemType` {string}: `"accessory"`
- `name` {string}
- `description` {string?}
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference (replaces the old top-level `book`)
- `quality` {string?}
- `cost` {int?}

Persisted-only fields:

- `fuid` {string?}
- `selectedQuality` / `qualityCost` {string / int}
- `modifiers` {object?}: `{ def, mdef, init, magic, accuracy, damageMelee, damageRanged }`
- `defModifier` / `mDefModifier` / `initModifier` / `magicModifier` / `precModifier` {int}
- `damageMeleeModifier` / `damageRangedModifier` {int}
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

---

## NPC Embedded Items

Never standalone records - always nested inside the NPC document.

### Attacks - `npc.attacks[]` (`"basic"`)

- `name` {string} - `itemType` {string}: `"basic"`
- `range` {string?}: `"melee"` / `"ranged"`
- `accuracy` {object?}: `{ attr1, attr2, value?, defense? }`
- `damage` {object?}: `{ value?, type?, hrZero? }`
- `effect` {string?} - `special` {string[]?} - `extraDamage` {bool?}
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Spells - `npc.spells[]` (`"spell"`)

- `name` {string} - `itemType` {string}: `"spell"`
- `isOffensive` {bool?}
- `accuracy` {object?}: `{ attr1, attr2, value?, defense? }`
- `damage` {object?}: `{ value?, type?, hrZero? }`
- `cost` {object?}: `{ resource?, amount?, perTarget? }`
- `range` {string?}: `"melee"` / `"ranged"`
- `maxTargets` {number?} - `targetDescription` {string?} - `duration` {string?}
- `effect` / `description` {string?} - `special` {string[]?}
- `spellType` {string?}: Spell discipline tag
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Actions - `npc.actions[]`

Active abilities the NPC can use. (Embedded shape; see [npc_model.md](npc_model.md). The standalone `npcAction.ts` compendium form uses `fuid` / `description` / `meta` instead of `id`.)

- `id` {string?}
- `name` {string} - `effect` {string?}
- `spCost` {number?}: SP cost, tracks available skills budget
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Special Rules - `npc.special[]`

Passive traits and innate rules on the NPC. Same embedded shape as `actions`.

- `id` {string?}
- `name` {string} - `effect` {string?}
- `spCost` {number?}: SP cost, tracks available skills budget
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

---

## PC Spells - `pc.classes[n].spells[]`

`PlayerSpellSchema` is a `z.union` of 18 subtype schemas discriminated by `spellType`.
See `src/forms/schema/itemSchemas/spells/`. There is no top-level `mp`, `attr1`/`attr2`, or
`index` field - accuracy/damage/cost are nested objects and only on `default`.

### Shared base (`PlayerSpellNonStaticBaseSchema`)

Every subtype **except `default`** extends this base:

- `id` {string?}
- `name` {string}
- `fuid` {string?}: Compendium item ID
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }`
- `description` {string?}
- `showInPlayerSheet` {bool}: Default `true`
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)
- `spellType` {string}: One of `"default"` `"gift"` `"dance"` `"therioform"` `"magichant"` `"symbol"` `"invocation"` `"wellspring"` `"arcanist"` `"arcanist-rework"` `"tinkerer-alchemy"` `"tinkerer-infusion"` `"tinkerer-magitech"` `"cooking"` `"magiseed"` `"pilot-vehicle"` `"gamble"` `"deck"`

### `default` (`PlayerSpellDefaultSchema`)

The classic spell shape - a standalone object that does **not** extend the base:

- `id` {string?} - `class` {string} - `name` {string} - `fuid` {string?} - `meta` {object?}
- `description` {string} - `isOffensive` {bool}
- `cost` {object}: `{ resource: "mp", amount, perTarget }`
- `maxTargets` {int} - `targetDescription` {string} - `duration` {string}
- `accuracy` {object}: `{ attr1, attr2, value, defense }`
- `damage` {object}: `{ value, type, hrZero }`
- `spellType` {string}: `"default"`
- `behaviors` {Behavior[]?}

### Subtype-specific fields

Each non-`default` subtype adds these on top of the shared base:

- `gift`: `clock` {int}, `gifts[]` `{ key, customName, event, effect }`
- `dance`: `dances[]` `{ key, customName, effect, duration }`
- `therioform`: `therioforms[]` `{ key, customName, genoclepsis, description }`
- `magichant`: `keys[]` `{ key, customName, type, status, attribute, recovery }`, `tones[]` `{ key, customName, effect }`
- `symbol`: `symbols[]` `{ key, customName, effect }`
- `invocation`: `spellName`, tracker `{ innerWellspring, chosenWellspring, activeWellsprings[] }`, `invocations[]`, `customWellsprings[]` `{ id?, name, color, textColor, icon }`
- `wellspring`: `color`, `textColor` (`"black"`/`"white"`), `icon`
- `arcanist`: `domain`/`domainDesc`, `merge`/`mergeDesc`, `dismiss`/`dismissDesc`
- `arcanist-rework`: the arcanist fields plus `pulse`/`pulseDesc`
- `tinkerer-alchemy`: `category` {string?}
- `tinkerer-infusion`: `infusionRank` {int?}
- `tinkerer-magitech`: `rank` {int 1-3}, `magispheres[]`
- `cooking`: `spellName`, cookbook `{ effects[], ingredientInventory[] }`
- `magiseed`: `growthClock`, `gardenDescription`, `currentMagiseed`, `magiseeds[]`
- `pilot-vehicle`: vehicle module schemas (armor / weapon / support) and slots
- `gamble`: `spellName`, `maxTargets`, `targetDescription`, `duration`, `attr`, `targets[]` `{ rangeFrom, rangeTo, effect, secondRoll, secondEffects[] }`
- `deck`: `spellName`, `cardsInDeck` {int}, `hand[]`, `discardPile[]` (cards `{ suit, value, isJoker }`)

---

## Other PC Item Types

### Heroic Skill (`"heroic"`)

Two distinct shapes depending on context:

**Standalone compendium record** (`HeroicSchema` - `heroic.ts`):

- `itemType` {string}: `"heroic"`
- `name` {string}
- `fuid` {string?}
- `quote` {string}
- `description` {string}
- `applicableTo` {string[]}: Class names this heroic skill applies to
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

**Embedded in `pc.classes[n].heroic[]`** (`HeroicSkillSchema` - `class.ts`):

- `name` {string}
- `fuid` {string?}
- `quote` {string}
- `description` {string}
- `specialSkill` {string?}: Key of a special skill override
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Camp Activity (`"campActivity"`)

Enabled via `settings.optionalRules.campActivities`.

- `itemType` {string}: `"campActivity"`
- `name` {string}
- `description` {string}: Target type - `"choice"` or other `CampActivityTarget` values
- `targetDescription` {string}
- `effect` {string}

### Quirk Optional (`"quirkOptional"`)

Enabled via `settings.optionalRules.quirks`.

- `itemType` {string}: `"quirkOptional"`
- `name` {string}
- `description` {string}
- `effect` {string}

### Other Optional (`"otherOptional"`)

- `itemType` {string}: `"otherOptional"`
- `name` {string}
- `description` {string}
- `effect` {string}
- `clockEnabled` {bool}
- `clockSections` {int 2-12}: Default `6`

### Zero Power Optional (`"zeroPowerOptional"`)

- `itemType` {string}: `"zeroPowerOptional"`
- `name` {string}
- `clockSections` {int 2-12}: Default `6`
- `triggerName` / `triggerDescription` {string}
- `effectName` / `effectDescription` {string}

---

## Array-Keyed Items

These are always accessed via a named array. `itemType` is present but not used for runtime discrimination.

### Class (`"class"`) - `pc.classes[]`

Compendium class definition. Shape differs from the embedded class in the PC document - this is the source record.

- `itemType` {string}: `"class"`
- `name` {string}
- `fuid` {string?}: Compendium item ID
- `lvl` {int}: Default `1`
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference
- `benefits.hpplus` / `.mpplus` / `.ipplus` {int}: Default `0`
- `benefits.isCustomBenefit` {bool}: Default `false`
- `benefits.martials` {object}: `{ armor, shields, melee, ranged }` booleans
- `benefits.rituals` {object}: `{ ritualism }` boolean
- `benefits.custom` {unknown[]}: Custom benefit entries
- `benefits.other` {object[]}: `{ description: string }[]` custom benefit entries
- `benefits.spellClasses` {string[]}
- `skills[m].fuid` {string?}
- `skills[m].name` {string}
- `skills[m].maxLvl` {int 1-10}: Default `1`
- `skills[m].currentLvl` {int}: Default `0`
- `skills[m].description` {string}
- `skills[m].behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)
- `skills[m].specialSkill` {string}

### Mnemosphere (`"mnemosphere"`) - `pc.equipment[0].mnemospheres[]`

Represents a slotted mnemosphere sphere. Schema is `looseObject()`.

- `itemType` {string}: `"mnemosphere"`
- `id` {string?}
- `name` {string}
- `fuid` {string?}
- `class` {string?}: Associated class name
- `lvl` {int?}: Sphere level
- `cost` {int?}
- `skills` {SkillSchema[]?}: Embedded skill entries
- `heroic` {HeroicSkillSchema[]?}: Embedded heroic entries
- `spells` {PlayerSpell[]?}: Embedded spell entries
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference

### Hoplosphere (`"hoplosphere"`) - `pc.equipment[0].hoplospheres[]`

Vehicle module item.

- `itemType` {string}: `"hoplosphere"`
- `id` {string?}
- `name` {string}
- `fuid` {string?}
- `description` {string}
- `requiredSlots` {1 | 2}
- `socketable` {string}: `"all"` / `"weapon"`
- `cost` {int}
- `coagEffects` {object}: Map of string keys to string values
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference
- `behaviors` {Behavior[]?}: See [native_effects.md](native_effects.md)

### Item (`"item"`) - `pc.items[]`

Generic inventory item.

- `id` {string?}: Persistent item ID
- `fuid` {string?}: Compendium item ID
- `name` {string}
- `description` {string}: Flavor text
- `value` {int}: Zenit value. Default `0`
- `quantity` {int}: Stack count. Default `0`

### Consumable (`"consumable"`) - `pc.consumables[]`

Consumable item with an IP cost.

- `id` {string?}: Persistent item ID
- `fuid` {string?}: Compendium item ID
- `name` {string}
- `description` {string}: Flavor / effect text
- `ipCost` {int}: Inventory Point cost. Default `0`

### Note (`"note"`) - `pc.notes[]` / `npc.notes[]`

Named text block usable by both PCs and NPCs.

- `id` {string?}: Persistent item ID
- `fuid` {string?}: Compendium item ID
- `name` {string}
- `description` {string}: Flavor text
- `effect` {string?}: Mechanical rules text

---

### Quality (`"quality"`) - Compendium reference only

Not embedded directly in actor documents. Equipment items (weapon, armor, shield, accessory) reference a quality by storing `selectedQuality` (name string) and `qualityCost` (int) on the equipment itself. The Quality document is the lookup source for those values.

- `itemType` {string}: `"quality"`
- `name` {string}
- `fuid` {string?}
- `category` {string}: Default `"misc"`
- `quality` {string}: Quality effect description
- `cost` {int}: Default `0`
- `filter` {string[]}: Item categories this quality can apply to
