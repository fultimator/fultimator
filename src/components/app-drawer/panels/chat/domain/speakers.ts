import { useMemo } from "react";
import { useLocation } from "react-router";
import { useDatabase } from "../../../../../hooks/useDatabase";
import { useCombatEncounterStore } from "../../../../../stores/combatEncounterStore";
import { DEFAULT_SPEAKER } from "../constants";
import type { Attribute } from "../types";

const ATTRIBUTE_KEY: Record<Attribute, string> = {
  mig: "might",
  ins: "insight",
  wlp: "will",
  dex: "dexterity",
};

export const resolveAttributeDie = (
  playerDoc: Record<string, unknown> | null,
  attribute: Attribute,
): number => {
  const attrs =
    playerDoc &&
    typeof playerDoc.attributes === "object" &&
    playerDoc.attributes
      ? (playerDoc.attributes as Record<string, unknown>)
      : null;
  const val = attrs?.[ATTRIBUTE_KEY[attribute]];
  return typeof val === "number" && val > 0 ? val : 8;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const resolveSpeakerOptions = (contextActorName: string): string[] => [
  DEFAULT_SPEAKER,
  ...(contextActorName ? [contextActorName] : []),
];

type ActorEntry = { name: string; doc: Record<string, unknown> };

export const useCombatSimActors = (): ActorEntry[] => {
  const { selectedNPCs, selectedPCs } = useCombatEncounterStore();

  return useMemo(() => {
    return [...selectedNPCs, ...selectedPCs]
      .filter((a) => typeof a.name === "string" && a.name)
      .map((a) => ({ name: a.name as string, doc: a }));
  }, [selectedNPCs, selectedPCs]);
};

export const useRouteActor = (): {
  playerDoc: Record<string, unknown> | null;
  npcDoc: Record<string, unknown> | null;
} => {
  const location = useLocation();
  const localDb = useDatabase("local");
  const cloudDb = useDatabase("cloud");

  const playerIdMatch = location.pathname.match(/^\/player-edit\/([^/]+)$/);
  const npcIdMatch = location.pathname.match(/^\/npc-gallery\/([^/]+)$/);
  const playerId = playerIdMatch?.[1] ?? "";
  const npcId = npcIdMatch?.[1] ?? "";
  const isLocalPlayer = UUID_RE.test(playerId);
  const isLocalNpc = UUID_RE.test(npcId);

  // Only open the one relevant listener, null skips the Firestore subscription entirely.
  const localPlayerRef = isLocalPlayer
    ? localDb.doc("player-personal", playerId)
    : null;
  const cloudPlayerRef =
    !isLocalPlayer && playerId
      ? cloudDb.doc("player-personal", playerId)
      : null;
  const localNpcRef = isLocalNpc ? localDb.doc("npc-personal", npcId) : null;
  const cloudNpcRef =
    !isLocalNpc && npcId ? cloudDb.doc("npc-personal", npcId) : null;

  const [localPlayerDoc] = localDb.useDocumentData(localPlayerRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];
  const [cloudPlayerDoc] = cloudDb.useDocumentData(cloudPlayerRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];
  const [localNpcDoc] = localDb.useDocumentData(localNpcRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];
  const [cloudNpcDoc] = cloudDb.useDocumentData(cloudNpcRef) as [
    Record<string, unknown> | null,
    boolean,
    unknown,
  ];

  return {
    playerDoc: localPlayerDoc ?? cloudPlayerDoc ?? null,
    npcDoc: localNpcDoc ?? cloudNpcDoc ?? null,
  };
};

export const useActorName = (
  playerDoc: Record<string, unknown> | null,
  npcDoc: Record<string, unknown> | null,
): string => {
  return useMemo(() => {
    const playerInfo =
      playerDoc && typeof playerDoc.info === "object" && playerDoc.info
        ? (playerDoc.info as Record<string, unknown>)
        : null;
    return (
      (playerInfo?.name as string | undefined) ||
      (playerDoc?.name as string | undefined) ||
      (npcDoc?.name as string | undefined) ||
      ""
    );
  }, [playerDoc, npcDoc]);
};
