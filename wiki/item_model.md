# Item Model

Item schemas live in `src/forms/schema/itemSchemas/`.

All items that support mechanics use `passives` and `behaviors`. See [native_effects.md](native_effects.md).

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

- `itemType` {string}: `"weapon"`
- `name` {string}
- `description` {string?}
- `book` {string}: Default `"homebrew"`
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
- `att1` / `att2` / `type` {string}: Flat mirrors of `accuracy.attr1`, `accuracy.attr2`, `damage.type`
- `damageBonus` / `precBonus` / `rework` / `damageReworkBonus` {bool}
- `damageHrZero` {bool}
- `precModifier` / `damageModifier` / `defModifier` / `mDefModifier` {int}
- `totalBonus` {int}
- `base` {object}: Unmodified base weapon from compendium
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

### Custom Weapon (`"customWeapon"`)

Canonical fields (`CustomWeaponSchema`):

- `itemType` {string}: `"customWeapon"`
- `name` {string}
- `description` {string?}
- `book` {string}: Default `"homebrew"`
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
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

### Armor (`"armor"`)

Canonical fields (`ArmorSchema`):

- `itemType` {string}: `"armor"`
- `name` {string}
- `description` {string?}
- `book` {string}: Default `"homebrew"`
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
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

### Shield (`"shield"`)

Same canonical shape as Armor minus `slots` / `slotted`. `itemType` is `"shield"`. Persisted fields are identical to Armor.

### Accessory (`"accessory"`)

Canonical fields (`AccessorySchema`):

- `itemType` {string}: `"accessory"`
- `name` {string}
- `description` {string?}
- `book` {string}: Default `"homebrew"`
- `quality` {string?}
- `cost` {int?}

Persisted-only fields:

- `fuid` {string?}
- `selectedQuality` / `qualityCost` {string / int}
- `modifiers` {object?}: `{ def, mdef, init, magic, accuracy, damageMelee, damageRanged }`
- `defModifier` / `mDefModifier` / `initModifier` / `magicModifier` / `precModifier` {int}
- `damageMeleeModifier` / `damageRangedModifier` {int}
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

---

## NPC Embedded Items

Never standalone records - always nested inside the NPC document.

### Attacks - `npc.attacks[]` (`"basic"`)

- `name` {string} - `itemType` {string}: `"basic"`
- `range` {string?}: `"melee"` / `"ranged"`
- `accuracy` {object?}: `{ attr1, attr2, value?, defense? }`
- `damage` {object?}: `{ value?, type?, hrZero? }`
- `effect` {string?} - `special` {string[]?} - `extraDamage` {bool?}
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

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
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

### Actions - `npc.actions[]`

Active abilities the NPC can use.

- `name` {string} - `effect` {string?}
- `spCost` {number?}: SP cost, tracks available skills budget
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

### Special Rules - `npc.special[]`

Passive traits and innate rules on the NPC.

- `name` {string} - `effect` {string?}
- `spCost` {number?}: SP cost, tracks available skills budget
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

---

## PC Spells - `pc.classes[n].spells[]`

Spells are a discriminated union across 16+ discipline types. See `src/forms/schema/itemSchemas/spells/` for each variant.

Common fields:

- `name` {string}
- `spellType` {string}: Matches a value from `classes[n].benefits.spellClasses`
- `mp` {int}: MP cost per target
- `maxTargets` {int} - `targetDesc` {string} - `duration` {string}
- `description` {string} - `isOffensive` {bool}
- `attr1` / `attr2` {string}: Accuracy attributes (offensive spells only)
- `index` {int}
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

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
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

**Embedded in `pc.classes[n].heroic[]`** (`HeroicSkillSchema` - `class.ts`):

- `name` {string}
- `fuid` {string?}
- `quote` {string}
- `description` {string}
- `specialSkill` {string?}: Key of a special skill override
- `meta` {object?}: `{ book, page?, bookName?, isOfficial }` - source book reference
- `passives` {Passive[]?} - `behaviors` {Behavior[]?}

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
- `skills[m].skillName` {string}
- `skills[m].maxLvl` {int 1-10}: Default `1`
- `skills[m].description` {string}
- `skills[m].specialSkill` {string}

### Mnemosphere (`"mnemosphere"`) - `pc.equipment[0].mnemospheres[]`

Represents a slotted mnemosphere sphere. Schema is `looseObject()`.

- `itemType` {string}: `"mnemosphere"`
- `name` {string}
- `fuid` {string?}
- `class` {string?}: Associated class name
- `lvl` {int?}: Sphere level
- `cost` {int?}
- `skills` {unknown[]?}: Embedded skill entries
- `heroic` {unknown[]?}: Embedded heroic entries
- `spells` {unknown[]?}: Embedded spell entries

### Hoplosphere (`"hoplosphere"`) - `pc.equipment[0].hoplospheres[]`

Vehicle module item.

- `itemType` {string}: `"hoplosphere"`
- `name` {string}
- `fuid` {string?}
- `description` {string}
- `requiredSlots` {1 | 2}
- `socketable` {string}: `"all"` / `"weapon"`
- `cost` {int}
- `coagEffects` {object}: Map of string keys to string values
- `passives` {Passive[]?}
- `behaviors` {Behavior[]?}

### Item (`"item"`) - `pc.items[]`

Generic inventory item.

- `fuid` {string?}: Compendium item ID
- `name` {string}
- `description` {string}: Flavor text
- `value` {int}: Zenit value. Default `0`
- `quantity` {int}: Stack count. Default `0`

### Consumable (`"consumable"`) - `pc.consumables[]`

Consumable item with an IP cost.

- `fuid` {string?}: Compendium item ID
- `name` {string}
- `description` {string}: Flavor / effect text
- `ipCost` {int}: Inventory Point cost. Default `0`

### Note (`"note"`) - `pc.notes[]` / `npc.notes[]`

Named text block usable by both PCs and NPCs.

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
