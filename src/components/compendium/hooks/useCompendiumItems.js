import { useMemo } from "react";
import classList, { spellList, spellsByClass } from "../../../libs/classes";
import { getDelicacyEffects } from "../../../libs/gourmetCookingData";
import { t as staticT } from "../../../translation/translate";
import {
  VIEWER_TO_PACK_TYPE,
  getItems,
  getItemSearchText,
  makeId,
  getNonStaticSpellItems,
} from "../../../libs/compendium";

// Pre-compute delicacy effects once at module load
const staticDelicacyEffects = getDelicacyEffects(staticT);

const normalizeWellspring = (value = "") => String(value).trim().toLowerCase();
const getItemWellspring = (item) =>
  item?.wellspring ?? item?.Wellspring ?? item?.category ?? "";

export function matchesPilotModuleType(item, moduleType) {
  const filter = String(moduleType || "").toLowerCase();
  if (!filter) return true;

  if (filter === "frame") {
    return (
      item?.pilotSubtype === "frame" ||
      String(item?.category || "").toLowerCase() === "frame" ||
      item?.passengers != null ||
      String(item?.name || "")
        .toLowerCase()
        .includes("pilot_frame_")
    );
  }

  const normalizedValues = [
    item?.type,
    item?.category,
    item?.name,
    item?.spellType,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const matchesFlatField = normalizedValues.some(
    (value) =>
      value === `pilot_module_${filter}` ||
      value.endsWith(`_${filter}`) ||
      value.includes(`module_${filter}`) ||
      value.includes(`${filter} module`),
  );
  if (matchesFlatField) return true;

  if (!Array.isArray(item?.modules) || item.modules.length === 0) return false;
  return item.modules.some((module) => {
    const moduleValues = [module?.type, module?.category, module?.name]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return moduleValues.some(
      (value) =>
        value === `pilot_module_${filter}` ||
        value.endsWith(`_${filter}`) ||
        value.includes(`module_${filter}`) ||
        value.includes(`${filter} module`),
    );
  });
}

export function matchesInvokerWellspring(item, wellspring) {
  const filter = normalizeWellspring(wellspring);
  if (!filter) return true;
  return normalizeWellspring(getItemWellspring(item)) === filter;
}

/**
 * Computes the filtered item list from the current filter state + pack data.
 *
 * Returns { filteredItems, itemIds, selectedItem }
 */
export function useCompendiumItems({ filters, activePack, selectedIdx }) {
  const {
    selectedType,
    selectedSpellClass,
    selectedModuleType,
    selectedMagichantSubtype,
    selectedWellspring,
    selectedBook,
    selectedQualityFilters,
    selectedQualityCategories,
    selectedHeroicClasses,
    selectedOptionalSubtypes,
    selectedEffectTransfer,
    selectedEffectApplicableTypes,
    searchQuery,
    isPilotClassSelected,
    isChanterClassSelected,
    isInvokerClassSelected,
  } = filters;

  const activeSpellCls = useMemo(() => {
    if (selectedType !== "player-spells" || !selectedSpellClass) return null;
    return classList.find((c) => c.name === selectedSpellClass) ?? null;
  }, [selectedType, selectedSpellClass]);

  const filteredItems = useMemo(() => {
    // ---- Pack mode ----
    if (activePack) {
      const packType = VIEWER_TO_PACK_TYPE[selectedType];
      let items = activePack.items
        .filter((i) => !packType || i.type === packType)
        .map((i) => ({ ...i.data, _packItemId: i.id }));

      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter(
          (item) =>
            item.filter &&
            selectedQualityFilters.some((f) => item.filter.includes(f)),
        );
      }
      if (
        selectedType === "qualities" &&
        selectedQualityCategories.length > 0
      ) {
        items = items.filter(
          (item) =>
            item.category && selectedQualityCategories.includes(item.category),
        );
      }
      if (selectedType === "classes" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }
      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) =>
          selectedBook.includes(item.meta?.book ?? item.book),
        );
      }
      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter(
          (item) =>
            item.applicableTo &&
            selectedHeroicClasses.some((c) => item.applicableTo.includes(c)),
        );
      }
      if (selectedType === "optionals" && selectedOptionalSubtypes.length > 0) {
        items = items.filter((item) =>
          selectedOptionalSubtypes.includes(item.subtype),
        );
      }
      if (selectedType === "effects" && selectedEffectTransfer !== "") {
        const wantTransfer = selectedEffectTransfer === "true";
        items = items.filter((item) => Boolean(item.transfer) === wantTransfer);
      }
      if (selectedType === "effects" && selectedEffectApplicableTypes.length > 0) {
        items = items.filter((item) =>
          Array.isArray(item.applicableTypes) &&
          selectedEffectApplicableTypes.some((t) => item.applicableTypes.includes(t)),
        );
      }
      if (selectedType === "player-spells" && selectedSpellClass) {
        const spellClasses = activeSpellCls?.benefits?.spellClasses ?? [];
        items = items.filter((item) => {
          if (
            spellClasses.includes("default") &&
            item.class === selectedSpellClass
          ) {
            return true;
          }
          return spellClasses.includes(item.spellType);
        });
      }
      if (
        selectedType === "player-spells" &&
        isPilotClassSelected &&
        selectedModuleType
      ) {
        items = items.filter((item) =>
          matchesPilotModuleType(item, selectedModuleType),
        );
      }
      if (
        selectedType === "player-spells" &&
        isChanterClassSelected &&
        selectedMagichantSubtype
      ) {
        items = items.filter((item) => {
          const isKey =
            item.magichantSubtype === "key" ||
            item.type ||
            item.status ||
            item.attribute ||
            item.recovery;
          return selectedMagichantSubtype === "key" ? isKey : !isKey;
        });
      }
      if (
        selectedType === "player-spells" &&
        isInvokerClassSelected &&
        selectedWellspring
      ) {
        items = items.filter((item) =>
          matchesInvokerWellspring(item, selectedWellspring),
        );
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter((item) => getItemSearchText(item).includes(q));
      }
      return items;
    }

    // ---- Official mode: non-player-spells ----
    if (selectedType !== "player-spells") {
      let items = getItems(selectedType);

      if (selectedType === "classes") {
        items = items.filter(
          (c) => c.name !== "Blank Class" && c.book !== "homebrew",
        );
        if (selectedBook.length > 0) {
          items = items.filter((item) => selectedBook.includes(item.book));
        }
      }
      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter(
          (item) =>
            item.filter &&
            selectedQualityFilters.some((f) => item.filter.includes(f)),
        );
      }
      if (
        selectedType === "qualities" &&
        selectedQualityCategories.length > 0
      ) {
        items = items.filter(
          (item) =>
            item.category && selectedQualityCategories.includes(item.category),
        );
      }
      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) =>
          selectedBook.includes(item.meta?.book ?? item.book),
        );
      }
      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter(
          (item) =>
            item.applicableTo &&
            selectedHeroicClasses.some((c) => item.applicableTo.includes(c)),
        );
      }
      if (selectedType === "optionals" && selectedOptionalSubtypes.length > 0) {
        items = items.filter((item) =>
          selectedOptionalSubtypes.includes(item.subtype),
        );
      }
      if (selectedType === "effects" && selectedEffectTransfer !== "") {
        const wantTransfer = selectedEffectTransfer === "true";
        items = items.filter((item) => Boolean(item.transfer) === wantTransfer);
      }
      if (selectedType === "effects" && selectedEffectApplicableTypes.length > 0) {
        items = items.filter((item) =>
          Array.isArray(item.applicableTypes) &&
          selectedEffectApplicableTypes.some((t) => item.applicableTypes.includes(t)),
        );
      }

      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase();
      return items.filter((item) => getItemSearchText(item).includes(q));
    }

    // ---- Official mode: player-spells ----
    let items;
    if (!activeSpellCls) {
      items = spellList;
    } else {
      const scs = activeSpellCls.benefits?.spellClasses ?? [];
      items = [];
      for (const sc of scs) {
        if (sc === "default") {
          items.push(...(spellsByClass[activeSpellCls.name] || []));
        } else if (sc === "cooking") {
          items.push(
            ...staticDelicacyEffects.map((eff) => ({
              name: `Delicacy #${eff.id}`,
              spellType: "cooking",
              ...eff,
            })),
          );
        } else {
          const nonStatic = getNonStaticSpellItems(sc);
          if (nonStatic) items.push(...nonStatic);
        }
      }
    }

    if (isPilotClassSelected && selectedModuleType) {
      items = items.filter((item) =>
        matchesPilotModuleType(item, selectedModuleType),
      );
    }
    if (isChanterClassSelected && selectedMagichantSubtype) {
      items = items.filter((item) => {
        const isKey =
          item.magichantSubtype === "key" ||
          item.type ||
          item.status ||
          item.attribute ||
          item.recovery;
        return selectedMagichantSubtype === "key" ? isKey : !isKey;
      });
    }
    if (isInvokerClassSelected && selectedWellspring) {
      items = items.filter((item) =>
        matchesInvokerWellspring(item, selectedWellspring),
      );
    }

    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      [item.name, item.class, item.spellType, item.wellspring]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [
    activePack,
    selectedType,
    searchQuery,
    activeSpellCls,
    selectedSpellClass,
    selectedQualityFilters,
    selectedQualityCategories,
    selectedBook,
    selectedHeroicClasses,
    selectedOptionalSubtypes,
    selectedEffectTransfer,
    selectedEffectApplicableTypes,
    isPilotClassSelected,
    isChanterClassSelected,
    isInvokerClassSelected,
    selectedModuleType,
    selectedMagichantSubtype,
    selectedWellspring,
  ]);

  const itemIds = useMemo(
    () => filteredItems.map((item, idx) => makeId(item.name, idx)),
    [filteredItems],
  );

  const selectedItem =
    selectedIdx !== null ? (filteredItems[selectedIdx] ?? null) : null;

  return { filteredItems, itemIds, selectedItem };
}
