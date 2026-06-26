import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Manages the 12 compendium filter states + their change handlers.
 *
 * Designed for modal / importer contexts (local useState).
 * The full-page route keeps its own URL-param state and passes values as props
 * to CompendiumBrowser - no hook needed there.
 *
 * Returns { filters, handlers, selectedIdx, setSelectedIdx, searchQuery, setSearchQuery }
 */
export function useCompendiumFilters({
  restrictToTypes,
  initialType = "weapons",
  initialSearchQuery = "",
  initialSpellClass = "",
  initialModuleType = "",
  initialMagichantSubtype = "",
  initialWellspring = "",
  initialBook = [],
  initialQualityFilters = [],
  initialQualityCategories = [],
  initialHeroicClasses = [],
  initialOptionalSubtypes = [],
  initialEffectTransfer = "",
  initialEffectApplicableTypes = [],
  initialCompendium = "official",
  // When open transitions false→true, reset all state to initial values
  open,
} = {}) {
  const [selectedType, setSelectedType] = useState(() => {
    if (restrictToTypes?.length) {
      return restrictToTypes.includes(initialType)
        ? initialType
        : restrictToTypes[0];
    }
    return initialType;
  });
  const [selectedSpellClass, setSelectedSpellClass] =
    useState(initialSpellClass);
  const [selectedModuleType, setSelectedModuleType] =
    useState(initialModuleType);
  const [selectedMagichantSubtype, setSelectedMagichantSubtype] = useState(
    initialMagichantSubtype === "key" || initialMagichantSubtype === "tone"
      ? initialMagichantSubtype
      : "",
  );
  const [selectedWellspring, setSelectedWellspring] =
    useState(initialWellspring);
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedQualityFilters, setSelectedQualityFilters] = useState(
    initialQualityFilters,
  );
  const [selectedQualityCategories, setSelectedQualityCategories] = useState(
    initialQualityCategories,
  );
  const [selectedHeroicClasses, setSelectedHeroicClasses] =
    useState(initialHeroicClasses);
  const [selectedOptionalSubtypes, setSelectedOptionalSubtypes] = useState(
    initialOptionalSubtypes,
  );
  const [selectedEffectTransfer, setSelectedEffectTransfer] = useState(
    initialEffectTransfer,
  );
  const [selectedEffectApplicableTypes, setSelectedEffectApplicableTypes] =
    useState(initialEffectApplicableTypes);
  const [selectedCompendium, setSelectedCompendium] =
    useState(initialCompendium);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const resetDone = useRef(false);

  // Reset state when modal opens (open: false → true)
  useEffect(() => {
    if (open === undefined) return; // not a modal context
    if (open && !resetDone.current) {
      resetDone.current = true;
      const resolvedType = restrictToTypes?.length
        ? restrictToTypes.includes(initialType)
          ? initialType
          : restrictToTypes[0]
        : initialType;
      setSelectedType(resolvedType);
      setSearchQuery(initialSearchQuery);
      setSelectedIdx(null);
      setSelectedSpellClass(initialSpellClass);
      setSelectedModuleType(initialModuleType);
      setSelectedMagichantSubtype(
        initialMagichantSubtype === "key" || initialMagichantSubtype === "tone"
          ? initialMagichantSubtype
          : "",
      );
      setSelectedWellspring(initialWellspring);
      setSelectedBook(initialBook);
      setSelectedQualityFilters(initialQualityFilters);
      setSelectedQualityCategories(initialQualityCategories);
      setSelectedHeroicClasses(initialHeroicClasses);
      setSelectedOptionalSubtypes(initialOptionalSubtypes);
      setSelectedEffectTransfer(initialEffectTransfer);
      setSelectedEffectApplicableTypes(initialEffectApplicableTypes);
    } else if (!open) {
      resetDone.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Sync compendium when initialCompendium prop changes (e.g. modal receives new prop while open)
  useEffect(() => {
    if (open) setSelectedCompendium(initialCompendium);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedSpellClassKey = String(selectedSpellClass).trim().toLowerCase();
  const isPilotClassSelected = selectedSpellClassKey === "pilot";
  const isChanterClassSelected = selectedSpellClassKey === "chanter";
  const isInvokerClassSelected = selectedSpellClassKey === "invoker";
  // Handlers - each resets search + selection and optionally scrolls

  const handleTypeChange = useCallback(
    (type, { scrollRef } = {}) => {
      if (restrictToTypes?.length && !restrictToTypes.includes(type)) return;
      setSelectedType(type);
      setSearchQuery("");
      setSelectedIdx(null);
      if (type !== "player-spells") {
        setSelectedModuleType("");
        setSelectedMagichantSubtype("");
        setSelectedWellspring("");
      }
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [restrictToTypes],
  );

  const handleSpellClassChange = useCallback((cls, { scrollRef } = {}) => {
    setSelectedSpellClass(cls);
    const classKey = String(cls).trim().toLowerCase();
    if (classKey !== "pilot") setSelectedModuleType("");
    if (classKey !== "chanter") setSelectedMagichantSubtype("");
    if (classKey !== "invoker") setSelectedWellspring("");
    setSearchQuery("");
    setSelectedIdx(null);
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
  }, []);

  const handleModuleTypeChange = useCallback(
    (moduleType, { scrollRef } = {}) => {
      setSelectedModuleType(moduleType);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleMagichantSubtypeChange = useCallback(
    (subtype, { scrollRef } = {}) => {
      const safe = subtype === "key" || subtype === "tone" ? subtype : "";
      setSelectedMagichantSubtype(safe);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleWellspringChange = useCallback(
    (wellspring, { scrollRef } = {}) => {
      setSelectedWellspring(wellspring);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleBookChange = useCallback((books, { scrollRef } = {}) => {
    setSelectedBook(books);
    setSearchQuery("");
    setSelectedIdx(null);
    if (scrollRef?.current) scrollRef.current.scrollTop = 0;
  }, []);

  const handleQualityFiltersChange = useCallback(
    (filters, { scrollRef } = {}) => {
      setSelectedQualityFilters(filters);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleQualityCategoriesChange = useCallback(
    (categories, { scrollRef } = {}) => {
      setSelectedQualityCategories(categories);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleHeroicClassesChange = useCallback(
    (classes, { scrollRef } = {}) => {
      setSelectedHeroicClasses(classes);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleOptionalSubtypesChange = useCallback(
    (subtypes, { scrollRef } = {}) => {
      setSelectedOptionalSubtypes(subtypes);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleEffectTransferChange = useCallback(
    (value, { scrollRef } = {}) => {
      setSelectedEffectTransfer(value);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleEffectApplicableTypesChange = useCallback(
    (types, { scrollRef } = {}) => {
      setSelectedEffectApplicableTypes(types);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleCompendiumChange = useCallback(
    (compendium, { onManageModules, scrollRef } = {}) => {
      if (compendium === "__manage_modules__") {
        onManageModules?.();
        return;
      }
      setSelectedCompendium(compendium);
      setSearchQuery("");
      setSelectedIdx(null);
      if (scrollRef?.current) scrollRef.current.scrollTop = 0;
    },
    [],
  );

  const handleItemClick = useCallback(
    (item, idx, { isDesktop, setDrawerOpen } = {}) => {
      setSelectedIdx(idx);
      if (!isDesktop && setDrawerOpen) setDrawerOpen(false);
    },
    [],
  );

  return {
    filters: {
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
      selectedCompendium,
      searchQuery,
      isPilotClassSelected,
      isChanterClassSelected,
      isInvokerClassSelected,
    },
    handlers: {
      handleTypeChange,
      handleSpellClassChange,
      handleModuleTypeChange,
      handleMagichantSubtypeChange,
      handleWellspringChange,
      handleBookChange,
      handleQualityFiltersChange,
      handleQualityCategoriesChange,
      handleHeroicClassesChange,
      handleOptionalSubtypesChange,
      handleEffectTransferChange,
      handleEffectApplicableTypesChange,
      handleCompendiumChange,
      handleItemClick,
    },
    selectedIdx,
    setSelectedIdx,
    searchQuery,
    setSearchQuery,
  };
}
