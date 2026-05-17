export type WeaponCategory =
  | "arcane"
  | "bow"
  | "brawling"
  | "dagger"
  | "firearm"
  | "flail"
  | "heavy"
  | "spear"
  | "sword"
  | "thrown";

export type DamageElement =
  | "physical"
  | "air"
  | "bolt"
  | "dark"
  | "earth"
  | "fire"
  | "ice"
  | "light"
  | "poison";

export type NpcSpecies =
  | "beast"
  | "construct"
  | "demon"
  | "elemental"
  | "humanoid"
  | "monster"
  | "plant"
  | "undead";

export interface AccuracyBonuses {
  all: number;
  melee: number;
  ranged: number;
  magic: number;
  opposed: number;
  open: number;
  arcane: number;
  bow: number;
  brawling: number;
  dagger: number;
  firearm: number;
  flail: number;
  heavy: number;
  spear: number;
  sword: number;
  thrown: number;
}

export interface DamageBonuses {
  all: number;
  melee: number;
  ranged: number;
  spell: number;
  arcane: number;
  bow: number;
  brawling: number;
  dagger: number;
  firearm: number;
  flail: number;
  heavy: number;
  spear: number;
  sword: number;
  thrown: number;
  physical: number;
  air: number;
  bolt: number;
  dark: number;
  earth: number;
  fire: number;
  ice: number;
  light: number;
  poison: number;
  beast: number;
  construct: number;
  demon: number;
  elemental: number;
  humanoid: number;
  monster: number;
  plant: number;
  undead: number;
}

export interface ResourceDelta {
  hp: number;
  mp: number;
  ip: number;
}

export interface ActorBonuses {
  incomingRecovery: ResourceDelta;
  incomingLoss: ResourceDelta;
  outgoingRecovery: ResourceDelta;
  accuracy: AccuracyBonuses;
  damage: DamageBonuses;
  incomingDamage: DamageBonuses;
}

export function zeroAccuracyBonuses(): AccuracyBonuses {
  return {
    all: 0, melee: 0, ranged: 0, magic: 0, opposed: 0, open: 0,
    arcane: 0, bow: 0, brawling: 0, dagger: 0, firearm: 0,
    flail: 0, heavy: 0, spear: 0, sword: 0, thrown: 0,
  };
}

export function zeroDamageBonuses(): DamageBonuses {
  return {
    all: 0, melee: 0, ranged: 0, spell: 0,
    arcane: 0, bow: 0, brawling: 0, dagger: 0, firearm: 0,
    flail: 0, heavy: 0, spear: 0, sword: 0, thrown: 0,
    physical: 0, air: 0, bolt: 0, dark: 0, earth: 0,
    fire: 0, ice: 0, light: 0, poison: 0,
    beast: 0, construct: 0, demon: 0, elemental: 0,
    humanoid: 0, monster: 0, plant: 0, undead: 0,
  };
}

export function zeroResourceDelta(): ResourceDelta {
  return { hp: 0, mp: 0, ip: 0 };
}

export function zeroActorBonuses(): ActorBonuses {
  return {
    incomingRecovery: zeroResourceDelta(),
    incomingLoss: zeroResourceDelta(),
    outgoingRecovery: zeroResourceDelta(),
    accuracy: zeroAccuracyBonuses(),
    damage: zeroDamageBonuses(),
    incomingDamage: zeroDamageBonuses(),
  };
}
