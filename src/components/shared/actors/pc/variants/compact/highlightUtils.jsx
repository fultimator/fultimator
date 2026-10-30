export { highlightMatch } from "/src/components/shared/actors/core-utils";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmed = query?.trim();
  if (!trimmed) return source;
  const safe = escapeRegExp(trimmed);
  return source.replace(new RegExp(`(${safe})`, "ig"), "<mark>$1</mark>");
}
