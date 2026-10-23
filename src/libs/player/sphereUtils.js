export function usedSlots(slotted, hoplospheres) {
  return (slotted ?? []).reduce((acc, id) => {
    const hoplo = (hoplospheres ?? []).find((h) => h.id === id);
    return acc + (hoplo?.requiredSlots ?? 1);
  }, 0);
}

export function getIntegratedMnemoLimit(lvl) {
  return 1 + Math.floor((lvl ?? 1) / 15);
}
