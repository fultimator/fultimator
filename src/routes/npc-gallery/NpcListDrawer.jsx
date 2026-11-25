import { useMemo, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGridApiRef } from "@mui/x-data-grid";
import { useTranslate } from "../../translation/translate";
import { SIDEBAR_WIDTH } from "./listPreview/constants";
import NpcGrid from "./listPreview/NpcGrid";
import { PAGE_SIZE, sortItems } from "./listPreview/utils";

export default function NpcListDrawer({
  open,
  onClose,
  items: sourceItems,
  selectMode,
  selectedIds,
  onSelectionChange,
  onSelect,
  activeId,
  columns,
  title,
  persistent,
  top = 0,
  width = SIDEBAR_WIDTH,
}) {
  const large = useMediaQuery("(min-width: 1600px)");
  const { t } = useTranslate();
  const apiRef = useGridApiRef();
  const [sortModel, setSortModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const items = useMemo(
    () => sortItems(sourceItems, sortModel),
    [sourceItems, sortModel],
  );

  return (
    <Drawer
      anchor="left"
      variant={persistent ? "persistent" : "temporary"}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: persistent
            ? (theme) => ({
                width,
                top,
                height: `calc(100% - ${top}px)`,
                zIndex: theme.zIndex.appBar - 2,
              })
            : { width: "100vw", maxWidth: "none" },
        },
      }}
      sx={{
        zIndex: (theme) => (persistent ? theme.zIndex.appBar - 2 : 1400),
      }}
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
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <NpcGrid
          columns={columns}
          items={items}
          activeId={activeId}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
          apiRef={apiRef}
          hideRank={persistent}
          compact={!persistent}
          large={persistent && large}
          onRowClick={({ id }) => {
            onSelect(id);
            if (!selectMode && !persistent) onClose();
          }}
        />
      </Box>
    </Drawer>
  );
}
