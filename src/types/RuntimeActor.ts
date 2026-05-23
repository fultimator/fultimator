import type { Affinities, ActorStatuses, Elements } from "./Misc";
import type { AppliedEffect } from "./Effects";

export type RuntimeActorSource = "npc" | "pc";

export type CooldownDuration = "until-next-turn" | "until-next-round";

export interface RuntimeActor {
  combatId: string;
  source: RuntimeActorSource;

  // resources
  currentHp: number;
  currentMp: number;

  // combat state
  isGuarding: boolean;
  statusEffects: ActorStatuses;
  temporaryAffinities: Partial<Record<Elements, Affinities>>;
  affinityLocks: Elements[];

  // combat-temporary effects applied to this actor
  appliedEffects: AppliedEffect[];

  // per-turn / per-encounter cooldowns keyed by skill fuid
  cooldowns: Record<string, CooldownDuration>;

  // generic per-encounter flags keyed by "<skillFuid>.<flagName>"
  flags: Record<string, unknown>;
}

export function createRuntimeActor(
  combatId: string,
  source: RuntimeActorSource,
  currentHp: number,
  currentMp: number,
): RuntimeActor {
  return {
    combatId,
    source,
    currentHp,
    currentMp,
    isGuarding: false,
    statusEffects: {
      slow: false,
      dazed: false,
      weak: false,
      shaken: false,
      enraged: false,
      poisoned: false,
    },
    temporaryAffinities: {},
    affinityLocks: [],
    appliedEffects: [],
    cooldowns: {},
    flags: {},
  };
}
