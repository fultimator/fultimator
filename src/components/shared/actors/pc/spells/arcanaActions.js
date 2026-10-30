export const ARCANA_POLICY_KEY = "arcanist";

export function isArcanaRework(arcana) {
  return arcana?.spellType === "arcanist-rework";
}

export function getArcanaStageDetails(arcana, stage, t) {
  const rework = isArcanaRework(arcana);

  if (stage === "pulse") {
    return {
      label: arcana?.pulse || t("PULSE"),
      tag: t("PULSE"),
      itemType: "skill",
      description: arcana?.pulseDesc || t("No Pulse Benefit"),
    };
  }

  if (stage === "dismiss") {
    return {
      label: arcana?.dismiss || t("DISMISS"),
      tag: t("DISMISS"),
      description: arcana?.dismissDesc || t("No Dismiss Benefit"),
    };
  }

  return {
    label: arcana?.merge || t("MERGE"),
    tag: t("MERGE"),
    itemType: "spell",
    description: rework
      ? arcana?.mergeDesc || t("No Merge Benefit")
      : arcana?.mergeDesc || t("No Merge Benefit"),
    cost: rework ? { resource: "mp", amount: 30 } : undefined,
  };
}

export function getArcanaStepperStage(arcanaStage, enabled, rework) {
  if (!enabled) return -1;
  if (!rework) return 0;
  if (arcanaStage === "pulse") return 1;
  if (arcanaStage === "dismiss") return 2;
  return 0;
}
