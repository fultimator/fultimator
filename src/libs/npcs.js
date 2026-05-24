export function calcHP(npc) {
  if (!npc || !npc.attributes) return 0;
  const might = npc.attributes.might?.base ?? 8;
  let hp = 2 * npc.lvl + 5 * might;

  // Skill Extra HP
  const hpBonus = npc.resources?.hp.bonus ?? npc.extra?.hp ?? 0;
  if (hpBonus) {
    hp += parseInt(hpBonus);
  }

  // Rank
  if (npc.rank === "champion1") {
    hp = hp * 1;
  }

  if (npc.rank === "elite" || npc.rank === "champion2") {
    hp = hp * 2;
  }

  if (npc.rank === "champion3") {
    hp = hp * 3;
  }

  if (npc.rank === "champion4") {
    hp = hp * 4;
  }

  if (npc.rank === "champion5") {
    hp = hp * 5;
  }

  if (npc.rank === "champion6") {
    hp = hp * 6;
  }

  if (npc.rank === "companion") {
    const sl = npc.companionlvl || 1;
    const lvl = npc.companionpclvl || 5;
    const extraHP =
      npc.resources?.hp.bonus ?? (npc.extra?.hp ? parseInt(npc.extra.hp) : 0);
    hp = sl * might + Math.floor(lvl / 2) + extraHP;
  }

  if (npc.rank === "groupvehicle") {
    hp = hp * 1;
  }

  return hp;
}

export function calcMP(npc) {
  if (!npc || !npc.attributes) return 0;
  const will = npc.attributes.will?.base ?? 8;
  let mp = npc.lvl + 5 * will;
  // Skill Extra MP
  const mpBonus = npc.resources?.mp.bonus ?? npc.extra?.mp ?? 0;
  if (mpBonus) {
    mp += parseInt(mpBonus);
  }
  // Rank
  if (
    npc.rank === "champion1" ||
    npc.rank === "champion2" ||
    npc.rank === "champion3" ||
    npc.rank === "champion4" ||
    npc.rank === "champion5" ||
    npc.rank === "champion6"
  ) {
    mp = mp * 2;
  }

  return mp;
}

export function calcInit(npc) {
  if (!npc || !npc.attributes) return 0;
  const dexterity = npc.attributes.dexterity?.base ?? 8;
  const insight = npc.attributes.insight?.base ?? 8;
  let init = (dexterity + insight) / 2;

  // Skill Extra Init
  const initBonus = npc.derived?.init.bonus ?? npc.extra?.extrainit ?? 0;
  let flatinit = Number(initBonus);
  if (!isNaN(flatinit)) {
    init += flatinit;
  }

  if (npc.features?.init?.enabled ?? npc.extra?.init) {
    init += 4;
  }

  // Rank
  if (npc.rank === "champion1") {
    init = init + 1;
  }
  if (npc.rank === "elite" || npc.rank === "champion2") {
    init = init + 2;
  }
  if (npc.rank === "champion3") {
    init = init + 3;
  }
  if (npc.rank === "champion4") {
    init = init + 4;
  }
  if (npc.rank === "champion5") {
    init = init + 5;
  }
  if (npc.rank === "champion6") {
    init = init + 6;
  }
  if (npc.rank === "groupvehicle") {
    init = 0;
  }

  // Armor
  if (npc.armor?.init) {
    init += npc.armor?.init;
  }

  return init;
}

export function calcDef(npc) {
  let def = 0;

  // Check if DEF is overridden
  const d = npc.derived?.def;
  if (d?.override !== undefined) return d.override;
  if (!d && npc.extra?.defOverride) return npc.extra?.def || 0; // pre-v10 fallback

  // Normal calculation when not overridden
  // Armor
  if (npc.armor?.def) {
    def += npc.armor?.def;
  }

  // Shield
  if (npc.shield?.def) {
    def += npc.shield?.def;
  }

  // Skill Extra def (bonus)
  def += d?.bonus ?? npc.extra?.def ?? 0;

  return def;
}

export function calcMDef(npc) {
  let mdef = 0;

  // Check if M.DEF is overridden
  const d = npc.derived?.mdef;
  if (d?.override !== undefined) return d.override;
  if (!d && npc.extra?.mDefOverride) return npc.extra?.mDef || 0; // pre-v10 fallback

  // Normal calculation when not overridden
  // Armor
  if (npc.armor?.mdef) {
    mdef += npc.armor?.mdef;
  }

  // Shield
  if (npc.shield?.mdef) {
    mdef += npc.shield?.mdef;
  }

  // Skill Extra M def (bonus)
  mdef += d?.bonus ?? npc.extra?.mDef ?? 0;

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

  // Equip
  if (attack.weapon) {
    number =
      number - 5 + (attack.weapon.damage?.value ?? attack.weapon.damage ?? 0);
  } else if (attack.damage?.value !== undefined) {
    number = number - 5 + attack.damage.value;
  }

  // Group Vehicle Rules
  if (npc.rank === "groupvehicle") {
    number = number + 5;
  }

  return number;
}

export function calcPrecision(attack, npc) {
  // console.debug(attack, npc);
  let number = 0;

  // Level
  number = number + Math.floor(npc.lvl / 10);

  // Extra Precision
  if (npc.features?.precision?.enabled ?? npc.extra?.precision) {
    number = number + 3;
  }

  // Equip (unified schema: accuracy.value flat on attack)
  if (attack.weapon) {
    number =
      number + (attack.weapon.prec ?? attack.weapon.accuracy?.value ?? 0);
  } else if (attack.accuracy?.value !== undefined) {
    number = number + attack.accuracy.value;
  }

  // Companion
  if (npc.rank === "companion") {
    const sl = npc.companionlvl || 1;
    number = number + sl;
  }
  return number;
}

export function calcMagic(npc) {
  let number = 0;

  // Level
  number = number + Math.floor(npc.lvl / 10);

  // Extra Magic
  if (npc.features?.magic?.enabled ?? npc.extra?.magic) {
    number = number + 3;
  }

  // Companion
  if (npc.rank === "companion") {
    const sl = npc.companionlvl || 1;
    number = number + sl;
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
    npc.species === "Construct" ||
    npc.species === "Elemental" ||
    npc.species === "Undead"
  ) {
    number = 2;
  }

  if (
    npc.species === "Demon" ||
    npc.species === "Plant" ||
    npc.species === "Humanoid"
  ) {
    number = 3;
  }

  if (npc.species === "Variant Humanoid") {
    number = 4;
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
  if (npc.species === "Undead" && npc.affinities.light === "vu") {
    sum = sum - 1;
  }

  // Plants have a free vulnerability
  if (
    npc.species === "Plant" &&
    (npc.affinities.fire ||
      npc.affinities.air ||
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

  if (npc.rank === "champion1") {
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

  if (npc.rank === "champion5") {
    return 5;
  }

  if (npc.rank === "champion6") {
    return 6;
  }

  if (npc.rank === "groupvehicle") {
    return 3;
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
    calcUsedSkillsFromAbsorbs(npc) +
    calcUsedSkillsFromSpecial(npc) +
    calcUsedSkillsFromSpells(npc) +
    calcUsedSkillsFromEquip(npc) +
    calcUsedSkillsFromOtherActions(npc) +
    calcUsedSkillsFromStatusImmunity(npc)
  );
}

export function calcUsedSkillsFromStatusImmunity(npc) {
  return parseInt(npc.extra?.statusImmunity) || 0;
}

export function calcUsedSkillsFromOtherActions(npc) {
  let sum = 0;

  npc.actions?.forEach((actionItem) => {
    const spCost = actionItem.spCost ?? 1;
    sum += parseFloat(spCost);
  });

  return sum;
}

export function calcUsedSkillsFromSpecialAttacks(npc) {
  let sum = 0;
  npc.attacks?.forEach((attack) => {
    if (attack.effect || attack.special?.length) sum++;
    if (attack.extraDamage) sum++;
  });

  npc.weaponattacks?.forEach((attack) => {
    if (attack.effect || attack.special?.length) sum++;
    if (attack.extraDamage) sum++;
  });

  return sum;
}

export function calcUsedSkillsFromExtraDefs(npc) {
  let defCost = 0;
  let mDefCost = 0;

  // Only count def bonus if not overridden
  if (npc.extra?.def && !npc.extra?.defOverride) {
    defCost = npc.extra.def;
  }

  // Only count mDef bonus if not overridden
  if (npc.extra?.mDef && !npc.extra?.mDefOverride) {
    mDefCost = npc.extra.mDef;
  }

  if (defCost === 0 && mDefCost === 0) {
    return 0;
  }

  return (defCost + mDefCost) / 3;
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
  return npc.extra.mp / 10 / 2;
}

export function calcUsedSkillsFromExtraInit(npc) {
  return (npc.features?.init?.enabled ?? npc.extra?.init) ? 1 : 0;
}

export function calcUsedSkillsFromExtraPrecision(npc) {
  return (npc.features?.precision?.enabled ?? npc.extra?.precision) ? 1 : 0;
}

export function calcUsedSkillsFromExtraMagic(npc) {
  return (npc.features?.magic?.enabled ?? npc.extra?.magic) ? 1 : 0;
}

export function calcUsedSkillsFromResistances(npc) {
  let sum = 0;
  Object.entries(npc.affinities).forEach((el) => {
    if (el[1] === "rs") {
      // Don't count earth for Construct
      if (npc.species === "Construct" && el[0] === "earth") {
        return;
      }

      sum++;
    }
  });

  // Demons have two free resistances
  if (npc.species === "Demon") {
    sum = sum - 2;
  }

  if (sum < 0) {
    sum = 0;
  }
  //return Math.ceil(sum / 2);
  return sum / 2;
}

export function calcUsedSkillsFromImmunities(npc) {
  let sum = 0;
  Object.entries(npc.affinities).forEach((el) => {
    if (el[1] === "im") {
      // Don't count poison for Construct, Elemental, Non Mortto
      if (
        (npc.species === "Construct" ||
          npc.species === "Elemental" ||
          npc.species === "Undead") &&
        el[0] === "poison"
      ) {
        return;
      }

      // Don't count dark for Non Mortto
      if (npc.species === "Undead" && el[0] === "dark") {
        return;
      }

      sum++;
    }
  });

  // Elementals have a free immunity
  if (npc.species === "Elemental") {
    sum = sum - 1;
  }

  if (sum < 0) {
    sum = 0;
  }

  return Math.ceil(sum);
}

export function calcUsedSkillsFromAbsorbs(npc) {
  let sum = 0;
  Object.entries(npc.affinities).forEach((el) => {
    if (el[1] === "ab") {
      sum++;
    }
  });

  if (sum < 0) {
    sum = 0;
  }

  return Math.ceil(sum) * 2;
}

export function calcUsedSkillsFromSpecial(npc) {
  let sum = 0;

  npc.special?.forEach((specialItem) => {
    const spCost = specialItem.spCost ?? 1;
    sum += parseFloat(spCost);
  });

  return sum;
}

export function calcUsedSkillsFromSpells(npc) {
  return npc.spells?.length / 2 || 0;
}

export function calcUsedSkillsFromEquip(npc) {
  let equip = false;

  if (npc.weaponattacks?.length > 0) {
    equip = true;
  }

  if (npc.armor && (npc.armor.cost ?? 0) !== 0) {
    equip = true;
  }

  if (npc.shield && (npc.shield.cost ?? 0) !== 0) {
    equip = true;
  }

  if (npc.species === "Humanoid" || npc.species === "Variant Humanoid") {
    equip = false;
  }

  return equip ? 1 : 0;
}
