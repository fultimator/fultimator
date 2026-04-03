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
import CompendiumItemCreateDialog from "./CompendiumItemCreateDialog";
import QuickCreateModal from "./QuickCreateModal";
import classList, { spellList } from "../../libs/classes";
import { getDelicacyEffects } from "../../libs/gourmetCookingData";

const NPC_TYPES    = ["spells", "attacks", "special", "actions"];
const PLAYER_TYPES = ["weapons", "armor", "shields", "player-spells", "qualities", "classes", "heroics"];

const SIDEBAR_WIDTH = 300;

const CompendiumViewerModal = ({ open, onClose, onAddItem, initialType = "spells", context }) => {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Viewer state (local instead of URL params)
  const [selectedType, setSelectedType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [selectedCompendium, setSelectedCompendium] = useState("official");
  const [selectedSpellClass, setSelectedSpellClass] = useState("");
  const [selectedBook, setSelectedBook] = useState([]);
  const [selectedQualityFilters, setSelectedQualityFilters] = useState([]);
  const [selectedQualityCategories, setSelectedQualityCategories] = useState([]);
  const [selectedHeroicClasses, setSelectedHeroicClasses] = useState([]);

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
  const [editClassItem, setEditClassItem] = useState(null);
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

  useEffect(() => { ensurePersonalPack(); }, [ensurePersonalPack]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedType(initialType);
      setSearchQuery("");
      setSelectedIdx(null);
      setSelectedCompendium("official");
      setSelectedSpellClass("");
      setSelectedBook([]);
      setSelectedQualityFilters([]);
      setSelectedQualityCategories([]);
      setSelectedHeroicClasses([]);
    }
  }, [open, initialType]);

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
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter((item) => getItemSearchText(item).includes(q));
      }
      return items;
    }

    // Official mode — non-player-spells
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
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      [item.name, item.class, item.spellType, item.wellspring]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [activePack, selectedType, searchQuery, activeSpellCls, selectedQualityFilters, selectedQualityCategories, selectedBook, selectedHeroicClasses]);

  const itemIds = useMemo(
    () => filteredItems.map((item, idx) => makeId(item.name, idx)),
    [filteredItems]
  );

  const selectedItem = selectedIdx !== null ? filteredItems[selectedIdx] : null;

  // Handlers
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    setSearchQuery("");
    setSelectedIdx(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleItemClick = useCallback((item, idx) => {
    setSelectedIdx(idx);
    if (!isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  const handleSpellClassChange = useCallback((cls) => {
    setSelectedSpellClass(cls);
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

  const handleCompendiumChange = useCallback((compendium) => {
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

  const handleRemoveFromPack = useCallback(async (item) => {
    if (!activePack) return;
    await removeItem(activePack.id, item._packItemId);
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
      selectedQualityFilters={selectedQualityFilters}
      onQualityFiltersChange={handleQualityFiltersChange}
      selectedQualityCategories={selectedQualityCategories}
      onQualityCategoriesChange={handleQualityCategoriesChange}
      selectedBook={selectedBook}
      onBookChange={handleBookChange}
      selectedHeroicClasses={selectedHeroicClasses}
      onHeroicClassesChange={handleHeroicClassesChange}
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
                <Grid item xs={12} lg={selectedType === "classes" ? 12 : 6} key={itemIds[idx]}>
                  <Box
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
                      {VIEWER_TO_PACK_TYPE[selectedType] && (
                        <AddToCompendiumButton
                          itemType={VIEWER_TO_PACK_TYPE[selectedType]}
                          data={item}
                          excludePackId={selectedCompendium !== "official" ? selectedCompendium : undefined}
                          tooltipOverride={selectedType === "classes" && selectedCompendium === "official" ? t("Clone to Custom") : undefined}
                        />
                      )}
                      {selectedCompendium !== "official" && selectedType === "classes" && item._packItemId && !activePack?.locked && (
                        <Tooltip title={t("Edit Class")}>
                          <IconButton size="small" onClick={() => setEditClassItem({ item, packItemId: item._packItemId })}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {selectedCompendium !== "official" && item._packItemId && !activePack?.locked && (
                        <Tooltip title={t("Remove from pack")}>
                          <IconButton size="small" color="error" onClick={() => handleRemoveFromPack(item)}>
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

      {/* Quick Create modal */}
      <QuickCreateModal open={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} />

      {/* Create item dialog */}
      {activePack && (
        <CompendiumItemCreateDialog
          open={createItemDialogOpen}
          onClose={() => setCreateItemDialogOpen(false)}
          itemType={VIEWER_TO_PACK_TYPE[selectedType]}
          packId={activePack.id}
        />
      )}

      {/* Edit class dialog */}
      {activePack && editClassItem && (
        <CompendiumItemCreateDialog
          open={Boolean(editClassItem)}
          onClose={() => setEditClassItem(null)}
          itemType="class"
          packId={activePack.id}
          editData={editClassItem.item}
          editItemId={editClassItem.packItemId}
        />
      )}

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
