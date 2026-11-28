import { useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import { useGridApiRef } from "@mui/x-data-grid";
import { useTranslate } from "../../translation/translate";
import { PREVIEW_WIDTHS } from "./listPreview/constants";
import CardStack from "./listPreview/CardStack";
import NpcGrid from "./listPreview/NpcGrid";
import { useAppBarTop } from "./listPreview/useAppBarTop";
import { useFitHeight } from "./listPreview/useFitHeight";
import { useLockPageScroll } from "./listPreview/useLockPageScroll";
import { useScrollSync } from "./listPreview/useScrollSync";
import { PAGE_SIZE, sortItems } from "./listPreview/utils";

const DEFAULT_TOP = 80;
const MOBILE_HEADER_HEIGHT = 48;
const VIEWPORT_ROOT = { current: null };

export default function NpcListPreview({
  items: sourceItems,
  selectMode,
  selectedIds,
  onSelectionChange,
  renderCard,
  stickyTop = DEFAULT_TOP,
  title,
  emptyText,
  columns,
  previewSize = "tablet",
}) {
  const { t } = useTranslate();
  const desktop = useMediaQuery("(min-width: 900px)");
  const apiRef = useGridApiRef();
  const rowRef = useRef(null);
  const previewRef = useRef(null);

  const [activeId, setActiveId] = useState(sourceItems[0]?.id);
  const [sortModel, setSortModel] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });

  const items = useMemo(
    () => sortItems(sourceItems, sortModel),
    [sourceItems, sortModel],
  );
  const current = items.some((npc) => npc.id === activeId)
    ? activeId
    : items[0]?.id;

  const headerTop = useAppBarTop();
  const mobileTop = headerTop + MOBILE_HEADER_HEIGHT;

  const { scrollToCard, registerCard } = useScrollSync({
    items,
    current,
    setActiveId,
    apiRef,
    setPaginationModel,
    previewRef,
    desktop,
    mobileTop,
  });
  useFitHeight(rowRef, stickyTop, desktop);
  useLockPageScroll(desktop);

  const grid = (
    <NpcGrid
      columns={columns}
      items={items}
      activeId={current}
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      selectMode={selectMode}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      apiRef={apiRef}
      onRowClick={({ id }) => {
        setActiveId(id);
        scrollToCard(id);
        if (!desktop && !selectMode) setDrawerOpen(false);
      }}
    />
  );

  const stack = (scrollRoot, scrollMarginTop) => (
    <CardStack
      items={items}
      renderCard={renderCard}
      registerCard={registerCard}
      scrollRoot={scrollRoot}
      scrollMarginTop={scrollMarginTop}
      emptyText={emptyText}
    />
  );

  if (desktop) {
    return (
      <Box
        ref={rowRef}
        sx={{
          display: "flex",
          gap: 2,
          position: "sticky",
          top: stickyTop,
          height: `calc(100vh - ${stickyTop + 16}px)`,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            width: "40%",
            minWidth: 420,
            flexShrink: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          {grid}
        </Paper>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            ref={previewRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              scrollbarGutter: "stable",
              pr: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: PREVIEW_WIDTHS[previewSize],
                mx: "auto",
              }}
            >
              {stack(previewRef, 0)}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const currentIndex = items.findIndex((npc) => npc.id === current);
  const scrollToActiveRow = () =>
    currentIndex >= 0 &&
    apiRef.current?.scrollToIndexes?.({ rowIndex: currentIndex % PAGE_SIZE });

  return (
    <Box>
      <Box
        sx={{
          position: "sticky",
          top: headerTop,
          zIndex: 2,
          height: MOBILE_HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1,
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton
          size="small"
          onClick={() => setDrawerOpen(true)}
          aria-label={title ?? t("Adversaries")}
        >
          <MenuIcon />
        </IconButton>
        <Typography noWrap sx={{ flex: 1, fontWeight: 700 }}>
          {items[currentIndex]?.name || (title ?? t("Adversaries"))}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentIndex + 1} / {items.length}
        </Typography>
      </Box>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: { sx: { width: "90vw", maxWidth: 380 } },
          transition: { onEntered: scrollToActiveRow },
        }}
        sx={{ zIndex: 1400 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pl: 2,
            pr: 1,
            py: 0.5,
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            {title ?? t("Adversaries")} ({items.length})
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, minHeight: 0 }}>{grid}</Box>
      </Drawer>

      <Box sx={{ pt: 1 }}>{stack(VIEWPORT_ROOT, mobileTop + 8)}</Box>
    </Box>
  );
}
