import { Affinities } from "./Misc";

export interface Bonds {
    name: string,
    admiration: boolean,
    loyality: boolean,
    affection: boolean,
    inferiority: boolean,
    mistrust: boolean,
    hatred: boolean
}

export interface PlayerInfo {
    pronouns: string,
    identity: string,
    theme: string,
    origin: string,
    bonds: Bonds[],
    description: string,
    fabulapoints: number,
    exp: number,
    zenit: number,
    imgurl: string
}

export interface PlayerAttributes {
    might: number,
    insight: number,
    will: number,
    dexterity: number
}

export interface StatValues {
    base: number,
    current: number
}

export interface PlayerStats {
    hp: StatValues,
    mp: StatValues,
    ip: StatValues
}

export interface PlayerStatuses {
    slow: boolean,
    dazed: boolean,
    enraged: boolean,
    weak: boolean,
    shaken: boolean,
    poisoned: boolean
}

export interface PlayerImmunities {
    slow: boolean
    dazed: boolean,
    weak: boolean,
    shaken: boolean,
    enraged: boolean,
    poisoned: boolean,
}

export interface PlayerAffinities {
    physical: Affinities,
    wind: Affinities,
    bolt: Affinities,
    dark: Affinities,
    earth: Affinities,
    fire: Affinities,
    ice: Affinities,
    light: Affinities,
    poison: Affinities
}

export interface OtherBenefits {
    description: string
}

export interface Benefits {
    hpplus: number,
    mpplus: number,
    ipplus: number,
    other: OtherBenefits[]
}

export interface Skills {
    name: string,
    description: string,
    currentSL: number,
    maxSL: number
}

export interface HeroicSkills {
    name: string,
    description: string
}

export interface Spells {
    name: string,
    class: string,
    duration: string,
    isOffensive: boolean,
    mpCostTarget: number,
    maxTargets: number,
    targetDescription: string,
    attr1: string,
    attr2: string,
    effect1: string,
    effect2: string,
    effect3: string,
    effect4: string,
    effect5: string,
    effect6: string
}

export interface PlayerClass {
    name: string,
    lvl: number,
    benefits: Benefits,
    skills: Skills[],
    heroic: HeroicSkills[],
    spells: Spells[]
}

export interface Weapons {
    name: string,
    quality: string,
    value: number,
    isRanged: boolean,
    isTwoHand: boolean,
    isMartial: boolean,
    isExtraPrec: boolean,
    isExtraDmg: boolean,
    isCustom: boolean,
    attr1: string,
    attr2: string,
    prec: number,
    dmg: number,
    isEquipped: boolean
}

export interface Shields {
    name: string,
    quality: string,
    value: number,
    isMartial: boolean,
    def: number,
    mdef: number,
    init: number,
    isEquipped: boolean
}

export interface Accessories {
    name: string,
    quality: string,
    value: number,
    isEquipped: boolean
}

export interface Armor {
    name: string,
    quality: string,
    value: number,
    isMartial: boolean,
    def: number,
    mdef: number,
    init: number,
    isEquipped: boolean
}

export interface PlayerEquipment {
    weapons: Weapons[],
    shields: Shields[],
    accessories: Accessories[],
    armor: Armor[]
}

export interface Martials {
    armor: boolean,
    shields: boolean,
    melee: boolean,
    ranged: boolean
}

export interface Rituals {
    ritualism: boolean,
    arcanism: boolean,
    chimerism: boolean,
    elementalism: boolean,
    entropism: boolean,
    spiritism: boolean
}

export interface PlayerItems {
    name: string,
    description: string,
    value: number,
    quantity: number
}

export interface PlayerConsumables {
    name: string,
    description: string,
    ipCost: number
}

export interface PlayerNotes {
    name: string,
    description: string
}

export interface TypePlayer {
    id: string,
    uid: string,
    name: string,
    lvl: number,
    info: PlayerInfo,
    attributes: PlayerAttributes,
    stats: PlayerStats,
    statuses: PlayerStatuses,
    immunities: PlayerImmunities,
    affinities: PlayerAffinities,
    classes: PlayerClass[],
    equipment: PlayerEquipment[],
    martials: Martials,
    rituals: Rituals,
    items: PlayerItems[],
    consumables: PlayerConsumables[],
    notes: PlayerNotes[]
}