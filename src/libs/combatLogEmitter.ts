import type {
  ChatMessage,
  CombatLogEvent,
} from "../components/app-drawer/panels/chat/types";
import type { ExecuteActionResult } from "../pipelines/actionExecutor";

type CombatSimSettings = Record<string, boolean | number | string | unknown>;

// Maps CombatLogEvent.type to the combatSimSettings key that gates it.
// Returns null for event types that are always emitted.
function settingsKeyForEvent(type: CombatLogEvent["type"]): string | null {
  switch (type) {
    case "encounter-renamed":
      return "logEncounterNameUpdated";
    case "turn-checked":
      return "logTurnChecked";
    case "actor-added":
      return "logNpcAdded";
    case "actor-removed":
      return "logNpcRemoved";
    case "fainted":
      return "logNpcFainted";
    case "heal":
      return "logNpcHeal";
    case "expenditure":
      return "logNpcUsedMp";
    case "resource-loss":
      return "logNpcUsedMp";
    case "ultima-used":
      return "logUsedUltimaPoint";
    case "accuracy-check":
      return "logAttack";
    case "generic-roll":
      return "logStandardRoll";
    case "spell-use":
      return "logSpellUse";
    case "magic-check":
      return "logSpellOffensiveRoll";
    case "crit-success":
      return "logCritSuccess";
    case "crit-failure":
      return "logCritFailure";
    case "status-added":
      return "logStatusEffectAdded";
    case "status-removed":
      return "logStatusEffectRemoved";
    case "clock-added":
      return "logClockAdded";
    case "clock-removed":
      return "logClockRemoved";
    case "clock-reset":
      return "logClockReset";
    case "clock-updated":
      return "logClockUpdate";
    case "clock-state":
      return "logClockCurrentState";
    case "text":
      return null;
    default:
      return null;
  }
}

function settingsKeyForDamage(damageType: string): string {
  return damageType && damageType !== "untyped"
    ? "logNpcDamage"
    : "logNpcDamageNoType";
}

function settingsKeyForRoundChange(direction: "up" | "down" | "new"): string {
  if (direction === "new") return "logNewRound";
  if (direction === "up") return "logRoundIncrease";
  return "logRoundDecrease";
}

function shouldEmit(
  event: CombatLogEvent,
  settings: CombatSimSettings,
): boolean {
  let key: string | null;

  if (event.type === "damage") {
    key = settingsKeyForDamage(event.damageType);
  } else if (event.type === "round-change") {
    key = settingsKeyForRoundChange(event.direction);
  } else {
    key = settingsKeyForEvent(event.type);
  }

  if (key === null) return true;
  const val = settings[key];
  return val !== false;
}

export function emitCombatLog(
  event: CombatLogEvent,
  settings: CombatSimSettings,
  addMessage: (m: ChatMessage) => void,
  encounterId: string,
): void {
  if (!shouldEmit(event, settings)) return;
  addMessage({
    kind: "log",
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    channelId: `encounter:${encounterId}`,
    event,
  });
}

export function combatLogFromActionResult(
  result: ExecuteActionResult,
  actorName: string,
  idToName: Record<string, string>,
): CombatLogEvent[] {
  const events: CombatLogEvent[] = [];
  const { ctx, primaryOutcomes, afterEffectsResult } = result;

  // Cost expenditures (mp/ip/fp spent by the acting actor)
  for (const ev of ctx.events) {
    if (ev.kind === "expenditure") {
      events.push({
        type: "expenditure",
        actorName,
        amount: ev.amount,
        resource: ev.resource,
      });
    }
  }

  // Primary outcome - one log event per target
  if (primaryOutcomes) {
    for (const [targetId, outcome] of primaryOutcomes.perTarget) {
      const targetName = idToName[targetId] ?? targetId;

      if (outcome.kind === "damage") {
        const dmgEv = ctx.events.find(
          (e) => e.kind === "damage" && e.resource === "hp",
        ) as { damageType?: string } | undefined;
        events.push({
          type: "damage",
          actorName,
          targetName,
          amount: outcome.resolvedAmount,
          damageType: dmgEv?.damageType ?? "untyped",
        });
      } else if (outcome.kind === "resource-recovery") {
        events.push({
          type: "heal",
          actorName,
          targetName,
          amount: outcome.resolvedAmount,
          resource: (outcome.resource ?? "hp") as "hp" | "mp" | "ip",
        });
      } else if (
        outcome.kind === "resource-loss" &&
        outcome.resource !== "hp"
      ) {
        events.push({
          type: "resource-loss",
          actorName,
          targetName,
          amount: outcome.resolvedAmount,
          resource: outcome.resource as "mp" | "ip",
        });
      }
    }
  }

  // After-effects - one log event per resolved entry
  if (afterEffectsResult) {
    for (const ae of afterEffectsResult.resolved) {
      const targetName = idToName[ae.targetId] ?? ae.targetId;

      if (ae.direction === "recovery") {
        events.push({
          type: "heal",
          actorName,
          targetName,
          amount: ae.resolvedAmount,
          resource: ae.resource as "hp" | "mp" | "ip",
        });
      } else if (ae.resource === "hp") {
        events.push({
          type: "damage",
          actorName,
          targetName,
          amount: ae.resolvedAmount,
          damageType: "untyped",
        });
      } else {
        events.push({
          type: "resource-loss",
          actorName,
          targetName,
          amount: ae.resolvedAmount,
          resource: ae.resource as "mp" | "ip",
        });
      }
    }
  }

  return events;
}

export function buildIdToNameMap(
  actors: { combatId?: string; name?: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const a of actors) {
    if (a.combatId && a.name) map[String(a.combatId)] = String(a.name);
  }
  return map;
}
