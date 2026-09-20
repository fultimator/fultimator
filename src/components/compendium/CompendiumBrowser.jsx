import React, {
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Drawer,
  Divider,
  Button,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CodeIcon from "@mui/icons-material/Code";
import StarIcon from "@mui/icons-material/Star";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";

import html2canvas from "html2canvas";
import JSZip from "jszip";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import useDownloadImage from "../../hooks/useDownloadImage";
import {
  ITEM_TYPES,
  VIEWER_TO_PACK_TYPE,
  getItems,
  toSlug,
} from "../../libs/compendium";
import {
  CompendiumSidebar,
  ItemCard,
} from "../../routes/compendium/compendium";
import AddToCompendiumButton from "./AddToCompendiumButton";
import Export from "../Export";
import { useCompendiumItems } from "./hooks/useCompendiumItems";

const SIDEBAR_WIDTH = 300;

function afterNextPaint(fn) {
  let inner;
  const outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(fn);
  });
  return () => {
    cancelAnimationFrame(outer);
    if (inner) cancelAnimationFrame(inner);
  };
}

/**
 * Layout-agnostic compendium browser.
 *
 * Renders sidebar + item grid. Does NOT include any Dialog or page wrapper -
 * those stay in callers (compendium.jsx route and CompendiumViewerModal).
 *
 * Filter state is passed in as `filters` (from useCompendiumFilters or
 * URL-param state in the route), and change handlers via `handlers`.
 * Pack data is passed in from the caller's useCompendiumPacks() call.
 *
 * Context-specific action buttons are passed via `renderItemActions`.
 */
const CompendiumBrowser = React.memo(function CompendiumBrowser({
  // Filter state + handlers (from useCompendiumFilters or equivalent)
  filters,
  handlers,
  selectedIdx,
  setSelectedIdx,
  searchQuery,
  setSearchQuery,

  // Multi-select (opt-in; used by import modal to add several items at once)
  allowMultiSelect = false,
  multiSelect = false,
  onMultiSelectModeChange,
  selectedIndices,
  onToggleSelectedIndex,
  onClearSelection,
  onBulkExport,
  onBulkAddToCompendium,

  // Pack data
  packs,
  activePack,

  // Sidebar callbacks (pack management - provided by caller)
  onNewPack,
  onManagePack,
  onToggleLock,
  onOpenQuickCreate,
  onImportPack,

  // Context
  context,
  restrictToTypes,

  // Behavior flags
  showExport = false,
  showShareUrl = false,
  showDownloadImage = false,
  isDesktopOverride, // used by modal to pass its own isDesktop

  // Callbacks
  onShareUrl,
  onSelectedItemChange,

  // Render slots
  renderItemActions, // (item, idx, selectedItem) => ReactNode - extra toolbar buttons
  renderEmptyState, // () => ReactNode - overrides default "no items" message

  // Layout
  sidebarSx,
  mainSx,
}) {
  const { t } = useTranslate();
  const customTheme = useCustomTheme();
  const muiTheme = useTheme();
  const isDesktopMq = useMediaQuery(muiTheme.breakpoints.up("md"));
  const isDesktop =
    isDesktopOverride !== undefined ? isDesktopOverride : isDesktopMq;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef(null);
  const stickyHeaderRef = useRef(null);
  const selectedCardRef = useRef(null);
  const [itemMenuAnchor, setItemMenuAnchor] = useState(null); // { el, idx }
  const [bulkAddAnchor, setBulkAddAnchor] = useState(null);
  const [bulkExportAnchor, setBulkExportAnchor] = useState(null);
  const [bulkImageProgress, setBulkImageProgress] = useState(null); // { done, total } | null
  const [bulkSnackbar, setBulkSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { selectedType, selectedCompendium } = filters;

  const { filteredItems, itemIds, selectedItem } = useCompendiumItems({
    filters,
    activePack,
    selectedIdx,
  });

  useEffect(() => {
    onSelectedItemChange?.(selectedItem ?? null);
  }, [onSelectedItemChange, selectedItem]);

  const [downloadSelectedImage] = useDownloadImage(
    selectedItem?.name ?? "",
    selectedCardRef,
  );

  const handleBulkDownloadImages = useCallback(async () => {
    const indices = Array.from(selectedIndices ?? []);
    if (indices.length === 0) return;

    const background = customTheme.mode === "dark" ? "#1f1f1f" : "#ffffff";
    const zip = new JSZip();
    const usedNames = new Set();
    let failed = 0;

    setBulkImageProgress({ done: 0, total: indices.length });
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i];
      const item = filteredItems[idx];
      const el = document.getElementById(itemIds[idx]);
      if (!el || !item) {
        failed += 1;
        setBulkImageProgress({ done: i + 1, total: indices.length });
        continue;
      }
      try {
        const canvas = await html2canvas(el, {
          logging: false,
          useCORS: true,
          allowTaint: true,
          scale: 2,
          backgroundColor: background,
        });
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png", 1.0),
        );
        if (blob) {
          const baseName = (item.name || `item_${idx}`)
            .replace(/\s+/g, "_")
            .toLowerCase();
          let filename = `${baseName}.png`;
          let suffix = 2;
          while (usedNames.has(filename)) {
            filename = `${baseName}_${suffix}.png`;
            suffix += 1;
          }
          usedNames.add(filename);
          zip.file(filename, blob);
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      }
      setBulkImageProgress({ done: i + 1, total: indices.length });
    }

    setBulkImageProgress(null);
    if (Object.keys(zip.files).length === 0) {
      setBulkSnackbar({
        open: true,
        message: t("Failed to generate images"),
        severity: "error",
      });
      return;
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedType || "items"}_images.zip`;
    a.click();
    URL.revokeObjectURL(url);

    setBulkSnackbar({
      open: true,
      message:
        failed > 0
          ? `${t("Downloaded")} ${indices.length - failed}/${indices.length} ${t("images")}`
          : `${t("Downloaded")} ${indices.length} ${t("images")}`,
      severity: failed > 0 ? "error" : "success",
    });
  }, [
    selectedIndices,
    filteredItems,
    itemIds,
    customTheme.mode,
    selectedType,
    t,
  ]);

  const handleBulkShareLinks = useCallback(() => {
    const indices = Array.from(selectedIndices ?? []);
    if (indices.length === 0) return;

    const urls = indices
      .map((idx) => filteredItems[idx])
      .filter(Boolean)
      .map((item) => {
        const url = new URL(window.location.href);
        url.searchParams.set("type", selectedType);
        if (selectedCompendium !== "official") {
          url.searchParams.set("compendium", selectedCompendium);
        }
        if (item.name) url.searchParams.set("item", toSlug(item.name));
        return url.toString();
      });

    const blob = new Blob([urls.join("\n")], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${selectedType || "items"}_share_links.txt`;
    a.click();
    URL.revokeObjectURL(downloadUrl);
  }, [selectedIndices, filteredItems, selectedType, selectedCompendium]);

  // Scroll selected item into view when selection changes.
  useEffect(() => {
    if (selectedIdx === null || !mainRef.current) return;
    const id = itemIds[selectedIdx];
    if (!id) return;
    return afterNextPaint(() => {
      const container = mainRef.current;
      const el = document.getElementById(id);
      if (!el || !container) return;
      const headerHeight = stickyHeaderRef.current?.offsetHeight ?? 0;
      const extraGap = 12;
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset =
        elRect.top -
        containerRect.top -
        headerHeight -
        extraGap +
        container.scrollTop;
      container.scrollTo({ top: offset, behavior: "smooth" });
    });
  }, [selectedIdx, itemIds]);

  const handleItemClick = useCallback(
    (item, idx, event) => {
      if (multiSelect) {
        onToggleSelectedIndex?.(idx);
        return;
      }
      if (
        (event?.ctrlKey || event?.metaKey) &&
        allowMultiSelect &&
        onMultiSelectModeChange
      ) {
        onMultiSelectModeChange(true);
        onToggleSelectedIndex?.(idx);
        return;
      }
      handlers.handleItemClick(item, idx, { isDesktop, setDrawerOpen });
      if (!isDesktop) setDrawerOpen(false);
    },
    [
      handlers,
      isDesktop,
      multiSelect,
      onToggleSelectedIndex,
      allowMultiSelect,
      onMultiSelectModeChange,
    ],
  );

  // Stable per-item click handlers so ItemCard doesn't re-render due to closures
  const itemClickHandlers = useMemo(
    () =>
      filteredItems.map(
        (item, idx) => (event) => handleItemClick(item, idx, event),
      ),
    [filteredItems, handleItemClick],
  );

  const handleSearchChange = useCallback(
    (q) => {
      setSearchQuery(q);
      setSelectedIdx(null);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    [setSearchQuery, setSelectedIdx],
  );

  const sidebarContent = (
    <CompendiumSidebar
      selectedType={selectedType}
      onTypeChange={(type) =>
        handlers.handleTypeChange(type, { scrollRef: mainRef })
      }
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      filteredItems={filteredItems}
      onItemClick={handleItemClick}
      selectedIdx={selectedIdx}
      selectedSpellClass={filters.selectedSpellClass}
      onSpellClassChange={(cls) =>
        handlers.handleSpellClassChange(cls, { scrollRef: mainRef })
      }
      selectedModuleType={filters.selectedModuleType}
      onModuleTypeChange={(t) =>
        handlers.handleModuleTypeChange(t, { scrollRef: mainRef })
      }
      selectedMagichantSubtype={filters.selectedMagichantSubtype}
      onMagichantSubtypeChange={(s) =>
        handlers.handleMagichantSubtypeChange(s, { scrollRef: mainRef })
      }
      selectedWellspring={filters.selectedWellspring}
      onWellspringChange={(w) =>
        handlers.handleWellspringChange(w, { scrollRef: mainRef })
      }
      selectedQualityFilters={filters.selectedQualityFilters}
      onQualityFiltersChange={(f) =>
        handlers.handleQualityFiltersChange(f, { scrollRef: mainRef })
      }
      selectedQualityCategories={filters.selectedQualityCategories}
      onQualityCategoriesChange={(c) =>
        handlers.handleQualityCategoriesChange(c, { scrollRef: mainRef })
      }
      selectedBook={filters.selectedBook}
      onBookChange={(b) => handlers.handleBookChange(b, { scrollRef: mainRef })}
      selectedHeroicClasses={filters.selectedHeroicClasses}
      onHeroicClassesChange={(c) =>
        handlers.handleHeroicClassesChange(c, { scrollRef: mainRef })
      }
      selectedOptionalSubtypes={filters.selectedOptionalSubtypes}
      onOptionalSubtypesChange={(s) =>
        handlers.handleOptionalSubtypesChange(s, { scrollRef: mainRef })
      }
      selectedEffectTransfer={filters.selectedEffectTransfer}
      onEffectTransferChange={(v) =>
        handlers.handleEffectTransferChange(v, { scrollRef: mainRef })
      }
      selectedEffectApplicableTypes={filters.selectedEffectApplicableTypes}
      onEffectApplicableTypesChange={(v) =>
        handlers.handleEffectApplicableTypesChange(v, { scrollRef: mainRef })
      }
      packs={packs}
      selectedCompendium={selectedCompendium}
      onCompendiumChange={(c) =>
        handlers.handleCompendiumChange(c, {
          scrollRef: mainRef,
          onManageModules: () =>
            handlers.handleCompendiumChange("__manage_modules__"),
        })
      }
      onNewPack={onNewPack}
      onManagePack={onManagePack}
      onImportPack={onImportPack}
      activePack={activePack}
      onToggleLock={onToggleLock}
      onOpenQuickCreate={onOpenQuickCreate}
      restrictToTypes={restrictToTypes}
    />
  );

  const _contextMismatch =
    context &&
    (() => {
      const typeContext = ITEM_TYPES.find(
        (x) => x.key === selectedType,
      )?.context;
      return typeContext && typeContext !== "both" && typeContext !== context;
    })();

  const buildItemActionContent = (item, idx) => {
    const isSelected = idx === selectedIdx;
    if (!isSelected) return null;

    // Caller-provided extras (e.g. "Add Item" button in modal, edit/delete in pack mode)
    const callerActions = renderItemActions
      ? renderItemActions(item, idx, selectedItem)
      : null;

    // Standard toolbar (share, download, export, add-to-pack)
    const standardActions = (
      <>
        {showShareUrl && onShareUrl && (
          <Tooltip title={t("Share URL")}>
            <IconButton size="small" onClick={onShareUrl}>
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {showShareUrl && !onShareUrl && (
          <Tooltip title={t("Share URL")}>
            <IconButton
              size="small"
              onClick={async () => {
                const url = new URL(window.location.href);
                url.searchParams.set("type", selectedType);
                if (selectedCompendium !== "official") {
                  url.searchParams.set("compendium", selectedCompendium);
                }
                if (item?.name) {
                  const { toSlug } = await import("../../libs/compendium");
                  url.searchParams.set("item", toSlug(item.name));
                }
                await navigator.clipboard.writeText(url.toString());
              }}
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {showDownloadImage && (
          <Tooltip title={t("Download as Image")}>
            <IconButton size="small" onClick={downloadSelectedImage}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {VIEWER_TO_PACK_TYPE[selectedType] && (
          <AddToCompendiumButton
            itemType={VIEWER_TO_PACK_TYPE[selectedType]}
            data={item}
            excludePackId={
              selectedCompendium !== "official" ? selectedCompendium : undefined
            }
            tooltipOverride={
              selectedType === "classes" && selectedCompendium === "official"
                ? t("Clone to Custom")
                : undefined
            }
          />
        )}
        {showExport && (
          <Export name={item.name} dataType={selectedType} data={item} />
        )}
      </>
    );

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {standardActions}
        {callerActions}
      </Box>
    );
  };

  // Mobile: collapse standard + caller actions into a menu
  const buildMobileItemActionContent = (item, idx) => {
    const isSelected = idx === selectedIdx;
    if (!isSelected) return null;

    return (
      <>
        <Tooltip title={t("Actions")}>
          <IconButton
            size="small"
            onClick={(e) => setItemMenuAnchor({ el: e.currentTarget, idx })}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={itemMenuAnchor?.idx === idx ? itemMenuAnchor.el : null}
          open={itemMenuAnchor?.idx === idx}
          onClose={() => setItemMenuAnchor(null)}
        >
          {showShareUrl && onShareUrl && (
            <MenuItem
              onClick={() => {
                onShareUrl();
                setItemMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("Share URL")}</ListItemText>
            </MenuItem>
          )}
          {showDownloadImage && (
            <MenuItem
              onClick={() => {
                downloadSelectedImage();
                setItemMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("Download as Image")}</ListItemText>
            </MenuItem>
          )}
          {VIEWER_TO_PACK_TYPE[selectedType] && (
            <Box sx={{ px: 1 }}>
              <AddToCompendiumButton
                itemType={VIEWER_TO_PACK_TYPE[selectedType]}
                data={item}
                excludePackId={
                  selectedCompendium !== "official"
                    ? selectedCompendium
                    : undefined
                }
              />
            </Box>
          )}
          {showExport && (
            <Box sx={{ px: 1 }}>
              <Export name={item.name} dataType={selectedType} data={item} />
            </Box>
          )}
          {renderItemActions && renderItemActions(item, idx, selectedItem)}
        </Menu>
      </>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        width: "100%",
        ...mainSx,
      }}
    >
      {/* ---- Desktop sidebar ---- */}
      {isDesktop && (
        <Box
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            ...sidebarSx,
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* ---- Mobile drawer ---- */}
      {!isDesktop && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          slotProps={{ paper: { sx: { width: "85vw", maxWidth: 340 } } }}
          sx={{ zIndex: 1400 }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ flex: 1, overflow: "hidden" }}>{sidebarContent}</Box>
        </Drawer>
      )}

      {/* ---- Main content ---- */}
      <Box ref={mainRef} sx={{ flex: 1, overflowY: "auto" }}>
        {/* Header row (sticky) */}
        <Box
          ref={stickyHeaderRef}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            px: { xs: 1.5, md: 2 },
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "background.default",
            borderBottom: `1px solid ${muiTheme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {!isDesktop ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {t(
                    ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? "",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ({filteredItems.length})
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {t(ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? "")}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: "text.secondary", ml: 1 }}
                >
                  ({filteredItems.length} {t("items")})
                </Typography>
              </Typography>
            )}

            {allowMultiSelect && onMultiSelectModeChange && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ToggleButtonGroup
                  size="small"
                  value={multiSelect ? "multi" : "single"}
                  exclusive
                  onChange={(_e, value) => {
                    if (value === null) return;
                    onMultiSelectModeChange(value === "multi");
                  }}
                >
                  <ToggleButton value="single">
                    <Tooltip title={t("Select one item")}>
                      <LooksOneIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="multi">
                    <Tooltip title={t("Select multiple items")}>
                      <ChecklistIcon fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title={t("Clear selection")}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={!multiSelect || !(selectedIndices?.size > 0)}
                      onClick={onClearSelection}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>

          {multiSelect && selectedIndices?.size > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {bulkImageProgress
                  ? `${t("Capturing")} ${bulkImageProgress.done}/${bulkImageProgress.total}`
                  : `${selectedIndices.size} ${t("selected")}`}
              </Typography>
              {showShareUrl && (
                <Tooltip title={t("Share Links (.txt)")}>
                  <IconButton size="small" onClick={handleBulkShareLinks}>
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t("Download Images (.zip)")}>
                <span>
                  <IconButton
                    size="small"
                    disabled={Boolean(bulkImageProgress)}
                    onClick={handleBulkDownloadImages}
                  >
                    {bulkImageProgress ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DownloadIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              {onBulkAddToCompendium && (
                <>
                  <Tooltip title={t("Add Selected to Compendium")}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        if ((packs?.length ?? 0) > 0) {
                          setBulkAddAnchor(e.currentTarget);
                        } else {
                          onBulkAddToCompendium(undefined);
                        }
                      }}
                    >
                      <LibraryAddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={bulkAddAnchor}
                    open={Boolean(bulkAddAnchor)}
                    onClose={() => setBulkAddAnchor(null)}
                  >
                    {(packs ?? []).map((pack) => (
                      <MenuItem
                        key={pack.id}
                        disabled={!!pack.locked}
                        onClick={() => {
                          setBulkAddAnchor(null);
                          onBulkAddToCompendium(pack.id);
                        }}
                      >
                        <ListItemIcon>
                          {pack.isPersonal ? (
                            <StarIcon fontSize="small" color="warning" />
                          ) : (
                            <CollectionsBookmarkIcon fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText>{pack.name}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
              {onBulkExport && (
                <>
                  <Tooltip title={t("Export Selected")}>
                    <IconButton
                      size="small"
                      onClick={(e) => setBulkExportAnchor(e.currentTarget)}
                    >
                      <CodeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={bulkExportAnchor}
                    open={Boolean(bulkExportAnchor)}
                    onClose={() => setBulkExportAnchor(null)}
                  >
                    <MenuItem
                      onClick={() => {
                        setBulkExportAnchor(null);
                        onBulkExport("json");
                      }}
                    >
                      {t("Export as JSON (.zip)")}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setBulkExportAnchor(null);
                        onBulkExport("markdown");
                      }}
                    >
                      {t("Export as Markdown (.zip)")}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setBulkExportAnchor(null);
                        onBulkExport("plain");
                      }}
                    >
                      {t("Export as Plaintext (.zip)")}
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2 }, pt: 1 }}>
          {filteredItems.length === 0 ? (
            renderEmptyState ? (
              renderEmptyState()
            ) : (
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
                      {packs?.length > 0 &&
                        handlers?.handleCompendiumChange && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handlers.handleCompendiumChange(packs[0].id)
                            }
                            sx={{ mt: 2 }}
                          >
                            {t("Go to personal compendium")}
                          </Button>
                        )}
                    </Box>
                  )}
                {selectedCompendium !== "official" && (
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
                      {t("Create a new one.")}
                    </Typography>
                    {onOpenQuickCreate && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={onOpenQuickCreate}
                        sx={{ mt: 2 }}
                      >
                        {t("Create a new one.")}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )
          ) : (
            <Grid container spacing={2}>
              {filteredItems.map((item, idx) => {
                const isSelected = multiSelect
                  ? Boolean(selectedIndices?.has(idx))
                  : idx === selectedIdx;
                return (
                  <Grid
                    key={itemIds[idx]}
                    size={{ xs: 12, lg: selectedType === "classes" ? 12 : 6 }}
                    sx={{ contain: "layout paint" }}
                  >
                    <Box
                      ref={!multiSelect && isSelected ? selectedCardRef : null}
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        border: isSelected
                          ? `2px solid ${customTheme.primary}`
                          : "2px solid transparent",
                        transition: "border-color 0.15s ease",
                        contain: "content",
                        scrollMarginTop: { xs: 88, md: 96 },
                      }}
                    >
                      {multiSelect && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelectedIndex?.(idx);
                          }}
                          sx={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            zIndex: 1,
                            p: "3px",
                            bgcolor: isSelected
                              ? customTheme.primary
                              : "rgba(0, 0, 0, 0.35)",
                            "&:hover": {
                              bgcolor: isSelected
                                ? customTheme.primary
                                : "rgba(0, 0, 0, 0.5)",
                            },
                          }}
                        >
                          {isSelected ? (
                            <CheckCircleIcon
                              fontSize="small"
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              fontSize="small"
                              sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                            />
                          )}
                        </IconButton>
                      )}
                      <ItemCard
                        type={selectedType}
                        item={item}
                        id={itemIds[idx]}
                        onHeaderClick={itemClickHandlers[idx]}
                        showImageToggle={!multiSelect && isSelected}
                        actionContent={
                          multiSelect
                            ? null
                            : isDesktop
                              ? buildItemActionContent(item, idx)
                              : buildMobileItemActionContent(item, idx)
                        }
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>

      <Snackbar
        open={bulkSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setBulkSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={bulkSnackbar.severity} variant="filled">
          {bulkSnackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default CompendiumBrowser;
