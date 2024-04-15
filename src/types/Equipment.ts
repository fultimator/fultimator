import { Attributes } from "./Misc";

// TODO: Add weapon categories as enum

export interface Weapon {
    cost: number,
    category: string,
    prec: number,
    att1: Attributes,
    att2: Attributes,
    name: string,
    range: string,
    hands: number,
    damage: number,
    type: string,
    martial: boolean
}