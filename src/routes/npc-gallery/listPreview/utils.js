export const PAGE_SIZE = 100;
const SCROLL_SETTLE_MS = 900;

export function scrollToCardId(id) {
  const el = document.querySelector(`[data-npc-id="${id}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(
    () => el.scrollIntoView({ behavior: "instant", block: "start" }),
    SCROLL_SETTLE_MS,
  );
}

export const formatRank = (rank) => {
  if (!rank) return "Soldier";
  if (rank.startsWith("champion")) return `Champion ${rank.slice(8)}`.trim();
  return rank.charAt(0).toUpperCase() + rank.slice(1);
};

export function sortItems(items, sortModel) {
  if (!sortModel.length) return items;
  const { field, sort } = sortModel[0];
  const direction = sort === "desc" ? -1 : 1;
  const valueOf = (npc) =>
    field === "rank" ? formatRank(npc.rank) : npc[field];
  return [...items].sort((a, b) => {
    const [va, vb] = [valueOf(a), valueOf(b)];
    const result =
      typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va ?? "").localeCompare(String(vb ?? ""), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    return result * direction;
  });
}
