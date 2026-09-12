# Quick Assembly Model

Optional guided NPC-creation ruleset. A **role** seeds a starting stat block; the GM fills
level/rank/species grant slots from their compendium. The result is always a plain NPC (see
[npc_model.md](npc_model.md)); grants are guidance you can freely override, and
HP/MP/Init/Accuracy/Damage stay formula-driven from the seeded attributes.

Schema: `src/forms/schema/actorSchemas/npc.ts`
Rule data & logic: `src/libs/quickAssembly/`

---

## Persisted Fields

The only QA-specific fields on the document. Everything a role touches otherwise
(`attributes`, `extra`, `derived`, `resources`, `affinities`, `immunities`, `spells`,
`special`) uses the standard NPC fields in [npc_model.md](npc_model.md).

- `role` {string}: Default `"custom"`. One of `"brute"` `"hunter"` `"mage"` `"saboteur"` `"sentinel"` `"support"` `"custom"`. `"custom"` = classic freeform NPC. Added at `schemaVersion` **12**.
- `qaSelections` {Record<string, bool>?}: Per-slot checked flags for non-derivable grant slots, keyed by slot id.
- `spells[n]._qaAdded` / `special[n]._qaAdded` / `actions[n]._qaAdded` {bool?}: Marks an item added via a grant slot.
- `special[n]._qaSlot` / `actions[n]._qaSlot` {string?}: The slot id that added the item.

Slot ids: `species-<index>`, `rank-<kind>`, `level-<level>`.

---

## Roles

`roles.js`. Attribute step = `min(3, floor(level / 20))` -> step 0 (L5-19), 1 (L20-39),
2 (L40-59), 3 (L60). Each cell is `dexterity, insight, might, will` die sizes.

| role     | step 0   | step 1    | step 2    | step 3     | HP               | DEF | M.DEF |
| -------- | -------- | --------- | --------- | ---------- | ---------------- | --- | ----- |
| brute    | 8,6,10,8 | 8,8,10,8  | 8,8,12,8  | 8,8,12,10  | +10 (+20 at L50) | 0   | 0     |
| hunter   | 10,8,8,6 | 10,8,8,8  | 12,8,8,8  | 12,10,8,8  | 0                | 0   | 0     |
| mage     | 8,8,6,10 | 8,10,6,10 | 8,10,6,12 | 8,10,8,12  | 0                | +1  | +2    |
| saboteur | 8,8,8,8  | 8,8,8,10  | 8,10,8,10 | 10,10,8,10 | 0                | +1  | +2    |
| sentinel | 8,8,8,8  | 8,8,10,8  | 8,8,10,10 | 10,8,10,10 | 0                | +2  | +1    |
| support  | 8,8,6,10 | 8,10,6,10 | 8,10,8,10 | 8,12,8,10  | +10              | 0   | 0     |

- Selectable levels: `5, 10, 20, 30, 40, 50, 60` only.
- Accuracy/Magic bonus = `floor(level/10)`; extra damage = `floor(level/20)*5` - derived by the normal NPC calc, not stored.

**`applyRole`** seeds the attribute dice plus flat HP/DEF/M.DEF. A level change re-seeds
silently, or prompts if you've hand-tuned the stat block; `"custom"` is a no-op.

---

## Level Grants

`levelGrants.js` - `QA_LEVEL_GRANTS`. Slots unlock at the listed level.

| role     | L10             | L20       | L30       | L40       | L50               | L60       |
| -------- | --------------- | --------- | --------- | --------- | ----------------- | --------- |
| brute    | resistance x2   | roleSkill | immunity  | roleSkill | hp                | roleSkill |
| hunter   | accuracyBonus   | roleSkill | attackMod | roleSkill | resistance x2     | roleSkill |
| mage     | attackMod       | roleSkill | immunity  | roleSkill | magicBonus        | roleSkill |
| saboteur | accuracyOrMagic | roleSkill | attackMod | roleSkill | immunity          | roleSkill |
| sentinel | resistance x2   | roleSkill | defBonus  | roleSkill | statusImmunity x2 | roleSkill |
| support  | resistance x2   | roleSkill | defBonus  | roleSkill | immunity          | roleSkill |

## Rank Grants

`getRankGrants(rank)` - extra skill slots on top of level grants:

| rank                    | Role Skills | Boss Skills |
| ----------------------- | ----------- | ----------- |
| `elite`                 | 1           | 0           |
| `champion1`-`champion6` | N (1-6)     | 1           |
| others                  | 0           | 0           |

## Species Step

`species.js` - `QA_SPECIES`. `fixed` grants always apply; GM picks `choose` of `options`.
Construct/Elemental/Undead options unlock only after adding the optional Vulnerability.

| species   | fixed                                                  | choose | optional Vuln                      |
| --------- | ------------------------------------------------------ | ------ | ---------------------------------- |
| Beast     | -                                                      | 2      | -                                  |
| Construct | earth RS, poison IM, poisoned imm.                     | 1      | air/bolt/fire/ice                  |
| Demon     | RS x2 (choice)                                         | 1      | -                                  |
| Elemental | poison IM, +1 IM (choice), poisoned imm.               | 1      | air/bolt/dark/earth/fire/ice/light |
| Humanoid  | VU one of dark/light/physical/poison                   | 3      | -                                  |
| Monster   | -                                                      | 2      | -                                  |
| Plant     | VU one of air/bolt/fire/ice, dazed/enraged/shaken imm. | 1      | -                                  |
| Undead    | light VU, dark IM, poison IM, poisoned imm.            | 1      | air/bolt/earth/fire/ice            |

`"Variant Humanoid"` aliases Humanoid. Species spells (e.g. `lick-wounds`, `breath`,
`poison`) resolve against the shipped `npcSpells` - never a compendium stub.

---

## Grant Kinds

Fillers write to the standard NPC fields; "done" state is derived from those fields (skill
grants are never auto-marked). `attackMod`/`reminder`/`replaceAffinity` are informational.

| kind                                               | writes                                     |
| -------------------------------------------------- | ------------------------------------------ |
| `roleSkill` / `bossSkill`                          | `special[]` (stamped `_qaAdded`/`_qaSlot`) |
| `resistance` / `immunity` / `affinity`             | `affinities[type]`                         |
| `statusImmunity`                                   | `immunities[status]`                       |
| `accuracyBonus` / `magicBonus` / `accuracyOrMagic` | `features.precision` / `features.magic`    |
| `defBonus`                                         | `extra.def` / `extra.mDef`                 |
| `hp`                                               | `resources.hp.bonus`                       |

---

## Constants

`constants.js`

- `DAMAGE_TYPES`: `physical` `air` `bolt` `dark` `earth` `fire` `ice` `light` `poison`
- `STATUS_EFFECTS`: `slow` `dazed` `weak` `shaken` `enraged` `poisoned`
