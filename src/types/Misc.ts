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
