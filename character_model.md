# Fultimator Character Model Documentation

## Fields

### `uid`
- **Type:** String
- **Description:** Unique identifier for the user.

### `id`
- **Type:** String
- **Description:** Unique identifier for the character.

### `name`
- **Type:** String
- **Description:** Name of the character.

### `lvl`
- **Type:** Integer
- **Description:** Level of the character.

### `info`
- **Type:** Object
- **Description:** Additional information about the character.
  - **`pronouns`**: String, Pronouns used for the character.
  - **`identity`**: String, Identity of the character.
  - **`theme`**: String, Theme of the character.
  - **`origin`**: String, Origin of the character.
  - **`description`**: String, Description of the character.
  - **`zenit`**: Integer, Zenit points of the character.
  - **`fabulapoints`**: Integer, Fabula points of the character.
  - **`exp`**: Integer, Experience points of the character.
  - **`imgurl`**: String, URL to image of the character.
  - **`bonds`**: Array of Objects, Bonds the character has.
    - **`name`**: String, Name of the bond.
    - **`admiration`**: Boolean, Indicates if characters feels admiration for the bond.
    - **`loyality`**: Boolean, Indicates if characters feels loyality for the bond. 
    - **`affection`**: Boolean, Indicates if characters feels affection for the bond.
    - **`inferiority`**: Boolean, Indicates if characters feels inferiority for the bond.
    - **`mistrust`**: Boolean, Indicates if characters feels mistrust for the bond.
    - **`hatred`**: Boolean, Indicates if characters feels hatred for the bond.

### `attributes`
- **Type:** Object
- **Description:** Attributes of the character.
  - **`dexterity`**: Integer, Dexterity of the character.
  - **`insight`**: Integer, Insight of the character.
  - **`might`**: Integer, Might of the character.
  - **`willpower`**: Integer, Willpower of the character.

### `stats`
- **Type:** Object
- **Description:** Stats of the character.
  - **`hp`**: Object, Hit points.
    - **`current`**: Integer, Current hit points.
    - **`max`**: Integer, Maximum hit points.
  - **`mp`**: Object, Mind points.
    - **`current`**: Integer, Current mind points.
    - **`max`**: Integer, Maximum mind points.
  - **`ip`**: Object, Insight points.
    - **`current`**: Integer, Current inventory points.
    - **`max`**: Integer, Maximum inventory points.

### `statuses`
- **Type:** Object
- **Description:** Status effects affecting the character.
  - **`slow`**: Boolean, Indicates if the character is slowed. 
  - **`dazed`**: Boolean, Indicates if the character is dazed.
  - **`enraged`**: Boolean, Indicates if the character is enraged.
  - **`weak`**: Boolean, Indicates if the character is weak.
  - **`shaken`**: Boolean, Indicates if the character is shaken.
  - **`poisoned`**: Boolean, Indicates if the character is poisoned.
  - **`dexUp`**: Boolean, Indicates if the character's dexterity is increased.
  - **`insUp`**: Boolean, Indicates if the character's insight is increased.
  - **`migUp`**: Boolean, Indicates if the character's might is increased.
  - **`wlpUp`**: Boolean, Indicates if the character's willpower is increased.

### `modifiers`
- **Type:** Object
- **Description:** Various modifiers that affect the character's stats.
  - **`hp`**: Integer, Hit points modifier.
  - **`mp`**: Integer, Mind points modifier.
  - **`ip`**: Integer, Inventory points modifier.
  - **`def`**: Integer, Defense modifier.
  - **`mdef`**: Integer, Magic defense modifier.
  - **`init`**: Integer, Initiative modifier.
  - **`meleePrec`**: Integer, Melee precision modifier.
  - **`rangedPrec`**: Integer, Ranged precision modifier.
  - **`magicPrec`**: Integer, Magic precision modifier.

### `classes`
- **Type:** Array of Objects
- **Description:** Classes the character has.
  - **`name`**: String, Name of the class.
  - **`lvl`**: Integer, Level of the class.
  - **`benefits`**: Object, Benefits provided by the class.
    - **`hpplus`**: Integer, Additional HP provided by the class.
    - **`mpplus`**: Integer, Additional MP provided by the class.
    - **`ipplus`**: Integer, Additional IP provided by the class.
    - **`martials`**: Object, Martial benefits provided by the class.
      - **`armor`**: Boolean, Indicates if the class can equip martial armor.
      - **`shields`**: Boolean, Indicates if the class can equip martial shields.
      - **`melee`**: Boolean, Indicates if the class can equip martial melee weapons.
      - **`ranged`**: Boolean, Indicates if the class can equip martial ranged weapons.
    - **`rituals`**: Object, Ritual benefits provided by the class.
      - **`ritualism`**: Boolean, Indicates if the class can do rituals from ritualism.
      - **`arcanism`**: Boolean, Indicates if the class can do rituals from arcanism.
      - **`chimerism`**: Boolean, Indicates if the class can do rituals from chimerism.
      - **`elementalism`**: Boolean, Indicates if the class can do rituals from elementalism.
      - **`entropism`**: Boolean, Indicates if the class can do rituals from entropism.
      - **`spiritism`**: Boolean, Indicates if the class can do rituals from spiritism.
    - **`custom`**: Array of Strings, List of custom benefits.
    - **`spellClasses`**: Array of Strings, List of spell classes provided by the class. Ex: "default" for default spells.
  - **`skills`**: Array of Objects, Skills the character has.
    - **`skillName`**: String, Name of the skill.
    - **`currentLvl`**: Integer, Current level of the skill.
    - **`maxLvl`**: Integer, Maximum level of the skill.
    - **`description`**: String, Description of the skill.
  - **`heroic`**: Object, Heroic skill of the class.
    - **`name`**: String, Name of the heroic skill.
    - **`description`**: String, Description of the heroic skill.
  - **`spells`**: Array of Objects, Spells the character knows.
    - **`spellType`**: String, Type of the spell. (From classes.benefits.spellClasses)
    - **`name`**: String, Name of the spell.
    - **`mp`**: Integer, MP cost of the spell for each target.
    - **`maxTargets`**: Integer, Maximum number of targets for the spell.
    - **`targetDesc`**: String, Description of the spell's targets.
    - **`duration`**: String, Duration of the spell.
    - **`description`**: String, Description of the spell.
    - **`isOffensive`**: Boolean, Indicates if the spell is offensive.
    - **`attr1`**: String, Primary attribute used by the spell if offensive.
    - **`attr2`**: String, Secondary attribute used by the spell if offensive.
    - **`index`**: Integer, Index of the spell in the list.

### `weapons`
- **Type:** Array of Objects
- **Description:** List of weapons the character possesses.
  - **`base`**: Object, Reference of the base weapon.
    - **`category`**: String, Category of the base weapon.
    - **`name`**: String, Name of the base weapon.
    - **`type`**: String, Type of damage dealt by the base weapon.
    - **`hands`**: Integer, Number of hands required by the base weapon.
    - **`melee`**: Boolean, Indicates if the base weapon is melee
    - **`ranged`**: Boolean, Indicates if the base weapon is ranged.
    - **`damage`**: Integer, Damage of the base weapon.
    - **`prec`**: Integer, Precision of the base weapon.
    - **`martial`**: Boolean, Indicates if the base weapon is martial.
    - **`att1`**: String, Primary attribute used by the base weapon.
    - **`att2`**: String, Secondary attribute used by the base weapon.
    - **`cost`**: Integer, Base cost of the weapon. 
  - **`category`**: String, Category of the weapon.
  - **`name`**: String, Name of the weapon.
  - **`type`**: String, Type of damage dealt by the weapon.
  - **`hands`**: Integer, Number of hands required.
  - **`melee`**: Boolean, Indicates if the weapon is melee.
  - **`ranged`**: Boolean, Indicates if the weapon is ranged.
  - **`damage`**: Integer, Damage dealt by the weapon.
  - **`prec`**: Integer, Precision of the weapon.
  - **`martial`**: Boolean, Indicates if the weapon is martial.
  - **`att1`**: String, Primary attribute used by the weapon.
  - **`att2`**: String, Secondary attribute used by the weapon.
  - **`cost`**: Integer, Cost of the weapon.
  - **`quality`**: String, Quality of the weapon.
  - **`selectedQuality`**: String, Selected quality of the weapon.
  - **`qualityCost`**: Integer, Cost of the selected quality.
  - **`damageBonus`**: Boolean, Indicates if the weapon has a damage bonus.
  - **`precBonus`**: Boolean, Indicates if the weapon has a precision bonus.
  - **`totalBonus`**: Integer, Total bonus of the weapon.
  - **`rework`**: Boolean, Indicates if the weapon has been reworked.
  - **`damageReworkBonus`**: Boolean, Indicates if the weapon has a damage rework bonus.
  - **`isEquipped`**: Boolean, Indicates if the weapon is equipped.

### `armor`
- **Type:** Array of Objects
- **Description:** List of armor the character possesses.
  - **`base`**: Object, Base stats of the armor.
    - **`category`**: String, Category of the base armor.
    - **`name`**: String, Name of the base armor.
    - **`def`**: Integer, Defense of the base armor.
    - **`mdef`**: Integer, Magic defense of the base armor.
    - **`init`**: Integer, Initiative of the base armor.
    - **`martial`**: Boolean, Indicates if the base armor is martial.
    - **`cost`**: Integer, Cost of the base armor.
  - **`category`**: String, Category of the armor.
  - **`name`**: String, Name of the armor.
  - **`def`**: Integer, Defense provided by the armor.
  - **`mdef`**: Integer, Magic defense provided by the armor.
  - **`init`**: Integer, Initiative modifier provided by the armor.
  - **`defModifier`**: Integer, Defense modifier for customizing the armor.
  - **`mDefModifier`**: Integer, Magic Defense modifier for customizing the armor.
  - **`initModifier`**: Integer, Initiative modifier for customizing the armor.
  - **`damageMeleeModifier`**: Integer, Damage for melee weapons modifier for customizing the armor.
  - **`damageRangedModifier`**: Integer, Damage for ranged weapons modifier for customizing the armor.
  - **`precModifier`**: Integer, Bonus for precision checks modifier for customizing the armor.
  - **`magicModifier`**: Integer, Bonus for magic checks modifier for customizing the armor.
  - **`martial`**: Boolean, Indicates if the armor is martial.
  - **`cost`**: Integer, Cost of the armor.
  - **`quality`**: String, Quality of the armor.
  - **`selectedQuality`**: String, Selected quality of the armor.
  - **`qualityCost`**: Integer, Cost of the quality.
  - **`rework`**: Boolean, Indicates if the armor has been reworked.
  - **`isEquipped`**: Boolean, Indicates if the armor is equipped.

### `shields`
- **Type:** Array of Objects
- **Description:** List of shields the character possesses.
  - **`base`**: Object, Base stats of the shield.
    - **`category`**: String, Category of the base shield.
    - **`name`**: String, Name of the base shield.
    - **`def`**: Integer, Defense of the base shield.
    - **`mdef`**: Integer, Magic defense of the base shield.
    - **`init`**: Integer, Initiative of the base shield.
    - **`martial`**: Boolean, Indicates if the base shield is martial.
    - **`cost`**: Integer, Cost of the base shield.
  - **`category`**: String, Category of the shield.
  - **`name`**: String, Name of the shield.
  - **`def`**: Integer, Defense provided by the shield.
  - **`mdef`**: Integer, Magic defense provided by the shield.
  - **`init`**: Integer, Initiative modifier provided by the shield.
  - **`defModifier`**: Integer, Defense modifier for customizing the shield.
  - **`mDefModifier`**: Integer, Magic Defense modifier for customizing the shield.
  - **`initModifier`**: Integer, Initiative modifier for customizing the shield.
  - **`damageMeleeModifier`**: Integer, Damage for melee weapons modifier for customizing the shield.
  - **`damageRangedModifier`**: Integer, Damage for ranged weapons modifier for customizing the shield.
  - **`precModifier`**: Integer, Bonus for precision checks modifier for customizing the shield.
  - **`magicModifier`**: Integer, Bonus for magic checks modifier for customizing the shield.
  - **`martial`**: Boolean, Indicates if the shield is martial.
  - **`cost`**: Integer, Cost of the shield.
  - **`quality`**: String, Quality of the shield.
  - **`selectedQuality`**: String, Selected quality of the shield.
  - **`qualityCost`**: Integer, Cost of the quality.
  - **`rework`**: Boolean, Indicates if the shield has been reworked.
  - **`isEquipped`**: Boolean, Indicates if the shield is equipped.

### `accessories`
- **Type:** Array of Objects
- **Description:** List of accessories the character possesses.
  - **`name`**: String, Name of the accessory.
  - **`defModifier`**: Integer, Defense modifier provided by the accessory.
  - **`mDefModifier`**: Integer, Magic defense modifier provided by the accessory.
  - **`initModifier`**: Integer, Initiative modifier provided by the accessory.
  - **`damageMeleeModifier`**: Integer, Damage for melee weapons modifier for customizing the accessory.
  - **`damageRangedModifier`**: Integer, Damage for ranged weapons modifier for customizing the accessory.
  - **`precModifier`**: Integer, Bonus for precision checks modifier for customizing the accessory.
  - **`magicModifier`**: Integer, Bonus for magic checks modifier for customizing the accessory.
  - **`cost`**: Integer, Cost of the accessory.
  - **`quality`**: String, Quality of the accessory.
  - **`selectedQuality`**: String, Selected quality of the accessory.
  - **`qualityCost`**: Integer, Cost of the quality.
  - **`isEquipped`**: Boolean, Indicates if the accessory is equipped.

### `notes`
- **Type:** Array of Objects
- **Description:** Notes associated with the character.
  - **`name`**: String, Name of the note.
  - **`description`**: String, Description of the note.

### `published`
- **Type:** Boolean
- **Description:** Indicates whether the character has been published.
