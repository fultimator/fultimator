// Accessors for persisted ActorBonuses / ActorMultipliers with legacy fallbacks.

import {
  zeroActorBonuses,
  oneActorMultipliers,
  type ActorBonuses,
  type ActorMultipliers,
} from "../types/Bonuses";

export function getActorBonuses(actor: {
  bonuses?: ActorBonuses;
}): ActorBonuses {
  return actor.bonuses ?? zeroActorBonuses();
}

export function getActorMultipliers(actor: {
  multipliers?: ActorMultipliers;
}): ActorMultipliers {
  return actor.multipliers ?? oneActorMultipliers();
}
