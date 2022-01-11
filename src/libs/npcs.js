export function calcHP(npc) {
  let hp = 2 * npc.lvl + 5 * npc.attributes.might;

  // Skill Extra HP
  if (npc.skills?.extraHP) {
    hp += npc.skills.extraHP * 10;
  }

  return hp;
}

export function calcMP(npc) {
  let mp = npc.lvl + 5 * npc.attributes.will;

  return mp;
}

export function calcInit(npc) {
  let init = (npc.attributes.dexterity + npc.attributes.insight) / 2;

  // Skill Extra Init
  if (npc.skills?.extraInit) {
    init += 4;
  }

  return init;
}

export function calcDef(npc) {
  let def = 0;

  // Skill Extra def
  if (npc.skills?.extraDef) {
    def += npc.skills?.extraDef;
  }

  return def;
}

export function calcMDef(npc) {
  let mdef = 0;

  // Skill Extra M def
  if (npc.skills?.extraMDef) {
    mdef += npc.skills?.extraMDef;
  }

  return mdef;
}
