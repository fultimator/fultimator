import type { NpcAffinities, NpcImmunities } from "../../../../types/Npcs";
import { Affinities } from "../../../../types/Misc";

interface SpeciesEffect {
  affinities: NpcAffinities;
  immunities: Partial<NpcImmunities>;
}

const BLANK_IMMUNITIES: NpcImmunities = {
  slow: false,
  dazed: false,
  weak: false,
  shaken: false,
  enraged: false,
  poisoned: false,
};

const BLANK_AFFINITIES: NpcAffinities = {
  physical: Affinities.None,
  air: Affinities.None,
  bolt: Affinities.None,
  dark: Affinities.None,
  earth: Affinities.None,
  fire: Affinities.None,
  ice: Affinities.None,
  light: Affinities.None,
  poison: Affinities.None,
};

const SPECIES_EFFECTS: Record<string, SpeciesEffect> = {
  Construct: {
    affinities: {
      ...BLANK_AFFINITIES,
      poison: Affinities.Immunity,
      earth: Affinities.Resistance,
    },
    immunities: { poisoned: true },
  },
  Elemental: {
    affinities: { ...BLANK_AFFINITIES, poison: Affinities.Immunity },
    immunities: { poisoned: true },
  },
  Plant: {
    affinities: { ...BLANK_AFFINITIES },
    immunities: { dazed: true, shaken: true, enraged: true },
  },
  Undead: {
    affinities: {
      ...BLANK_AFFINITIES,
      dark: Affinities.Immunity,
      poison: Affinities.Immunity,
      light: Affinities.Vulnerability,
    },
    immunities: { poisoned: true },
  },
};

export function getSpeciesEffect(species: string): SpeciesEffect {
  return (
    SPECIES_EFFECTS[species] ?? {
      affinities: { ...BLANK_AFFINITIES },
      immunities: {},
    }
  );
}

export function applySpeciesEffects(species: string): {
  affinities: NpcAffinities;
  immunities: NpcImmunities;
} {
  const effect = getSpeciesEffect(species);
  return {
    affinities: effect.affinities,
    immunities: { ...BLANK_IMMUNITIES, ...effect.immunities },
  };
}

export function getFreeImmunities(species: string): Partial<NpcImmunities> {
  return getSpeciesEffect(species).immunities;
}
