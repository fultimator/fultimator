import { Weapon } from "./Equipment"
import { Affinities } from "./Misc"

export interface NpcAttributes {
    might: number,
    insight: number,
    will: number,
    dexterity: number
}

export interface NpcArmor {
    def: number,
    name: string,
    init: number,
    mdefbonus: number,
    cost: number,
    mdef: number,
    defbonus: number,
    martial: boolean
}

export interface NpcAttack {
    name: string,
    range: string,
    attr1: string,
    attr2: string,
    type: string,
    special: string[],
    extraDamage?: boolean
}

export interface NpcWeaponAttack {
    extraDamage?: false,
    weapon: Weapon,
    name: string,
    type: string,
    special: string[]
}

export interface NpcSpell {
    effect?: string,
    target?: string,
    duration?: string,
    name: string,
    range: string,
    type: string | null,
    damagetype: string,
    attr1: string,
    attr2: string,
    mp?: string,
    special: string[]
}

export interface NpcAction {
    name: string,
    effect: string,
    spCost: number
}

export interface NpcSpecial {
    name: string,
    effect: string,
    spCost: number
}

export interface NpcRareGear {
    name: string,
    effect: string
}

export interface NpcExtra {
    init?: boolean,
    precision?: boolean,
    hp?: string,
    magic?: boolean
}

export interface NpcAffinities {
    physical?: Affinities
    wind?: Affinities,
    bolt?: Affinities,
    dark?: Affinities,
    earth?: Affinities,
    ice?: Affinities,
    light?: Affinities,
    poison?: Affinities,
}

export interface NpcImmunities {
    slow: boolean
    dazed: boolean,
    weak: boolean,
    shaken: boolean,
    enraged: boolean,
    poisoned: boolean,
}

export interface NpcNotes {
    name: string,
    effect: string
}

export interface NpcTags {
    name: string,
}

export interface TypeNpc {
    id: string,
    uid: string,
    name: string,
    lvl: number,
    imgurl?: string,
    attacks: NpcAttack[],
    affinities: NpcAffinities,
    immunities: NpcImmunities,
    attributes: NpcAttributes,
    species: string,
    sizes?: string,
    traits?: string,
    actions?: NpcAction[],
    extra?: NpcExtra,
    rank?: string,
    spells?: NpcSpell[],
    special?: NpcSpecial[],
    weaponattacks?: NpcWeaponAttack[],
    description?: string,
    armor?: NpcArmor,
    sheild?: NpcArmor,
    raregear?: NpcRareGear[],
    label?: string,
    notes?: NpcNotes[],
    tags?: NpcTags[]
}