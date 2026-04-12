import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  IconButton,
  Divider,
  Typography,
  Tooltip,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import IosShareIcon from "@mui/icons-material/IosShare";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslate, t as staticT } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import {
  CompendiumSidebar,
  ItemCard,
  ITEM_TYPES,
  VIEWER_TO_PACK_TYPE,
  getItems,
  getItemSearchText,
  makeId,
  getNonStaticSpellItems,
} from "../../routes/compendium/compendium";
import AddToCompendiumButton from "./AddToCompendiumButton";
import Export from "../Export";
import CompendiumItemCreateDialog from "./CompendiumItemCreateDialog";
import QuickCreateModal from "./QuickCreateModal";
import { ManageModulesModal } from "../manage-modules";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import classList, { spellList } from "../../libs/classes";
import { getDelicacyEffects } from "../../libs/gourmetCookingData";
import useDownloadImage from "../../hooks/useDownloadImage";

const NPC_TYPES    = ["spells", "attacks", "special", "actions"];
const PLAYER_TYPES = ["weapons", "armor", "shields", "custom-weapons", "accessories", "player-spells", "qualities", "classes", "heroics"];

const SIDEBAR_WIDTH = 300;

const CompendiumViewerModal = ({ open, onClose, onAddItem, initialType = "spells", context, restrictToTypes, viewOnly = false, initialOptionalSubtypes = [], initialSpellClass = "", initialSearchQuery = "", initialModuleTypeFilter = "" }) => {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Viewer state (local instead of URL params)
  const [selectedType, setSelectedType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [selectedCompendium, setSelectedCompendium] = useState("official");
  const [selectedSpellClass, setSelectedSpellClass] = useState(initialSpellClass);
  const [selectedModuleType, setSelectedModuleType] = useState(initialModuleTypeFilter);
  const [selectedMagichantSubtype, setSelectedMagichantSubtype] = useState("");
  const [selectedBook, setSelectedBook] = useState([]);
  const [selectedQualityFilters, setSelectedQualityFilters] = useState([]);
  const [selectedQualityCategories, setSelectedQualityCategories] = useState([]);
  const [selectedHeroicClasses, setSelectedHeroicClasses] = useState([]);
  const [selectedOptionalSubtypes, setSelectedOptionalSubtypes] = useState(initialOptionalSubtypes);

  const matchesPilotModuleType = useCallback((item, moduleType) => {
    const filter = String(moduleType || "").toLowerCase();
    if (!filter) return true;

    if (filter === "frame") {
      return item?.pilotSubtype === "frame"
        || String(item?.category || "").toLowerCase() === "frame"
        || item?.passengers != null
        || String(item?.name || "").toLowerCase().includes("pilot_frame_");
    }

    const normalizedValues = [item?.type, item?.category, item?.name, item?.spellType]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    const matchesFlatField = normalizedValues.some((value) =>
      value === `pilot_module_${filter}` ||
      value.endsWith(`_${filter}`) ||
      value.includes(`module_${filter}`) ||
      value.includes(`${filter} module`)
    );
    if (matchesFlatField) return true;

    if (!Array.isArray(item?.modules) || item.modules.length === 0) return false;
    return item.modules.some((module) => {
      const moduleValues = [module?.type, module?.category, module?.name]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return moduleValues.some((value) =>
        value === `pilot_module_${filter}` ||
        value.endsWith(`_${filter}`) ||
        value.includes(`module_${filter}`) ||
        value.includes(`${filter} module`)
      );
    });
  }, []);

  // Pack state
  const {
    packs,
    createPack,
    updatePack,
    deletePack,
    toggleLock,
    removeItem,
    ensurePersonalPack,
    exportAsModule,
    importFromFile,
    importFromManifestUrl,
  } = useCompendiumPacks();

  const [newPackDialogOpen, setNewPackDialogOpen] = useState(false);
  const [newPackName, setNewPackName] = useState("");
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [manageModulesOpen, setManageModulesOpen] = useState(false);
  const [editPackItem, setEditPackItem] = useState(null); // { item, packItemId, itemType }
  const [deletePackItem, setDeletePackItem] = useState(null); // { item, packItemId }
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editingPackName, setEditingPackName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingAuthor, setEditingAuthor] = useState("");
  const [exportMeta, setExportMeta] = useState({ version: "1.0.0", homepageUrl: "", manifestUrl: "", downloadUrl: "" });
  const [exporting, setExporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTab, setImportTab] = useState(0);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [pendingNavPackId, setPendingNavPackId] = useState(null);
  const mainRef = useRef(null);
  const selectedCardRef = useRef(null);

  useEffect(() => { ensurePersonalPack(); }, [ensurePersonalPack]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      const resolvedType = restrictToTypes?.length
        ? (restrictToTypes.includes(initialType) ? initialType : restrictToTypes[0])
        : initialType;
      setSelectedType(resolvedType);
      setSearchQuery(initialSearchQuery);
      setSelectedIdx(null);
      setSelectedSpellClass(initialSpellClass);
      setSelectedModuleType(initialModuleTypeFilter);
      setSelectedMagichantSubtype("");
      setSelectedBook([]);
      setSelectedQualityFilters([]);
      setSelectedQualityCategories([]);
      setSelectedHeroicClasses([]);
      setSelectedOptionalSubtypes(initialOptionalSubtypes);
    }
  }, [open, initialType, initialSpellClass, initialSearchQuery, initialModuleTypeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const activePack = selectedCompendium !== "official"
    ? packs.find((p) => p.id === selectedCompendium) ?? null
    : null;

  const activeSpellCls = useMemo(() => {
    if (selectedType !== "player-spells" || !selectedSpellClass) return null;
    return classList.find((c) => c.name === selectedSpellClass) ?? null;
  }, [selectedType, selectedSpellClass]);

  const filteredItems = useMemo(() => {
    // Pack mode
    if (activePack) {
      const packType = VIEWER_TO_PACK_TYPE[selectedType];
      let items = activePack.items
        .filter((i) => !packType || i.type === packType)
        .map((i) => ({ ...i.data, _packItemId: i.id }));

      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter((item) =>
          item.filter && selectedQualityFilters.some(f => item.filter.includes(f))
        );
      }
      if (selectedType === "qualities" && selectedQualityCategories.length > 0) {
        items = items.filter((item) =>
          item.category && selectedQualityCategories.includes(item.category)
        );
      }
      if ((selectedType === "classes" || selectedType === "heroics") && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }
      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter((item) =>
          item.applicableTo && selectedHeroicClasses.some(c => item.applicableTo.includes(c))
        );
      }
      if (selectedType === "optionals" && selectedOptionalSubtypes.length > 0) {
        items = items.filter((item) => selectedOptionalSubtypes.includes(item.subtype));
      }
      if (selectedType === "player-spells" && selectedSpellClass) {
        const spellClasses = activeSpellCls?.benefits?.spellClasses ?? [];
        items = items.filter((item) => {
          if (spellClasses.includes("default") && item.class === selectedSpellClass) {
            return true;
          }
          return spellClasses.includes(item.spellType);
        });
      }
      if (selectedType === "player-spells" && String(selectedSpellClass).toLowerCase() === "pilot" && selectedModuleType) {
        items = items.filter((item) => matchesPilotModuleType(item, selectedModuleType));
      }
      if (selectedType === "player-spells" && String(selectedSpellClass).toLowerCase() === "chanter" && selectedMagichantSubtype) {
        items = items.filter((item) => {
          const isKey = item.magichantSubtype === "key" || item.type || item.status || item.attribute || item.recovery;
          return selectedMagichantSubtype === "key" ? isKey : !isKey;
        });
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter((item) => getItemSearchText(item).includes(q));
      }
      return items;
    }

    // Official mode : non-player-spells
    if (selectedType !== "player-spells") {
      let items = getItems(selectedType);
      if (selectedType === "classes") {
        items = items.filter(c => c.name !== "Blank Class" && c.book !== "homebrew");
        if (selectedBook.length > 0) {
          items = items.filter((item) => selectedBook.includes(item.book));
        }
      }
      if (selectedType === "qualities" && selectedQualityFilters.length > 0) {
        items = items.filter((item) =>
          item.filter && selectedQualityFilters.some(f => item.filter.includes(f))
        );
      }
      if (selectedType === "qualities" && selectedQualityCategories.length > 0) {
        items = items.filter((item) =>
          item.category && selectedQualityCategories.includes(item.category)
        );
      }
      if (selectedType === "heroics" && selectedBook.length > 0) {
        items = items.filter((item) => selectedBook.includes(item.book));
      }
      if (selectedType === "heroics" && selectedHeroicClasses.length > 0) {
        items = items.filter((item) =>
          item.applicableTo && selectedHeroicClasses.some(c => item.applicableTo.includes(c))
        );
      }
      if (selectedType === "optionals" && selectedOptionalSubtypes.length > 0) {
        items = items.filter((item) => selectedOptionalSubtypes.includes(item.subtype));
      }
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase();
      return items.filter((item) => getItemSearchText(item).includes(q));
    }

    // Player spells
    let items;
    if (!activeSpellCls) {
      items = spellList;
    } else {
      const scs = activeSpellCls.benefits?.spellClasses ?? [];
      items = [];
      for (const sc of scs) {
        if (sc === "default") {
          items.push(...spellList.filter((s) => s.class === activeSpellCls.name));
        } else if (sc === "cooking") {
          const cookingEffects = getDelicacyEffects(staticT);
          items.push(...cookingEffects.map(eff => ({
            name: `Delicacy #${eff.id}`,
            spellType: "cooking",
            ...eff,
          })));
        } else {
          const nonStatic = getNonStaticSpellItems(sc);
          if (nonStatic) items.push(...nonStatic);
        }
      }
    }
    // Filter by module type (for Pilot spells)
    const isPilotClassSelected = String(selectedSpellClass).toLowerCase() === "pilot";
    if (selectedModuleType && selectedType === "player-spells" && isPilotClassSelected) {
      items = items.filter((item) => matchesPilotModuleType(item, selectedModuleType));
    }
    if (selectedMagichantSubtype && selectedType === "player-spells" && String(selectedSpellClass).toLowerCase() === "chanter") {
      items = items.filter((item) => {
        const isKey = item.magichantSubtype === "key" || item.type || item.status || item.attribute || item.recovery;
        return selectedMagichantSubtype === "key" ? isKey : !isKey;
      });
    }
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      [item.name, item.class, item.spellType, item.wellspring]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [activePack, selectedType, searchQuery, activeSpellCls, selectedQualityFilters, selectedQualityCategories, selectedBook, selectedHeroicClasses, selectedOptionalSubtypes, selectedModuleType, selectedMagichantSubtype, selectedSpellClass, matchesPilotModuleType]);

  const itemIds = useMemo(
    () => filteredItems.map((item, idx) => makeId(item.name, idx)),
    [filteredItems]
  );

  // Scroll selected item into view in the main panel
  useEffect(() => {
    if (selectedIdx === null || !mainRef.current) return;
    const id = itemIds[selectedIdx];
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedIdx, itemIds]);

  const selectedItem = selectedIdx !== null ? filteredItems[selectedIdx] : null;
  const [downloadSelectedImage] = useDownloadImage(selectedItem?.name ?? "item", selectedCardRef);

  const toSlug = (value = "") =>
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleShareUrl = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("type", selectedType);
    if (selectedCompendium !== "official") {
      url.searchParams.set("compendium", selectedCompendium);
    } else {
      url.searchParams.delete("compendium");
    }
    if (selectedItem?.name) {
      url.searchParams.set("item", toSlug(selectedItem.name));
    }
    await navigator.clipboard.writeText(url.toString());
  }, [selectedType, selectedCompendium, selectedItem]);

  // Handlers
  const handleTypeChange = useCallback((type) => {
    if (restrictToTypes && !restrictToTypes.includes(type)) return;
    setSelectedType(type);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [restrictToTypes]);

  const handleItemClick = useCallback((item, idx) => {
    setSelectedIdx(idx);
    if (!isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  const handleSpellClassChange = useCallback((cls) => {
    setSelectedSpellClass(cls);
    if (String(cls).toLowerCase() !== "pilot") {
      setSelectedModuleType("");
    }
    if (String(cls).toLowerCase() !== "chanter") {
      setSelectedMagichantSubtype("");
    }
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleModuleTypeChange = useCallback((moduleType) => {
    setSelectedModuleType(moduleType);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleMagichantSubtypeChange = useCallback((magichantSubtype) => {
    setSelectedMagichantSubtype(magichantSubtype);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleBookChange = useCallback((books) => {
    setSelectedBook(books);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleQualityFiltersChange = useCallback((filters) => {
    setSelectedQualityFilters(filters);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleQualityCategoriesChange = useCallback((categories) => {
    setSelectedQualityCategories(categories);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleHeroicClassesChange = useCallback((classes) => {
    setSelectedHeroicClasses(classes);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleOptionalSubtypesChange = useCallback((subtypes) => {
    setSelectedOptionalSubtypes(subtypes);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleCompendiumChange = useCallback((compendium) => {
    if (compendium === "__manage_modules__") {
      setManageModulesOpen(true);
      return;
    }
    setSelectedCompendium(compendium);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleNewPack = useCallback(async () => {
    if (!newPackName.trim()) return;
    const id = await createPack(newPackName.trim());
    setNewPackName("");
    setPendingNavPackId(id);
    setNewPackDialogOpen(false);
  }, [newPackName, createPack]);

  const handleRemoveFromPack = useCallback(async (packItemId) => {
    if (!activePack || !packItemId) return;
    await removeItem(activePack.id, packItemId);
    setSelectedIdx(null);
  }, [activePack, removeItem]);

  const handleExport = useCallback(async () => {
    if (!activePack) return;
    setExporting(true);
    try {
      await exportAsModule(activePack.id, exportMeta);
    } finally {
      setExporting(false);
      setManageDialogOpen(false);
    }
  }, [activePack, exportAsModule, exportMeta]);

  const handleImportFile = useCallback(async (file) => {
    if (importing) return;
    setImporting(true);
    setImportError("");
    try {
      const id = await importFromFile(file);
      setImportUrl("");
      setPendingNavPackId(id);
      setImportDialogOpen(false);
    } catch (err) {
      setImportError(err.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  }, [importing, importFromFile]);

  const handleImportUrl = useCallback(async () => {
    if (!importUrl.trim() || importing) return;
    setImporting(true);
    setImportError("");
    try {
      const id = await importFromManifestUrl(importUrl.trim());
      setImportUrl("");
      setPendingNavPackId(id);
      setImportDialogOpen(false);
    } catch (err) {
      setImportError(err.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  }, [importing, importUrl, importFromManifestUrl]);

  const selectedTypeContext = ITEM_TYPES.find((x) => x.key === selectedType)?.context;
  const contextMismatch = context && selectedTypeContext && selectedTypeContext !== "both" && selectedTypeContext !== context;

  const handleAddItem = () => {
    if (selectedItem && onAddItem) {
      onAddItem(selectedItem, selectedType);
    }
    onClose();
  };

  const sidebarContent = (
    <CompendiumSidebar
      selectedType={selectedType}
      onTypeChange={handleTypeChange}
      searchQuery={searchQuery}
      onSearchChange={(q) => {
        setSearchQuery(q);
        setSelectedIdx(null);
      }}
      filteredItems={filteredItems}
      onItemClick={handleItemClick}
      selectedIdx={selectedIdx}
      selectedSpellClass={selectedSpellClass}
      onSpellClassChange={handleSpellClassChange}
      selectedModuleType={selectedModuleType}
      onModuleTypeChange={handleModuleTypeChange}
      selectedMagichantSubtype={selectedMagichantSubtype}
      onMagichantSubtypeChange={handleMagichantSubtypeChange}
      selectedQualityFilters={selectedQualityFilters}
      onQualityFiltersChange={handleQualityFiltersChange}
      selectedQualityCategories={selectedQualityCategories}
      onQualityCategoriesChange={handleQualityCategoriesChange}
      selectedBook={selectedBook}
      onBookChange={handleBookChange}
      selectedHeroicClasses={selectedHeroicClasses}
      onHeroicClassesChange={handleHeroicClassesChange}
      selectedOptionalSubtypes={selectedOptionalSubtypes}
      onOptionalSubtypesChange={handleOptionalSubtypesChange}
      packs={packs}
      selectedCompendium={selectedCompendium}
      onCompendiumChange={handleCompendiumChange}
      onNewPack={() => setNewPackDialogOpen(true)}
      onImportPack={() => {
        setImportError("");
        setImportTab(0);
        setImportUrl("");
        setImportDialogOpen(true);
      }}
      onManagePack={() => {
        setEditingPackName(activePack?.name ?? "");
        setEditingDescription(activePack?.description ?? "");
        setEditingAuthor(activePack?.author ?? "");
        setExportMeta({ version: "1.0.0", homepageUrl: "", manifestUrl: "", downloadUrl: "" });
        setManageDialogOpen(true);
      }}
      activePack={activePack}
      onToggleLock={toggleLock}
      onOpenCreateDialog={() => setCreateItemDialogOpen(true)}
      onOpenQuickCreate={() => setQuickCreateOpen(true)}
      restrictToTypes={restrictToTypes}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={!isDesktop}
      PaperProps={{ sx: isDesktop ? { height: "90vh" } : {} }}
    >
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#ffffff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!isDesktop && (
          <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ color: "#ffffff", mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}
        {t("Compendium")}
        <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", p: 0, overflow: "hidden" }}>
        {/* Desktop sidebar */}
        {isDesktop && (
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {sidebarContent}
          </Box>
        )}

        {/* Mobile sidebar drawer */}
        {!isDesktop && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ sx: { width: "85vw", maxWidth: 340 } }}
            sx={{ zIndex: 1400 }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflow: "hidden" }}>
              {sidebarContent}
            </Box>
          </Drawer>
        )}

        {/* Main content */}
        <Box ref={mainRef} sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, md: 2 } }}>
          {/* Mobile type label */}
          {!isDesktop && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t(ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? "")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({filteredItems.length})
              </Typography>
            </Box>
          )}
          {filteredItems.length === 0 ? (
            <Typography color="text.secondary">{t("No items found.")}</Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredItems.map((item, idx) => (
                <Grid
                  key={itemIds[idx]}
                  size={{
                    xs: 12,
                    lg: selectedType === "classes" ? 12 : 6
                  }}>
                  <Box
                    ref={idx === selectedIdx ? selectedCardRef : null}
                    sx={{
                      borderRadius: 1,
                      outline: idx === selectedIdx
                        ? `2px solid ${customTheme.primary}`
                        : "2px solid transparent",
                      transition: "outline 0.15s ease",
                    }}
                  >
                    <ItemCard
                      type={selectedType}
                      item={item}
                      id={itemIds[idx]}
                      onHeaderClick={() => handleItemClick(item, idx)}
                    />
                  </Box>
                  {idx === selectedIdx && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                      <Tooltip title={t("Share URL")}>
                        <IconButton size="small" onClick={handleShareUrl}>
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("Download as Image")}>
                        <IconButton size="small" onClick={downloadSelectedImage}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Export name={item.name} dataType={selectedType} data={item} size="small" />
                      {selectedCompendium !== "official" && item._packItemId && !activePack?.locked && VIEWER_TO_PACK_TYPE[selectedType] && (
                        <Tooltip title={t("Edit")}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setEditPackItem({
                                item,
                                packItemId: item._packItemId,
                                itemType: VIEWER_TO_PACK_TYPE[selectedType],
                              })
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {VIEWER_TO_PACK_TYPE[selectedType] && (
                        <AddToCompendiumButton
                          itemType={VIEWER_TO_PACK_TYPE[selectedType]}
                          data={item}
                          excludePackId={selectedCompendium !== "official" ? selectedCompendium : undefined}
                          tooltipOverride={selectedType === "classes" && selectedCompendium === "official" ? t("Clone to Custom") : undefined}
                        />
                      )}
                      {selectedCompendium !== "official" && item._packItemId && !activePack?.locked && (
                        <Tooltip title={t("Remove from pack")}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeletePackItem({ item, packItemId: item._packItemId })}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
      {!viewOnly && (
        <>
          <Divider />
          <DialogActions
            sx={{
              justifyContent: "space-between",
              px: 2,
              py: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>{t("Disclaimer")}:</strong>{" "}
              {t("For personal use only; do not share exported data on official channels.")}
            </Typography>
            <Tooltip
              title={contextMismatch
                ? t(context === "npc" ? "This item type is for player sheets only." : "This item type is for NPC sheets only.")
                : ""}
              disableHoverListener={!contextMismatch}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedItem === null || !!contextMismatch}
                  onClick={handleAddItem}
                  sx={{ flexShrink: 0 }}
                >
                  {t("Add Item")}
                </Button>
              </span>
            </Tooltip>
          </DialogActions>
        </>
      )}
      {/* Manage Modules modal */}
      <ManageModulesModal
        open={manageModulesOpen}
        onClose={() => setManageModulesOpen(false)}
        onImportSuccess={(id) => {
          setManageModulesOpen(false);
          handleCompendiumChange(id);
        }}
      />
      {/* Quick Create modal */}
      <QuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        lockedToViewerType={restrictToTypes?.length ? selectedType : undefined}
      />
      {/* Create item dialog */}
      {activePack && (
        <CompendiumItemCreateDialog
          open={createItemDialogOpen}
          onClose={() => setCreateItemDialogOpen(false)}
          itemType={VIEWER_TO_PACK_TYPE[selectedType]}
          packId={activePack.id}
        />
      )}
      {/* Edit pack item dialog */}
      {activePack && editPackItem && (
        <CompendiumItemCreateDialog
          open={Boolean(editPackItem)}
          onClose={() => setEditPackItem(null)}
          itemType={editPackItem.itemType}
          packId={activePack.id}
          editData={editPackItem.item}
          editItemId={editPackItem.packItemId}
        />
      )}
      <DeleteConfirmationDialog
        open={Boolean(deletePackItem)}
        onClose={() => setDeletePackItem(null)}
        onConfirm={async () => {
          if (!deletePackItem?.packItemId) return;
          await handleRemoveFromPack(deletePackItem.packItemId);
          setDeletePackItem(null);
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to remove this item from the pack?")}
        itemPreview={
          deletePackItem?.item ? (
            <Box>
              <Typography variant="h4">{deletePackItem.item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t(selectedType)}
              </Typography>
            </Box>
          ) : null
        }
      />
      {/* New Pack dialog */}
      <Dialog
        open={newPackDialogOpen}
        onClose={() => setNewPackDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionProps={{
          onExited: () => {
            if (pendingNavPackId) {
              handleCompendiumChange(pendingNavPackId);
              setPendingNavPackId(null);
            }
          },
        }}
      >
        <DialogTitle
          sx={{
            background: customTheme.primary,
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.95rem",
            py: 1.25,
          }}
        >
          {t("New Compendium Pack")}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <TextField
            label={t("Name")}
            value={newPackName}
            onChange={(e) => setNewPackName(e.target.value)}
            autoFocus
            fullWidth
            size="small"
            onKeyDown={(e) => e.key === "Enter" && handleNewPack()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setNewPackDialogOpen(false); setNewPackName(""); }}>
            {t("Cancel")}
          </Button>
          <Button variant="contained" onClick={handleNewPack} disabled={!newPackName.trim()}>
            {t("Create")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Manage Pack dialog */}
      <Dialog
        open={manageDialogOpen}
        onClose={() => !exporting && setManageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onExited: () => {
            if (pendingNavPackId) {
              handleCompendiumChange(pendingNavPackId);
              setPendingNavPackId(null);
            }
          },
        }}
      >
        <DialogTitle
          sx={{
            background: customTheme.primary,
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.95rem",
            py: 1.25,
          }}
        >
          {activePack?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          {activePack && !activePack.isPersonal && (
            <TextField
              label={t("Pack name")}
              value={editingPackName}
              onChange={(e) => setEditingPackName(e.target.value)}
              fullWidth
              size="small"
            />
          )}
          <TextField
            label={t("Description")}
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
          <TextField
            label={t("Author")}
            value={editingAuthor}
            onChange={(e) => setEditingAuthor(e.target.value)}
            fullWidth
            size="small"
          />
          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
              {t("Module Export")}
            </Typography>
          </Divider>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label={t("Version")}
              value={exportMeta.version}
              onChange={(e) => setExportMeta((m) => ({ ...m, version: e.target.value }))}
              size="small"
              sx={{ width: 120 }}
              placeholder="1.0.0"
            />
            <TextField
              label={t("Homepage URL")}
              value={exportMeta.homepageUrl}
              onChange={(e) => setExportMeta((m) => ({ ...m, homepageUrl: e.target.value }))}
              fullWidth
              size="small"
              placeholder="https://..."
            />
          </Box>
          <TextField
            label={t("Manifest URL")}
            value={exportMeta.manifestUrl}
            onChange={(e) => setExportMeta((m) => ({ ...m, manifestUrl: e.target.value }))}
            fullWidth
            size="small"
            placeholder="https://.../manifest.json"
          />
          <TextField
            label={t("Download URL")}
            value={exportMeta.downloadUrl}
            onChange={(e) => setExportMeta((m) => ({ ...m, downloadUrl: e.target.value }))}
            fullWidth
            size="small"
            placeholder="https://.../pack.fcp"
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          {activePack && !activePack.isPersonal && (
            <Button
              color="error"
              disabled={exporting}
              onClick={async () => {
                await deletePack(activePack.id);
                setPendingNavPackId("official");
                setManageDialogOpen(false);
              }}
            >
              {t("Delete Pack")}
            </Button>
          )}
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <Button
              startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <IosShareIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              {t("Export")}
            </Button>
            <Button onClick={() => setManageDialogOpen(false)} disabled={exporting}>
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={exporting || (!activePack?.isPersonal && !editingPackName.trim())}
              onClick={async () => {
                if (!activePack) return;
                const changes = {
                  ...(!activePack.isPersonal ? { name: editingPackName.trim() } : {}),
                  description: editingDescription.trim() || undefined,
                  author: editingAuthor.trim() || undefined,
                };
                await updatePack(activePack.id, changes);
                setManageDialogOpen(false);
              }}
            >
              {t("Save")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {/* Import Pack dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => !importing && setImportDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionProps={{
          onExited: () => {
            if (pendingNavPackId) {
              handleCompendiumChange(pendingNavPackId);
              setPendingNavPackId(null);
            }
          },
        }}
      >
        <DialogTitle
          sx={{
            background: customTheme.primary,
            color: "#ffffff",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.95rem",
            py: 1.25,
          }}
        >
          {t("Import Pack")}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          <Tabs value={importTab} onChange={(_, v) => { setImportTab(v); setImportError(""); }}>
            <Tab label={t("Upload .fcp file")} />
            <Tab label={t("From URL")} icon={<LinkIcon fontSize="small" />} iconPosition="end" />
          </Tabs>
          {importTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("Select a .fcp file exported from Fultimator.")}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
                disabled={importing}
              >
                {t("Choose file")}
                <input
                  type="file"
                  accept=".fcp,.zip"
                  hidden
                  disabled={importing}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = "";
                  }}
                />
              </Button>
              {importing && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">{t("Importing…")}</Typography>
                </Box>
              )}
            </Box>
          )}
          {importTab === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("Paste a manifest.json URL to download and import the pack.")}
              </Typography>
              <TextField
                label={t("Manifest URL")}
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                fullWidth
                size="small"
                placeholder="https://.../manifest.json"
                disabled={importing}
                onKeyDown={(e) => e.key === "Enter" && handleImportUrl()}
              />
            </Box>
          )}
          {importError && <Alert severity="error">{importError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)} disabled={importing}>
            {t("Cancel")}
          </Button>
          {importTab === 1 && (
            <Button
              variant="contained"
              onClick={handleImportUrl}
              disabled={importing || !importUrl.trim()}
              startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
            >
              {t("Import")}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default CompendiumViewerModal;
