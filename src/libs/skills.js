// Array of particular skills that affect the character directly
const skills = [
  {
    name: "Ritual Arcanism",
    description:
      "You may perform Rituals of the **Arcanism** discipline, as long as their effects fall within the **domains** of one or more Arcana you have bound (see next pages). Arcanism Rituals use **【 WLP + WLP】** for the Magic Check.",
    class: "Arcanist",
    maxLvl: 1,
  },
  {
    name: "Ritual Elementalism",
    description:
      "You may perform Rituals whose effects fall within the **Elementalism** discipline. Elementalism Rituals use **【 INS + WLP】** for the Magic Check.",
    class: "Elementalist",
    maxLvl: 1,
  },
  {
    name: "Ritual Chimerism",
    description:
      "You may perform Rituals whose effects fall within the **Chimerism** discipline. When you acquire this Skill, choose **【 INS + WLP】 o【r MIG + WLP】**. From now on, your Chimerism Rituals will use the chosen Attributes for the Magic Check.",
    class: "Chimerist",
    maxLvl: 1,
  },
  {
    name: "Ritual Entropism",
    description:
      "You may perform Rituals whose effects fall within the **Entropism** discipline. Entropism Rituals use **【 INS + WLP】** for the Magic Check.",
    class: "Entropist",
    maxLvl: 1,
  },
  {
    name: "Ritual Spiritism",
    description:
      "You may perform Rituals whose effects fall within the **Spiritism** discipline. Spiritism Rituals use **【 INS + WLP】** for the Magic Check.",
    class: "Spiritist",
    maxLvl: 1,
  },
  {
    name: "Defensive Mastery",
    description: "",
    class: "Guardian",
    maxLvl: 5,
  },
  {
    name: "Dual Shieldbearer",
    description: "",
    class: "Guardian",
    maxLvl: 1,
  },
  {
    name: "Fortress",
    description: "Permanently increase your maximum Hit Points by **【 SL × 3】**.",
    class: "Guardian",
    maxLvl: 5,
  },
  {
    name: "Focused",
    description: "Permanently increase your maximum Mind Points by **【 SL × 3】**.",
    class: "Loremaster",
    maxLvl: 5,
  },
  {
    name: "Dodge",
    description: "As long as you have no **shields** and no **martial armor** equipped, your Defense score is increased by **【SL】**",
    class: "Rogue",
    maxLvl: 3,
  },
  {
    name: "Ranged Weapon Mastery",
    description: "You gain a bonus equal to **【SL】** to all Accuracy Checks with **ranged** weapons.",
    class: "Sharpshooter",
    maxLvl: 4,
  },
  {
    name: "Melee Weapon Mastery",
    description: "You gain a bonus equal to **【SL】** to all Accuracy Checks with **melee** weapons.",
    class: "Weaponmaster",
    maxLvl: 4,
  },
  {
    name: "Faithful Companion",
    description: "Faithful Companion description",
    class: "Wayfarer",
    maxLvl: 5,
  }
];

export default skills;
