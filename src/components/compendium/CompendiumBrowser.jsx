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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";

import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import useDownloadImage from "../../hooks/useDownloadImage";
import {
  ITEM_TYPES,
  VIEWER_TO_PACK_TYPE,
  getItems,
} from "../../libs/compendium";
import {
  CompendiumSidebar,
  ItemCard,
} from "../../routes/compendium/compendium";
import AddToCompendiumButton from "./AddToCompendiumButton";
import Export from "../Export";
import { useCompendiumItems } from "./hooks/useCompendiumItems";

const SIDEBAR_WIDTH = 300;

/**
 * Layout-agnostic compendium browser.
 *
 * Renders sidebar + item grid. Does NOT include any Dialog or page wrapper —
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

  // Pack data
  packs,
  activePack,

  // Sidebar callbacks (pack management — provided by caller)
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
  renderItemActions, // (item, idx, selectedItem) => ReactNode — extra toolbar buttons
  renderEmptyState, // () => ReactNode — overrides default "no items" message

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
  const selectedCardRef = useRef(null);
  const [itemMenuAnchor, setItemMenuAnchor] = useState(null); // { el, idx }

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

  // Scroll selected item into view when selection changes
  useEffect(() => {
    if (selectedIdx === null || !mainRef.current) return;
    const id = itemIds[selectedIdx];
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedIdx, itemIds]);

  const handleItemClick = useCallback(
    (item, idx) => {
      handlers.handleItemClick(item, idx, { isDesktop, setDrawerOpen });
      if (!isDesktop) setDrawerOpen(false);
    },
    [handlers, isDesktop],
  );

  // Stable per-item click handlers so ItemCard doesn't re-render due to closures
  const itemClickHandlers = useMemo(
    () => filteredItems.map((item, idx) => () => handleItemClick(item, idx)),
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

  const contextMismatch =
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
        {showExport && (
          <Export name={item.name} dataType={selectedType} data={item} />
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
          {showExport && (
            <Box sx={{ px: 1 }}>
              <Export name={item.name} dataType={selectedType} data={item} />
            </Box>
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
          {renderItemActions && renderItemActions(item, idx, selectedItem)}
        </Menu>
      </>
    );
  };

  return (
    <Box
      sx={{ display: "flex", height: "100%", overflow: "hidden", ...mainSx }}
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
      <Box
        ref={mainRef}
        sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, md: 2 } }}
      >
        {/* Mobile header row */}
        {!isDesktop && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {t(ITEM_TYPES.find((x) => x.key === selectedType)?.label ?? "")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ({filteredItems.length})
            </Typography>
          </Box>
        )}

        {/* Desktop section title */}
        {isDesktop && (
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
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
                  <>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "text.secondary",
                        maxWidth: 480,
                        fontWeight: 400,
                      }}
                    >
                      {t(
                        "This item type is not covered under the third party license and has no official data.",
                      )}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", maxWidth: 480 }}
                    >
                      {t(
                        "You can create custom items by switching to your personal compendium.",
                      )}
                    </Typography>
                    {packs?.length > 0 && handlers?.handleCompendiumChange && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handlers.handleCompendiumChange(packs[0].id)
                        }
                        sx={{ mt: 1 }}
                      >
                        {t("Go to personal compendium")}
                      </Button>
                    )}
                  </>
                )}
            </Box>
          )
        ) : (
          <Grid container spacing={2}>
            {filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIdx;
              return (
                <Grid
                  key={itemIds[idx]}
                  size={{ xs: 12, lg: selectedType === "classes" ? 12 : 6 }}
                  sx={{ contain: "layout paint" }}
                >
                  <Box
                    ref={isSelected ? selectedCardRef : null}
                    sx={{
                      borderRadius: 2,
                      border: isSelected
                        ? `2px solid ${customTheme.primary}`
                        : "2px solid transparent",
                      transition: "border-color 0.15s ease",
                      contain: "content",
                    }}
                  >
                    <ItemCard
                      type={selectedType}
                      item={item}
                      id={itemIds[idx]}
                      onHeaderClick={itemClickHandlers[idx]}
                      showImageToggle={isSelected}
                      actionContent={
                        isDesktop
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
  );
});

export default CompendiumBrowser;
