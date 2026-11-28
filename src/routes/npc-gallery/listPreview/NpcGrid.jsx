import { useMemo } from "react";
import { Avatar, Box, useMediaQuery } from "@mui/material";
import { alpha, lighten } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslate } from "../../../translation/translate";
import { formatRank, PAGE_SIZE } from "./utils";
import beastToken from "/images/routes/icons/species/Beast-token.webp";
import constructToken from "/images/routes/icons/species/Construct-token.webp";
import demonToken from "/images/routes/icons/species/Demon-token.webp";
import elementalToken from "/images/routes/icons/species/Elemental-token.webp";
import humanToken from "/images/routes/icons/species/Human-token.webp";
import monsterToken from "/images/routes/icons/species/Monster-token.webp";
import plantToken from "/images/routes/icons/species/Plant-token.webp";
import undeadToken from "/images/routes/icons/species/Undead-token.webp";

const SPECIES_TOKENS = {
  Beast: beastToken,
  Construct: constructToken,
  Demon: demonToken,
  Elemental: elementalToken,
  Humanoid: humanToken,
  Monster: monsterToken,
  Plant: plantToken,
  Undead: undeadToken,
};

const includeIds = (ids) => ({ type: "include", ids });

const gridSx = (theme, compact, large) => {
  const primary = theme.palette.primary.main;
  const dark = theme.palette.mode === "dark";
  const accent = dark ? lighten(primary, 0.7) : primary;
  const tint = dark ? 0.3 : 0.13;
  const contrast = theme.palette.primary.contrastText;
  const header = ".MuiDataGrid-columnHeader";
  const row = ".MuiDataGrid-row";
  return {
    border: 0,
    fontSize: compact ? "0.8rem" : large ? "1rem" : "0.9rem",
    "& .MuiDataGrid-cell:not(.MuiDataGrid-cellCheckbox), & .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeaderCheckbox)":
      { px: compact ? 0.75 : 1.5 },
    "& .MuiDataGrid-cellCheckbox, & .MuiDataGrid-columnHeaderCheckbox": {
      px: 0,
      justifyContent: "center",
    },
    "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" },
    "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within":
      { outline: "none" },
    [`& .MuiDataGrid-columnHeaders, & ${header}, & .MuiDataGrid-columnHeaders .MuiDataGrid-filler`]:
      { backgroundColor: primary, color: contrast },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontSize: "0.8rem",
      fontWeight: 700,
      textTransform: "uppercase",
    },
    [`& ${header} .MuiSvgIcon-root, & ${header} .MuiCheckbox-root`]: {
      color: contrast,
    },
    "& .MuiDataGrid-columnSeparator": { color: alpha(contrast, 0.4) },
    [`& ${header} .MuiIconButton-root`]: {
      backgroundColor: "transparent",
      color: contrast,
      "&:hover": { backgroundColor: alpha(contrast, 0.2) },
    },
    [`& ${row}`]: { cursor: "pointer", borderLeft: "3px solid transparent" },
    [`& ${row}:hover`]: { backgroundColor: alpha(primary, tint) },
    [`& ${row}.Mui-selected`]: {
      backgroundColor: alpha(primary, tint),
      borderLeft: `3px solid ${accent}`,
      color: accent,
    },
    [`& ${row}.Mui-selected:hover`]: {
      backgroundColor: alpha(primary, tint + 0.05),
    },
    [`& ${row}.Mui-selected .npc-name-cell`]: { fontWeight: 700 },
    "& .MuiDataGrid-footerContainer": {
      minHeight: 40,
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    "& .MuiTablePagination-toolbar": { minHeight: 40, height: 40 },
  };
};

export default function NpcGrid({
  items,
  activeId,
  sortModel,
  onSortModelChange,
  paginationModel,
  onPaginationModelChange,
  selectMode,
  selectedIds,
  onSelectionChange,
  onRowClick,
  apiRef,
  hideRank,
  compact,
  large,
  columns: customColumns,
}) {
  const { t } = useTranslate();
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const defaultColumns = useMemo(
    () => [
      {
        field: "name",
        headerName: t("Name"),
        flex: 2,
        minWidth: compact ? 80 : 160,
        cellClassName: "npc-name-cell",
      },
      {
        field: "lvl",
        headerName: t("Lvl"),
        type: "number",
        width: compact ? 48 : 72,
        headerAlign: "left",
        align: "left",
      },
      {
        field: "species",
        headerName: t("Species"),
        flex: 1,
        minWidth: compact ? 90 : 110,
        renderCell: ({ value }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: compact ? 0.5 : 1,
            }}
          >
            <Avatar
              src={SPECIES_TOKENS[value]}
              alt=""
              sx={{
                width: compact ? 20 : large ? 30 : 26,
                height: compact ? 20 : large ? 30 : 26,
              }}
            />
            {t(value)}
          </Box>
        ),
      },
      {
        field: "rank",
        headerName: t("Rank"),
        flex: 1,
        minWidth: compact ? 72 : 130,
        valueGetter: (_value, row) => formatRank(row.rank),
      },
    ],
    [t, compact, large],
  );
  const columns = customColumns ?? defaultColumns;

  const selectionModel = useMemo(
    () =>
      includeIds(
        selectMode
          ? selectedIds
          : new Set(activeId === undefined ? [] : [activeId]),
      ),
    [selectMode, selectedIds, activeId],
  );

  const handleSelectionChange = (model) => {
    if (!selectMode) return;
    const ids =
      model.type === "exclude"
        ? new Set(items.map((npc) => npc.id).filter((id) => !model.ids.has(id)))
        : model.ids;
    onSelectionChange(new Set(ids));
  };

  return (
    <DataGrid
      apiRef={apiRef}
      rows={items}
      columns={columns}
      density="compact"
      columnVisibilityModel={{ rank: !(hideRank || isPhone) }}
      rowHeight={isPhone ? (large ? 52 : 48) : large ? 50 : 44}
      columnHeaderHeight={isPhone ? 44 : 40}
      disableColumnMenu
      hideFooterSelectedRowCount
      checkboxSelection={selectMode}
      disableMultipleRowSelection={!selectMode}
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={handleSelectionChange}
      onRowClick={onRowClick}
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={[PAGE_SIZE]}
      sx={(theme) => gridSx(theme, compact, large)}
    />
  );
}
