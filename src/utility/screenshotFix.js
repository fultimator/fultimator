/**
 * Fixes vertical text orientation issues for html2canvas.
 * it finds elements with 'writing-mode: vertical-*' and replaces them with
 * a horizontal container + a rotated inner wrapper to ensure correct rendering
 * in the screenshot.
 *
 * @param {HTMLElement} originalRoot - The original element being captured.
 * @param {Document} clonedDoc - The cloned document from html2canvas onclone callback.
 */
export const fixVerticalLabels = (originalRoot, clonedDoc) => {
  if (!clonedDoc) return;
  const clonedRoot = clonedDoc.getElementById(originalRoot.id);
  if (!clonedRoot) return;

  // Target Typography components which are the primary users of vertical writing mode
  const originalTypos = originalRoot.querySelectorAll(".MuiTypography-root");
  const clonedTypos = clonedRoot.querySelectorAll(".MuiTypography-root");

  originalTypos.forEach((orgEl, i) => {
    const style = window.getComputedStyle(orgEl);
    if (style.writingMode && style.writingMode.includes("vertical")) {
      const clonedEl = clonedTypos[i];
      if (clonedEl) {
        const rect = orgEl.getBoundingClientRect();
        const content = clonedEl.innerHTML;

        // Force the cloned container to be horizontal but lock it to original physical dimensions
        clonedEl.style.setProperty(
          "writing-mode",
          "horizontal-tb",
          "important",
        );
        clonedEl.style.setProperty("display", "flex", "important");
        clonedEl.style.setProperty("align-items", "center", "important");
        clonedEl.style.setProperty("justify-content", "center", "important");
        clonedEl.style.setProperty("width", rect.width + "px", "important");
        clonedEl.style.setProperty("height", rect.height + "px", "important");
        clonedEl.style.setProperty("transform", "none", "important");
        clonedEl.style.setProperty("padding", "0", "important");
        clonedEl.style.setProperty("margin", style.margin, "important");

        // Rotated inner wrapper.
        // Swap width/height so that when rotated 90deg it fits the vertical space.
        clonedEl.innerHTML = `<div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${rect.height}px;
          height: ${rect.width}px;
          transform: rotate(-90deg);
          transform-origin: center;
          white-space: nowrap;
        ">${content}</div>`;
      }
    }
  });
};
