import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslate } from "../translation/translate";
import { sectionHeadingSx } from "./shared/actors/common/sectionHeadingSx";
import IconCreditsDetail, { Preview } from "./IconCreditsDetail";
import { iconCredits, type IconAsset } from "../libs/iconCredits";

const ALL = "all";

const scrollRowSx = {
  display: "flex",
  gap: 0.75,
  overflowX: "auto",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  "& > *": { flexShrink: 0 },
} as const;

interface ChipRowProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium";
  sx?: object;
}

function ChipRow({ options, value, onChange, size, sx }: ChipRowProps) {
  return (
    <Box sx={{ ...scrollRowSx, ...sx }}>
      {options.map((o) => (
        <Chip
          key={o.value}
          size={size}
          label={o.label}
          onClick={() => onChange(o.value)}
          color={o.value === value ? "primary" : "default"}
          variant={o.value === value ? "filled" : "outlined"}
        />
      ))}
    </Box>
  );
}

function IconTile({
  asset,
  active,
  onSelect,
}: {
  asset: IconAsset;
  active: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      aria-label={`${asset.name} - ${asset.author}`}
      aria-pressed={active}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        p: 0.75,
        cursor: "pointer",
        font: "inherit",
        color: "text.primary",
        bgcolor: active
          ? alpha(theme.palette.primary.main, 0.12)
          : "transparent",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        borderRadius: 1,
        "&:hover, &:focus-visible": {
          borderColor: "primary.main",
          outline: "none",
        },
      }}
    >
      <Preview src={asset.url} alt="" size={40} />
      <Typography
        variant="caption"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {asset.name.replace(/\.[^.]+$/, "")}
      </Typography>
    </Box>
  );
}

export default function IconCreditsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const twoPane = useMediaQuery(theme.breakpoints.up("md"));
  const { authors, assets } = iconCredits;

  const [author, setAuthor] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IconAsset | null>(null);

  const authorOptions = useMemo(() => {
    const counts = new Map<string, number>();
    assets.forEach((a) =>
      counts.set(a.author, (counts.get(a.author) ?? 0) + 1),
    );
    return [
      { value: ALL, label: `${t("All")} · ${assets.length}` },
      ...[...counts]
        .sort((a, b) => b[1] - a[1])
        .map(([name, n]) => ({ value: name, label: `${name} · ${n}` })),
    ];
  }, [assets, t]);

  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: t("All") },
      ...[...new Set(assets.map((a) => a.category))].sort().map((c) => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    ],
    [assets, t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter(
      (a) =>
        (author === ALL || a.author === author) &&
        (category === ALL || a.category === category) &&
        a.name.toLowerCase().includes(q),
    );
  }, [assets, author, category, query]);

  const findAuthor = (name?: string) => authors.find((a) => a.name === name);
  const showDetailBar = !twoPane && (selected || author !== ALL);

  const detail = (
    <IconCreditsDetail
      asset={selected}
      assetAuthor={findAuthor(selected?.author)}
      filterAuthor={author === ALL ? undefined : findAuthor(author)}
      compact={!twoPane}
      onClear={() => setSelected(null)}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      slotProps={{ paper: { sx: { height: { sm: "85vh" } } } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 1 }}>
        <Typography
          component="span"
          sx={{
            ...sectionHeadingSx,
            color: "inherit",
            fontSize: "1.25rem",
            flexGrow: 1,
          }}
        >
          {t("icon_credits")}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label={t("Close")}
          sx={{ color: "inherit" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Box
          sx={{
            px: 2,
            py: { xs: 1, sm: 1.5 },
            flexShrink: 0,
            display: "grid",
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {t("icon_credits_intro")}
          </Typography>
          <ChipRow
            options={authorOptions}
            value={author}
            onChange={setAuthor}
            sx={{ gap: 1, flexWrap: { sm: "wrap" } }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <TextField
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search")}
              sx={{ width: { sm: 240 }, flexShrink: 0 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <ChipRow
              size="small"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />
          </Box>
        </Box>
        <Divider />

        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", p: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              {filtered.length} / {assets.length}
            </Typography>
            {filtered.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("icon_credits_empty")}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                  gap: 1,
                }}
              >
                {filtered.map((asset) => {
                  const active = selected?.path === asset.path;
                  return (
                    <IconTile
                      key={asset.path}
                      asset={asset}
                      active={active}
                      onSelect={() => setSelected(active ? null : asset)}
                    />
                  );
                })}
              </Box>
            )}
          </Box>

          {twoPane && (
            <Box
              sx={{
                width: 300,
                flexShrink: 0,
                overflowY: "auto",
                p: 2,
                borderLeft: "1px solid",
                borderColor: "divider",
              }}
            >
              {detail}
            </Box>
          )}
        </Box>

        {showDetailBar && (
          <Box
            sx={{
              flexShrink: 0,
              maxHeight: "40%",
              overflowY: "auto",
              p: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {detail}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
