export function usedSlots(slotted, hoplospheres) {
  return (slotted ?? []).reduce((acc, id) => {
    const hoplo = (hoplospheres ?? []).find((h) => h.id === id);
    return acc + (hoplo?.requiredSlots ?? 1);
  }, 0);
}
