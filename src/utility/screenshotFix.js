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

/**
 * Expands compact PC header description area in the cloned DOM so exports
 * preserve more text and avoid clipped description blocks.
 *
 * @param {HTMLElement} originalRoot
 * @param {Document} clonedDoc
 */
export const expandCompactHeaderForExport = (originalRoot, clonedDoc) => {
  if (!clonedDoc || !originalRoot) return;
  const clonedRoot = clonedDoc.getElementById(originalRoot.id);
  if (!clonedRoot) return;

  const body = clonedRoot.querySelector('[data-pc-compact-header-body="true"]');
  if (body) {
    // Keep compact, predictable header proportions in export.
    body.style.setProperty("height", "228px", "important");
    body.style.setProperty("max-height", "228px", "important");
    body.style.setProperty("min-height", "228px", "important");
    body.style.setProperty("align-items", "stretch", "important");
  }

  const wrap = clonedRoot.querySelector(
    '[data-pc-compact-description-wrap="true"]',
  );
  if (wrap) {
    wrap.style.setProperty("overflow", "visible", "important");
    wrap.style.setProperty("flex", "1 1 auto", "important");
  }

  const text = clonedRoot.querySelector(
    '[data-pc-compact-description-text="true"]',
  );
  if (text) {
    // Allow enough description, but preserve space for traits.
    text.style.setProperty("overflow", "hidden", "important");
    text.style.setProperty("display", "-webkit-box", "important");
    text.style.setProperty("-webkit-box-orient", "vertical", "important");
    text.style.setProperty("-webkit-line-clamp", "6", "important");
  }

  const paragraphs = clonedRoot.querySelectorAll(
    '[data-pc-compact-description-text="true"] p',
  );
  paragraphs.forEach((p) => {
    p.style.setProperty("display", "block", "important");
    p.style.setProperty("overflow", "visible", "important");
    p.style.removeProperty("-webkit-line-clamp");
    p.style.removeProperty("-webkit-box-orient");
  });

  const traits = clonedRoot.querySelector(
    '[data-pc-compact-traits-wrap="true"]',
  );
  if (traits) {
    traits.style.setProperty("display", "flex", "important");
    traits.style.setProperty("align-items", "center", "important");
    traits.style.setProperty("overflow", "hidden", "important");
    traits.style.setProperty("min-height", "84px", "important");
    traits.style.setProperty("flex", "0 0 auto", "important");
  }
};

/**
 * Forces all MUI Accordion / Collapse panels to fully expand in the cloned DOM
 *
 * @param {HTMLElement} originalRoot
 * @param {Document} clonedDoc
 */
export const expandAccordionsForExport = (originalRoot, clonedDoc) => {
  if (!clonedDoc || !originalRoot) return;
  const clonedRoot = clonedDoc.getElementById(originalRoot.id);
  if (!clonedRoot) return;

  // MUI emotion sets height/visibility as inline styles; !important overrides beat them.
  clonedRoot
    .querySelectorAll(".MuiCollapse-root, .MuiCollapse-hidden")
    .forEach((el) => {
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("min-height", "0", "important");
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("visibility", "visible", "important");
      el.style.setProperty("display", "block", "important");
    });

  clonedRoot
    .querySelectorAll(".MuiCollapse-wrapper, .MuiCollapse-wrapperInner")
    .forEach((el) => {
      el.style.setProperty("height", "auto", "important");
      el.style.setProperty("overflow", "visible", "important");
      el.style.setProperty("visibility", "visible", "important");
    });
};

/**
 * Adjusts the cloned DOM for print/export mode by hiding edit controls and
 * forcing a white background.
 *
 * @param {Document} clonedDoc
 * @param {string} rootId
 */
export const hideEditControlsInClone = (clonedDoc, rootId) => {
  if (!clonedDoc) return;
  const root = clonedDoc.getElementById(rootId);
  if (!root) return;
  const hide = (el) => el.style.setProperty("display", "none", "important");
  root.querySelectorAll("[data-edit-control]").forEach(hide);
  const actionBar = clonedDoc.getElementById("sheet-action-bar");
  if (actionBar) hide(actionBar);
};

export const applyPrintModeToClone = (clonedDoc, rootId) => {
  if (!clonedDoc) return;
  const root = clonedDoc.getElementById(rootId);
  if (!root) return;

  hideEditControlsInClone(clonedDoc, rootId);

  root.style.backgroundColor = "#ffffff";
  root.querySelectorAll(".MuiPaper-root").forEach((el) => {
    el.style.backgroundColor = "#ffffff";
  });
};
