import { useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import CustomTextarea from "/src/components/common/CustomTextarea";
import { magiseeds } from "/src/libs/floralistMagiseedData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";

export default function MagiseedItem({
  item,
  itemIndex,
  onItemChange,
  onDeleteItem,
  onCloneItem,
  t,
}) {
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const theme = useCustomTheme();

  const { isOpen: deleteDialogOpen, closeDialog: closeDeleteDialog, handleDelete } =
    useDeleteConfirmation({ onConfirm: () => onDeleteItem(itemIndex) });

  const isCustom = item.key === "magiseed_custom";
  const magiseedName = isCustom
    ? item.customName || t("Custom Magiseed")
    : t(item.key);

  const handleNameChange = (value) => {
    const preset = magiseeds.find((m) => m.name === value);
    if (!preset) return;
    onItemChange(itemIndex, "key", value);
    if (value !== "magiseed_custom") {
      onItemChange(itemIndex, "description", preset.description);
      onItemChange(itemIndex, "rangeStart", preset.rangeStart || 0);
      onItemChange(itemIndex, "rangeEnd", preset.rangeEnd || 3);
      onItemChange(itemIndex, "effects", preset.effects || {});
      onItemChange(itemIndex, "customName", "");
    }
  };

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "magiseed_custom",
      customName: item.customName || (item.key ? t(item.key) : ""),
      description: typeof item.description === "string" ? t(item.description) : item.description,
      effects: Object.fromEntries(
        Object.entries(item.effects || {}).map(([k, v]) => [k, typeof v === "string" ? t(v) : v]),
      ),
    });
  };

  const subtitle = (
    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: "bold" }}>
      {item.rangeStart !== undefined && item.rangeEnd !== undefined
        ? `T: ${item.rangeStart}–${item.rangeEnd}`
        : ""}
    </Typography>
  );

  const actions = (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ root: { sx: { zIndex: 1400 } } }}
      >
        {onCloneItem && (
          <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); handleCloneToCustom(); }}>
            <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
            <ListItemText>{t("Clone to Custom")}</ListItemText>
          </MenuItem>
        )}
        {onDeleteItem && (
          <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); handleDelete(e); }}>
            <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
            <ListItemText sx={{ color: "error.main" }}>{t("Delete")}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );

  const gradientColor = theme.mode === "dark" ? "#1f1f1f" : "#fff";

  return (
    <>
      <Box sx={{ border: `1px solid ${theme.secondary}`, borderRadius: 1, overflow: "hidden" }}>
        {/* Row header */}
        <Box
          onClick={() => setOpen((v) => !v)}
          sx={{
            display: "flex",
            alignItems: "stretch",
            minHeight: 44,
            background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
            borderBottom: open ? `1px solid ${theme.secondary}` : "none",
            cursor: "pointer",
            "&:hover": { filter: "brightness(0.97)" },
          }}
        >
          {/* Label area */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: "10px",
              py: "4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              noWrap
              sx={{
                fontFamily: "Antonio",
                fontWeight: 800,
                fontSize: "0.95rem",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {magiseedName}
            </Typography>
            {subtitle}
          </Box>
          {/* Actions area */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: theme.primary,
              display: "flex",
              alignItems: "center",
              px: "6px",
              gap: 0.25,
              flexShrink: 0,
              "& .MuiIconButton-root": { p: "2px", width: 32, height: 32, color: theme.white },
              "& .MuiSvgIcon-root": { fontSize: "1.15rem" },
            }}
          >
            {actions}
          </Box>
        </Box>

        <Collapse in={open}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Grid container spacing={2}>
              {/* Name selector */}
              <Grid size={{ xs: 12, sm: isCustom ? 6 : 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Magiseed")}</InputLabel>
                  <Select
                    value={item.key || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    label={t("Magiseed")}
                  >
                    {magiseeds.map((preset) => (
                      <MenuItem key={preset.name} value={preset.name}>
                        {preset.name === "magiseed_custom" ? t("Custom Magiseed") : t(preset.name)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {isCustom && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t("Custom Name")}
                    value={item.customName || ""}
                    onChange={(e) => onItemChange(itemIndex, "customName", e.target.value)}
                  />
                </Grid>
              )}

              {/* Range */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("Range Start")}
                  type="number"
                  value={item.rangeStart ?? 0}
                  onChange={(e) => onItemChange(itemIndex, "rangeStart", parseInt(e.target.value) || 0)}
                  slotProps={{ htmlInput: { min: 0, max: 4 } }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("Range End")}
                  type="number"
                  value={item.rangeEnd ?? 3}
                  onChange={(e) => onItemChange(itemIndex, "rangeEnd", parseInt(e.target.value) || 3)}
                  slotProps={{ htmlInput: { min: 0, max: 4 } }}
                />
              </Grid>

              {/* Description */}
              <Grid size={12}>
                {!isCustom && item.description ? (
                  <Box sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "action.hover" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: "block" }}>
                      {t("Description")}
                    </Typography>
                    <div style={{ fontSize: "0.95em" }}>
                      <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>
                        {t(item.description)}
                      </ReactMarkdown>
                    </div>
                  </Box>
                ) : (
                  <CustomTextarea
                    label={t("Description")}
                    value={item.description || ""}
                    onChange={(e) => onItemChange(itemIndex, "description", e.target.value)}
                    rows={2}
                  />
                )}
              </Grid>

              {/* Effects - only T values within rangeStart..rangeEnd */}
              {Array.from(
                { length: (item.rangeEnd ?? 3) - (item.rangeStart ?? 0) + 1 },
                (_, i) => (item.rangeStart ?? 0) + i,
              ).map((tVal) => {
                const raw = item.effects?.[tVal] ?? "";
                const display = isCustom ? raw : t(raw);
                return (
                  <Grid key={tVal} size={{ xs: 12, sm: 6 }}>
                    {isCustom ? (
                      <CustomTextarea
                        label={`T = ${tVal}`}
                        value={raw}
                        onChange={(e) => onItemChange(itemIndex, "effects", { ...item.effects, [tVal]: e.target.value })}
                        rows={2}
                      />
                    ) : (
                      <Box sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "action.hover" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: "block" }}>
                          {`T = ${tVal}`}
                        </Typography>
                        <div style={{ fontSize: "0.95em" }}>
                          <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>
                            {display}
                          </ReactMarkdown>
                        </div>
                      </Box>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Collapse>
      </Box>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => onDeleteItem(itemIndex)}
        title={t("Delete")}
        message={t("Are you sure you want to delete this magiseed?")}
        itemPreview={<Typography variant="h4">{magiseedName}</Typography>}
      />
    </>
  );
}
