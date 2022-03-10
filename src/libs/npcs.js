export function calcHP(npc) {
  let hp = 2 * npc.lvl + 5 * npc.attributes.might;

  // Skill Extra HP
  if (npc.extra?.hp) {
    hp += parseInt(npc.extra.hp);
  }

  // Rank
  if (npc.rank === "elite" || npc.rank === "champion2") {
    hp = hp * 2;
  }

  if (npc.rank === "champion3") {
    hp = hp * 3;
  }

  if (npc.rank === "champion4") {
    hp = hp * 4;
  }

  return hp;
}

export function calcMP(npc) {
  let mp = npc.lvl + 5 * npc.attributes.will;
  // Skill Extra MP
  if (npc.extra?.mp) {
    mp += parseInt(npc.extra.mp);
  }
  // Rank
  if (
    npc.rank === "champion2" ||
    npc.rank === "champion3" ||
    npc.rank === "champion4"
  ) {
    mp = mp * 2;
  }

  return mp;
}

export function calcInit(npc) {
  let init = (npc.attributes.dexterity + npc.attributes.insight) / 2;

  // Skill Extra Init
  if (npc.extra?.init) {
    init += 4;
  }

  // Rank
  if (npc.rank === "elite" || npc.rank === "champion2") {
    init = init + 2;
  }

  if (npc.rank === "champion3") {
    init = init + 3;
  }
  if (npc.rank === "champion4") {
    init = init + 4;
  }

  return init;
}

export function calcDef(npc) {
  let def = 0;

  // Skill Extra def
  if (npc.extra?.def) {
    def += npc.extra?.def;
  }

  return def;
}

export function calcMDef(npc) {
  let mdef = 0;

  // Skill Extra M def
  if (npc.extra?.mDef) {
    mdef += npc.extra?.mDef;
  }

  return mdef;
}

export function calcDamage(attack, npc) {
  let number = 5;

  // Level
  number = number + Math.floor(npc.lvl / 20) * 5;

  // Extra Damage
  if (attack.extraDamage) {
    number = number + 5;
  }

  return number;
}

export function calcPrecision(npc) {
  let number = 0;

  // Level
  number = number + Math.floor(npc.lvl / 10);

  // Extra Precision
  if (npc.extra?.precision) {
    number = number + 3;
  }

  return number;
}

export function calcMagic(npc) {
  let number = 0;

  // Level
  number = number + Math.floor(npc.lvl / 10);

  // Extra Precision
  if (npc.extra?.magic) {
    number = number + 3;
  }

  return number;
}

export function calcAvailableSkills(npc) {
  return (
    calcAvailableSkillsFromSpecies(npc) +
    calcAvailableSkillsFromLevel(npc) +
    calcAvailableSkillsFromVulnerabilities(npc) +
    calcAvailableSkillsFromRank(npc)
  );
}

export function calcAvailableSkillsFromSpecies(npc) {
  let number = 4;

  if (
    npc.species === "Costrutto" ||
    npc.species === "Elementale" ||
    npc.species === "Non Morto"
  ) {
    number = 2;
  }

  if (
    npc.species === "Demone" ||
    npc.species === "Pianta" ||
    npc.species === "Umanoide"
  ) {
    number = 3;
  }

  return number;
}

export function calcAvailableSkillsFromLevel(npc) {
  return Math.floor(npc.lvl / 10);
}

export function calcAvailableSkillsFromVulnerabilities(npc) {
  let sum = 0;
  Object.entries(npc.affinities).forEach((el) => {
    if (el[1] === "vu") {
      sum++;
    }
  });

  if (npc.affinities.physical === "vu") {
    sum++;
  }

  // Undeads are vulnerable to light
  if (npc.species === "Non Morto" && npc.affinities.light === "vu") {
    sum = sum - 1;
  }

  // Plants have a free vulnerability
  if (
    npc.species === "Pianta" &&
    (npc.affinities.fire ||
      npc.affinities.wind ||
      npc.affinities.ice ||
      npc.affinities.bolt)
  ) {
    sum = sum - 1;
  }
  if (sum < 0) {
    sum = 0;
  }

  return sum;
}

export function calcAvailableSkillsFromRank(npc) {
  if (npc.rank === "elite") {
    return 1;
  }

  if (npc.rank === "champion2") {
    return 2;
  }

  if (npc.rank === "champion3") {
    return 3;
  }

  if (npc.rank === "champion4") {
    return 4;
  }

  return 0;
}

export function calcUsedSkills(npc) {
  return (
    calcUsedSkillsFromSpecialAttacks(npc) +
    calcUsedSkillsFromExtraDefs(npc) +
    calcUsedSkillsFromExtraHP(npc) +
    calcUsedSkillsFromExtraMP(npc) +
    calcUsedSkillsFromExtraInit(npc) +
    calcUsedSkillsFromExtraPrecision(npc) +
    calcUsedSkillsFromExtraMagic(npc) +
    calcUsedSkillsFromResistances(npc) +
    calcUsedSkillsFromImmunities(npc) +
    calcUsedSkillsFromSpecial(npc) +
    calcUsedSkillsFromSpells(npc)
  );
}

export function calcUsedSkillsFromSpecialAttacks(npc) {
  let sum = 0;
  npc.attacks?.forEach((attack) => {
    sum += attack.special.length;
    if (attack.extraDamage) {
      sum++;
    }
  });

  return sum;
}

export function calcUsedSkillsFromExtraDefs(npc) {
  if (!npc.extra?.def || !npc.extra?.mDef) {
    return 0;
  }
  return (npc.extra.def + npc.extra.mDef) / 3;
}

export function calcUsedSkillsFromExtraHP(npc) {
  if (!npc.extra?.hp) {
    return 0;
  }
  return npc.extra.hp / 10;
}

export function calcUsedSkillsFromExtraMP(npc) {
  if (!npc.extra?.mp) {
    return 0;
  }
  return npc.extra.mp / 5 / 2;
}

export function calcUsedSkillsFromExtraInit(npc) {
  if (!npc.extra?.init) {
    return 0;
  }
  return 1;
}

export function calcUsedSkillsFromExtraPrecision(npc) {
  if (!npc.extra?.precision) {
    return 0;
  }
  return 1;
}

export function calcUsedSkillsFromExtraMagic(npc) {
  if (!npc.extra?.magic) {
    return 0;
  }
  return 1;
}

export function calcUsedSkillsFromResistances(npc) {
  let sum = 0;
  Object.entries(npc.affinities).forEach((el) => {
    if (el[1] === "rs") {
      // Don't count earth for Costrutto
      if (npc.species === "Costrutto" && el[0] === "earth") {
        return;
      }

      sum++;
    }
  });

  // Demons have two free resistances
  if (npc.species === "Demone") {
    sum = sum - 2;
  }

  if (sum < 0) {
    sum = 0;
  }

  return Math.ceil(sum / 2);
}

export function calcUsedSkillsFromImmunities(npc) {
  let sum = 0;
  Object.entries(npc.affinities).forEach((el) => {
    if (el[1] === "im") {
      // Don't count poison for Costrutto, Elementale, Non Mortto
      if (
        (npc.species === "Costrutto" ||
          npc.species === "Elementale" ||
          npc.species === "Non Morto") &&
        el[0] === "poison"
      ) {
        return;
      }

      // Don't count dark for Non Mortto
      if (npc.species === "Non Morto" && el[0] === "dark") {
        return;
      }

      sum++;
    }
  });

  // Elementals have a free immunity
  if (npc.species === "Elementale") {
    sum = sum - 1;
  }

  if (sum < 0) {
    sum = 0;
  }

  return Math.ceil(sum);
}

export function calcUsedSkillsFromSpecial(npc) {
  return npc.special?.length || 0;
}

export function calcUsedSkillsFromSpells(npc) {
  return npc.spells?.length / 2 || 0;
}
