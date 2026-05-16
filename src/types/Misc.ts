export enum Affinities {
  Resistance = "rs",
  Vulnerability = "vu",
  Absorpbtion = "ab",
  Immunity = "im",
  None = "no",
}

export enum Attributes {
  Might = "might",
  Dexterity = "dexterity",
  Insight = "insight",
  Willpower = "will",
}

export enum Elements {
  Physical = "physical",
  Air = "air",
  Bolt = "bolt",
  Dark = "dark",
  Earth = "earth",
  Fire = "fire",
  Ice = "ice",
  Light = "light",
  Poison = "poison",
  Untyped = "untyped",
}

export interface Damage {
  value: number;
  type: Elements;
  hrZero: boolean;
}

export interface Accuracy {
  attr1: string;
  attr2: string;
  value: number;
  defense: "def" | "mdef";
}

export type CostResource = "mp" | "hp" | "ip" | "fp";

export interface ResourceCost {
  resource: CostResource;
  amount: number;
  perTarget: boolean;
}

export interface ActorAttributeValue {
  base: number;
}

export interface ActorAttributes {
  might: ActorAttributeValue;
  insight: ActorAttributeValue;
  will: ActorAttributeValue;
  dexterity: ActorAttributeValue;
}

export interface ActorAffinities {
  physical: Affinities;
  air: Affinities;
  bolt: Affinities;
  dark: Affinities;
  earth: Affinities;
  fire: Affinities;
  ice: Affinities;
  light: Affinities;
  poison: Affinities;
}

export interface ActorImmunities {
  slow: boolean;
  dazed: boolean;
  weak: boolean;
  shaken: boolean;
  enraged: boolean;
  poisoned: boolean;
}

export interface ActorStatuses {
  slow: boolean;
  dazed: boolean;
  weak: boolean;
  shaken: boolean;
  enraged: boolean;
  poisoned: boolean;
}

export interface ActorResourcePool {
  current: number;
  bonus: number;
}

export interface ActorResources {
  hp: ActorResourcePool;
  mp: ActorResourcePool;
}

export interface ActorDerivedStat {
  bonus: number;
  override?: number;
}

export interface ActorDerived {
  def: ActorDerivedStat;
  mdef: ActorDerivedStat;
  init: { bonus: number };
}
