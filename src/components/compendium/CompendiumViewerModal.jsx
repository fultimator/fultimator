import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Divider,
  Typography,
  Tooltip,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  useMediaQuery,
  InputAdornment,
  Autocomplete,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import IosShareIcon from "@mui/icons-material/IosShare";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useCompendiumFilters } from "./hooks/useCompendiumFilters";
import CompendiumBrowser from "./CompendiumBrowser";
import {
  ITEM_TYPES,
  VIEWER_TO_PACK_TYPE,
  getItems,
  toSlug,
} from "../../libs/compendium";
import Export from "../Export";
import CompendiumItemCreateDialog from "./CompendiumItemCreateDialog";
import QuickCreateModal from "./QuickCreateModal";
import { ManageModulesModal } from "../manage-modules";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

const CompendiumViewerModal = ({
  open,
  onClose,
  onAddItem,
  initialType = "spells",
  context,
  restrictToTypes,
  viewOnly = false,
  initialOptionalSubtypes = [],
  initialSpellClass = "",
  initialSearchQuery = "",
  initialModuleTypeFilter = "",
  initialQualityFilters = [],
  initialCompendium = "official",
}) => {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up("md"));

  // ---------------------------------------------------------------------------
  // Filter state (via hook)
  // ---------------------------------------------------------------------------
  const {
    filters,
    handlers,
    selectedIdx,
    setSelectedIdx,
    searchQuery,
    setSearchQuery,
  } = useCompendiumFilters({
    restrictToTypes,
    initialType,
    initialSearchQuery,
    initialSpellClass,
    initialModuleType: initialModuleTypeFilter,
    initialQualityFilters,
    initialOptionalSubtypes,
    initialCompendium,
    open,
  });

  const { selectedType, selectedCompendium } = filters;

  // ---------------------------------------------------------------------------
  // Pack state
  // ---------------------------------------------------------------------------
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
  const [newPackFuid, setNewPackFuid] = useState("");
  const [newPackFuidTouched, setNewPackFuidTouched] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [manageModulesOpen, setManageModulesOpen] = useState(false);
  const [editPackItem, setEditPackItem] = useState(null);
  const [deletePackItem, setDeletePackItem] = useState(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editingPackName, setEditingPackName] = useState("");
  const [editingPackFuid, setEditingPackFuid] = useState("");
  const [editingPackFuidTouched, setEditingPackFuidTouched] = useState(false);
  const [editingDescription, setEditingDescription] = useState("");
  const [editingAuthor, setEditingAuthor] = useState("");
  const [editingRequires, setEditingRequires] = useState([]);
  const [editingAutoRequires, setEditingAutoRequires] = useState([]);
  const [editingOptional, setEditingOptional] = useState([]);
  const [exportMeta, setExportMeta] = useState({
    version: "1.0.0",
    homepageUrl: "",
    manifestUrl: "",
    downloadUrl: "",
  });
  const [exporting, setExporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTab, setImportTab] = useState(0);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [pendingNavPackId, setPendingNavPackId] = useState(null);

  useEffect(() => {
    ensurePersonalPack();
  }, [ensurePersonalPack]);

  const activePack =
    selectedCompendium !== "official"
      ? (packs.find((p) => p.id === selectedCompendium) ?? null)
      : null;

  const normalizedNewPackFuid = toSlug(newPackFuid);
  const normalizedEditingPackFuid = toSlug(editingPackFuid);
  const isNewPackFuidDuplicate =
    normalizedNewPackFuid.length > 0 &&
    packs.some((p) => toSlug(p.fuid || "") === normalizedNewPackFuid);
  const isEditingPackFuidDuplicate =
    normalizedEditingPackFuid.length > 0 &&
    packs.some(
      (p) =>
        p.id !== activePack?.id &&
        toSlug(p.fuid || "") === normalizedEditingPackFuid,
    );
  const dependencySuggestions = useMemo(() => {
    const installed = packs
      .map((p) => toSlug(p.fuid || p.name || ""))
      .filter(Boolean);
    const unique = Array.from(new Set(installed)).sort((a, b) =>
      a.localeCompare(b),
    );
    return ["official", ...unique.filter((v) => v !== "official")];
  }, [packs]);
  const mergedEditingRequires = useMemo(
    () =>
      Array.from(new Set([...editingRequires, ...editingAutoRequires])).sort(
        (a, b) => a.localeCompare(b),
      ),
    [editingRequires, editingAutoRequires],
  );

  // ---------------------------------------------------------------------------
  // Pack handlers (wrap filter handleCompendiumChange to also support manage modules)
  // ---------------------------------------------------------------------------
  const handleCompendiumChange = useCallback(
    (compendium) => {
      handlers.handleCompendiumChange(compendium, {
        onManageModules: () => setManageModulesOpen(true),
      });
      if (pendingNavPackId) {
        setPendingNavPackId(null);
      }
    },
    [handlers, pendingNavPackId],
  );

  const handleNewPack = useCallback(async () => {
    if (!newPackName.trim()) return;
    const fuid = toSlug(newPackFuid) || toSlug(newPackName) || undefined;
    const id = await createPack(newPackName.trim(), undefined, fuid);
    setNewPackName("");
    setNewPackFuid("");
    setNewPackFuidTouched(false);
    setPendingNavPackId(id);
    setNewPackDialogOpen(false);
  }, [newPackName, newPackFuid, createPack]);

  const handleRemoveFromPack = useCallback(
    async (packItemId) => {
      if (!activePack || !packItemId) return;
      await removeItem(activePack.id, packItemId);
      setSelectedIdx(null);
    },
    [activePack, removeItem, setSelectedIdx],
  );

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

  const handleImportFile = useCallback(
    async (file) => {
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
    },
    [importing, importFromFile],
  );

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

  // ---------------------------------------------------------------------------
  // Context mismatch validation
  // ---------------------------------------------------------------------------
  const selectedTypeContext = ITEM_TYPES.find(
    (x) => x.key === selectedType,
  )?.context;
  const contextMismatch =
    context &&
    selectedTypeContext &&
    selectedTypeContext !== "both" &&
    selectedTypeContext !== context;

  // ---------------------------------------------------------------------------
  // Item to add (uses selectedIdx resolved in CompendiumBrowser via useCompendiumItems)
  // We re-derive the selected item here for the footer "Add Item" button
  // ---------------------------------------------------------------------------
  const [resolvedSelectedItem, setResolvedSelectedItem] = useState(null);

  const handleSelectedItemChange = useCallback((item) => {
    setResolvedSelectedItem(item ?? null);
  }, []);

  const renderItemActions = useCallback(
    (item, _idx, _selectedItem) => {
      return (
        <>
          <Export
            name={item.name}
            dataType={selectedType}
            data={item}
            size="small"
          />
          {selectedCompendium !== "official" &&
            item._packItemId &&
            !activePack?.locked &&
            VIEWER_TO_PACK_TYPE[selectedType] && (
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
          {selectedCompendium !== "official" &&
            item._packItemId &&
            !activePack?.locked && (
              <Tooltip title={t("Remove from pack")}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    setDeletePackItem({ item, packItemId: item._packItemId })
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
        </>
      );
    },
    [t, selectedType, selectedCompendium, activePack],
  );

  // Reset resolvedSelectedItem when selection is cleared
  useEffect(() => {
    if (selectedIdx === null) setResolvedSelectedItem(null);
  }, [selectedIdx]);

  const handleAddItem = useCallback(() => {
    if (resolvedSelectedItem && onAddItem) {
      onAddItem(resolvedSelectedItem, selectedType);
    }
    onClose();
  }, [resolvedSelectedItem, onAddItem, selectedType, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && resolvedSelectedItem && !contextMismatch) {
      e.preventDefault();
      handleAddItem();
    }
  };

  // Wrap handlers to pass through manage modules callback
  const wrappedHandlers = useMemo(
    () => ({
      ...handlers,
      handleCompendiumChange: (compendium, opts = {}) => {
        handlers.handleCompendiumChange(compendium, {
          ...opts,
          onManageModules: () => setManageModulesOpen(true),
        });
      },
    }),
    [handlers],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      maxWidth="xl"
      fullWidth
      fullScreen={!isDesktop}
      slotProps={{
        paper: { sx: isDesktop ? { height: "90vh" } : {} },
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {t("Compendium")}
        <IconButton size="small" onClick={onClose} sx={{ color: "#ffffff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", p: 0, overflow: "hidden" }}>
        <CompendiumBrowser
          filters={filters}
          handlers={wrappedHandlers}
          selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          packs={packs}
          activePack={activePack}
          context={context}
          restrictToTypes={restrictToTypes}
          onNewPack={() => setNewPackDialogOpen(true)}
          onManagePack={() => {
            setEditingPackName(activePack?.name ?? "");
            setEditingPackFuid(
              activePack?.fuid ?? toSlug(activePack?.name ?? ""),
            );
            setEditingPackFuidTouched(false);
            setEditingDescription(activePack?.description ?? "");
            setEditingAuthor(activePack?.author ?? "");
            setEditingRequires(
              activePack?.requiresManual ?? activePack?.requires ?? [],
            );
            setEditingAutoRequires(activePack?.requiresAuto ?? []);
            setEditingOptional(activePack?.optional ?? []);
            setExportMeta({
              version: "1.0.0",
              homepageUrl: "",
              manifestUrl: "",
              downloadUrl: "",
            });
            setManageDialogOpen(true);
          }}
          onImportPack={() => {
            setImportError("");
            setImportTab(0);
            setImportUrl("");
            setImportDialogOpen(true);
          }}
          onToggleLock={toggleLock}
          onOpenQuickCreate={() => setQuickCreateOpen(true)}
          onSelectedItemChange={handleSelectedItemChange}
          showShareUrl
          showDownloadImage
          isDesktopOverride={isDesktop}
          renderItemActions={renderItemActions}
          renderEmptyState={() => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                py: 8,
                px: 4,
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ color: "text.secondary" }}>
                {t("No items found.")}
              </Typography>
              {selectedCompendium === "official" &&
                getItems(selectedType).length === 0 && (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 640,
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      textAlign: "left",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                        lineHeight: 1.6,
                      }}
                    >
                      {t(
                        "This item type is not covered under the third party license and has no official data.",
                      )}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mt: 1, lineHeight: 1.6 }}
                    >
                      {t(
                        "You can create custom items by switching to your personal compendium.",
                      )}
                    </Typography>
                    {packs.length > 0 && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleCompendiumChange(packs[0].id)}
                        sx={{ mt: 2 }}
                      >
                        {t("Go to personal compendium")}
                      </Button>
                    )}
                  </Box>
                )}
            </Box>
          )}
          mainSx={{ height: "100%" }}
        />
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
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <strong>{t("Disclaimer")}:</strong>{" "}
              {t(
                "For personal use only; do not share exported data on official channels.",
              )}
            </Typography>
            <Tooltip
              title={
                contextMismatch
                  ? t(
                      context === "npc"
                        ? "This item type is for player sheets only."
                        : "This item type is for NPC sheets only.",
                    )
                  : ""
              }
              disableHoverListener={!contextMismatch}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={resolvedSelectedItem === null || !!contextMismatch}
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
        lockedToViewerType={selectedType}
        initialSubtype={
          selectedType === "player-spells"
            ? (filters.selectedSpellClass ?? undefined)
            : selectedType === "optionals" &&
                filters.selectedOptionalSubtypes?.length === 1
              ? filters.selectedOptionalSubtypes[0]
              : undefined
        }
      />

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

      {/* Delete confirmation */}
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
        slotProps={{
          transition: {
            onExited: () => {
              if (pendingNavPackId) {
                handleCompendiumChange(pendingNavPackId);
                setPendingNavPackId(null);
              }
            },
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
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label={t("Name")}
            value={newPackName}
            onChange={(e) => {
              const nextName = e.target.value;
              setNewPackName(nextName);
              if (!newPackFuidTouched) setNewPackFuid(toSlug(nextName));
            }}
            autoFocus
            fullWidth
            size="small"
            onKeyDown={(e) => e.key === "Enter" && handleNewPack()}
          />
          <TextField
            label="FUID"
            value={newPackFuid}
            onChange={(e) => {
              setNewPackFuid(e.target.value);
              setNewPackFuidTouched(true);
            }}
            fullWidth
            size="small"
            error={isNewPackFuidDuplicate}
            helperText={
              isNewPackFuidDuplicate
                ? "Another pack already uses this FUID"
                : "Used for cross-pack references"
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy FUID">
                      <span>
                        <IconButton
                          size="small"
                          disabled={!normalizedNewPackFuid}
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              normalizedNewPackFuid,
                            );
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Regenerate from name">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setNewPackFuid(toSlug(newPackName));
                          setNewPackFuidTouched(false);
                        }}
                      >
                        <AutorenewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNewPackDialogOpen(false);
              setNewPackName("");
              setNewPackFuid("");
              setNewPackFuidTouched(false);
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleNewPack}
            disabled={
              !newPackName.trim() ||
              !normalizedNewPackFuid ||
              isNewPackFuidDuplicate
            }
          >
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
        slotProps={{
          transition: {
            onExited: () => {
              if (pendingNavPackId) {
                handleCompendiumChange(pendingNavPackId);
                setPendingNavPackId(null);
              }
            },
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
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {activePack && !activePack.isPersonal && (
            <TextField
              label={t("Pack name")}
              value={editingPackName}
              onChange={(e) => {
                const nextName = e.target.value;
                setEditingPackName(nextName);
                if (!editingPackFuidTouched)
                  setEditingPackFuid(toSlug(nextName));
              }}
              fullWidth
              size="small"
            />
          )}
          {activePack && !activePack.isPersonal && (
            <TextField
              label="FUID"
              value={editingPackFuid}
              onChange={(e) => {
                setEditingPackFuid(e.target.value);
                setEditingPackFuidTouched(true);
              }}
              fullWidth
              size="small"
              error={isEditingPackFuidDuplicate}
              helperText={
                isEditingPackFuidDuplicate
                  ? "Another pack already uses this FUID"
                  : "Used for cross-pack references"
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Copy FUID">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!normalizedEditingPackFuid}
                            onClick={async () => {
                              await navigator.clipboard.writeText(
                                normalizedEditingPackFuid,
                              );
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Regenerate from name">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingPackFuid(toSlug(editingPackName));
                            setEditingPackFuidTouched(false);
                          }}
                        >
                          <AutorenewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
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
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("Module Export")}
            </Typography>
          </Divider>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label={t("Version")}
              value={exportMeta.version}
              onChange={(e) =>
                setExportMeta((m) => ({ ...m, version: e.target.value }))
              }
              size="small"
              sx={{ width: 120 }}
              placeholder="1.0.0"
            />
            <TextField
              label={t("Homepage URL")}
              value={exportMeta.homepageUrl}
              onChange={(e) =>
                setExportMeta((m) => ({ ...m, homepageUrl: e.target.value }))
              }
              fullWidth
              size="small"
              placeholder="https://..."
            />
          </Box>
          <TextField
            label={t("Manifest URL")}
            value={exportMeta.manifestUrl}
            onChange={(e) =>
              setExportMeta((m) => ({ ...m, manifestUrl: e.target.value }))
            }
            fullWidth
            size="small"
            placeholder="https://.../manifest.json"
          />
          <TextField
            label={t("Download URL")}
            value={exportMeta.downloadUrl}
            onChange={(e) =>
              setExportMeta((m) => ({ ...m, downloadUrl: e.target.value }))
            }
            fullWidth
            size="small"
            placeholder="https://.../pack.fcp"
          />
          <Divider>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Dependencies
            </Typography>
          </Divider>
          <Autocomplete
            multiple
            freeSolo
            options={dependencySuggestions}
            value={mergedEditingRequires}
            onChange={(_event, values) => {
              const next = Array.from(
                new Set(values.map((v) => toSlug(String(v))).filter(Boolean)),
              );
              setEditingRequires(
                next.filter((dep) => !editingAutoRequires.includes(dep)),
              );
            }}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const isSystem = editingAutoRequires.includes(option);
                const tagProps = getItemProps({ index });
                const { onDelete, ...safeTagProps } = tagProps;
                const chip = (
                  <Chip
                    {...safeTagProps}
                    label={isSystem ? `${option} (system)` : option}
                    size="small"
                    onDelete={isSystem ? undefined : onDelete}
                  />
                );
                return isSystem ? (
                  <Tooltip key={option} title="Required by referenced items">
                    {chip}
                  </Tooltip>
                ) : (
                  <React.Fragment key={option}>{chip}</React.Fragment>
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Requires"
                placeholder="author.pack-fuid"
                size="small"
                helperText="Hard dependencies"
              />
            )}
          />
          <Autocomplete
            multiple
            freeSolo
            options={dependencySuggestions}
            value={editingOptional}
            onChange={(_event, values) => {
              const next = Array.from(
                new Set(values.map((v) => toSlug(String(v))).filter(Boolean)),
              );
              setEditingOptional(next);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Optional"
                placeholder="author.pack-fuid"
                size="small"
                helperText="Soft dependencies"
              />
            )}
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
              startIcon={
                exporting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <IosShareIcon />
                )
              }
              onClick={handleExport}
              disabled={exporting}
            >
              {t("Export")}
            </Button>
            <Button
              onClick={() => setManageDialogOpen(false)}
              disabled={exporting}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              disabled={
                exporting ||
                (!activePack?.isPersonal &&
                  (!editingPackName.trim() ||
                    !normalizedEditingPackFuid ||
                    isEditingPackFuidDuplicate))
              }
              onClick={async () => {
                if (!activePack) return;
                const changes = {
                  ...(!activePack.isPersonal
                    ? {
                        name: editingPackName.trim(),
                        fuid: normalizedEditingPackFuid,
                      }
                    : {}),
                  description: editingDescription.trim() || undefined,
                  author: editingAuthor.trim() || undefined,
                  requiresManual: editingRequires,
                  optional: editingOptional,
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
        slotProps={{
          transition: {
            onExited: () => {
              if (pendingNavPackId) {
                handleCompendiumChange(pendingNavPackId);
                setPendingNavPackId(null);
              }
            },
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
        <DialogContent
          sx={{
            pt: "8px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Tabs
            value={importTab}
            onChange={(_, v) => {
              setImportTab(v);
              setImportError("");
            }}
          >
            <Tab label={t("Upload .fcp file")} />
            <Tab
              label={t("From URL")}
              icon={<LinkIcon sx={{ fontSize: "small" }} />}
              iconPosition="end"
            />
          </Tabs>
          {importTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t(
                  "Paste a manifest.json URL to download and import the pack.",
                )}
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
          <Button
            onClick={() => setImportDialogOpen(false)}
            disabled={importing}
          >
            {t("Cancel")}
          </Button>
          {importTab === 1 && (
            <Button
              variant="contained"
              onClick={handleImportUrl}
              disabled={importing || !importUrl.trim()}
              startIcon={
                importing ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FileUploadIcon />
                )
              }
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
