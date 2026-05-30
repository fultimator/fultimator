import { invocationsByWellspring } from "./spellOptionData";

export function buildInvokerAvailableInvocations(skillLevel) {
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

  const invocations = [];
  Object.entries(invocationsByWellspring).forEach(([wellspring, invs]) => {
    invs.forEach((inv) => {
      if (availableTypes.includes(inv.type)) {
        invocations.push({ ...inv, wellspring });
      }
    });
  });
  return invocations;
}
