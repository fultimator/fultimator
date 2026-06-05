import { invocationsByWellspring } from "./spellOptionData";

export function buildInvokerAvailableInvocations(skillLevel, customInvocations = []) {
  const availableTypes = [];
  switch (Number(skillLevel) || 1) {
    case 1:
      availableTypes.push("Blast");
      break;
    case 2:
      availableTypes.push("Blast", "Hex");
      break;
    case 3:
      availableTypes.push("Blast", "Hex", "Utility");
      break;
    default:
      return [];
  }

  const hardcoded = [];
  Object.entries(invocationsByWellspring).forEach(([wellspring, invs]) => {
    invs.forEach((inv) => {
      if (availableTypes.includes(inv.type)) {
        hardcoded.push({ ...inv, wellspring, isCustom: false });
      }
    });
  });

  const custom = (customInvocations || [])
    .filter((inv) => inv.wellspring && inv.key && availableTypes.includes(inv.type))
    .map((inv) => ({ ...inv, name: inv.customName || inv.key, isCustom: true }));

  return [...hardcoded, ...custom];
}
