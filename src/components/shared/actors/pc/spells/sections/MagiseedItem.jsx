import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Delete, ContentCopy } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { magiseeds } from "/src/libs/floralistMagiseedData";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  magiseedItemFields,
  DEFAULT_SUBITEM_TABS,
} from "/src/forms/rendering/config/itemConfigs/spells/subitems/magiseed";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

function toFormState(src, t) {
  const custom = (src.key || "magiseed_custom") === "magiseed_custom";
  const raw = src.effects || {};
  const effects = { 0: "", 1: "", 2: "", 3: "" };
  for (const k of [0, 1, 2, 3]) {
    const v = raw[k] || "";
    effects[k] = custom ? v : v ? t(v) : "";
  }
  return {
    key: src.key || "magiseed_custom",
    customName: src.customName || "",
    description: custom
      ? src.description || ""
      : src.description
        ? t(src.description)
        : "",
    rangeStart: src.rangeStart ?? 0,
    rangeEnd: src.rangeEnd ?? 3,
    effects,
    behaviors: src.behaviors ?? [],
  };
}

export default function MagiseedItem({
  item,
  itemIndex,
  onReplaceItem,
  onDeleteItem,
  onCloneItem,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [formState, setFormState] = useState(() => toFormState(item, t));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setFormState(toFormState(item, t));
  }, [item]);

  const {
    isOpen: deleteDialogOpen,
    closeDialog: closeDeleteDialog,
    handleDelete,
  } = useDeleteConfirmation({ onConfirm: () => onDeleteItem(itemIndex) });

  const handleChange = (next) => {
    const prevKey = formState.key;
    const nextKey = next.key;

    if (nextKey !== prevKey && nextKey !== "magiseed_custom") {
      const preset = magiseeds.find((m) => m.name === nextKey);
      if (preset) {
        const rawEffects = {
          0: "",
          1: "",
          2: "",
          3: "",
          ...(preset.effects || {}),
        };
        const displayEffects = { 0: "", 1: "", 2: "", 3: "" };
        for (const k of [0, 1, 2, 3]) {
          displayEffects[k] = rawEffects[k] ? t(rawEffects[k]) : "";
        }
        const resolved = {
          ...next,
          key: nextKey,
          customName: "",
          description: t(preset.description || ""),
          rangeStart: preset.rangeStart ?? 0,
          rangeEnd: preset.rangeEnd ?? 3,
          effects: displayEffects,
        };
        setFormState(resolved);
        onReplaceItem(itemIndex, {
          ...resolved,
          description: preset.description || "",
          effects: rawEffects,
        });
        return;
      }
    }

    setFormState(next);
    onReplaceItem(itemIndex, next);
  };

  const isCustom = formState.key === "magiseed_custom";
  const magiseedName = isCustom
    ? formState.customName || t("Custom Magiseed")
    : t(formState.key);

  const handleCloneToCustom = () => {
    if (!onCloneItem) return;
    onCloneItem(itemIndex, {
      ...item,
      key: "magiseed_custom",
      customName:
        formState.customName || (formState.key ? t(formState.key) : ""),
      description: formState.description,
      effects: { ...formState.effects },
    });
  };

  const subtitle = (
    <Typography
      variant="caption"
      sx={{ color: "text.secondary", fontWeight: "bold" }}
    >
      {formState.rangeStart !== undefined && formState.rangeEnd !== undefined
        ? `T: ${formState.rangeStart}–${formState.rangeEnd}`
        : ""}
    </Typography>
  );

  const gradientColor = theme.mode === "dark" ? "#1f1f1f" : "#fff";

  return (
    <>
      <Box
        sx={{
          border: `1px solid ${theme.secondary}`,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
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
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              bgcolor: theme.primary,
              display: "flex",
              alignItems: "center",
              px: "6px",
              gap: 0.25,
              flexShrink: 0,
              "& .MuiIconButton-root": {
                p: "2px",
                width: 32,
                height: 32,
                color: theme.white,
              },
              "& .MuiSvgIcon-root": { fontSize: "1.15rem" },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{ root: { sx: { zIndex: 1400 } } }}
            >
              {onCloneItem && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor(null);
                    handleCloneToCustom();
                  }}
                >
                  <ListItemIcon>
                    <ContentCopy fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{t("Clone to Custom")}</ListItemText>
                </MenuItem>
              )}
              {onDeleteItem && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor(null);
                    handleDelete(e);
                  }}
                >
                  <ListItemIcon>
                    <Delete fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText sx={{ color: "error.main" }}>
                    {t("Delete")}
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>

        {open && (
          <Box sx={{ px: 2, py: 1.5 }} onClick={(e) => e.stopPropagation()}>
            <TabbedSchemaFormRenderer
              tabs={DEFAULT_SUBITEM_TABS}
              config={magiseedItemFields}
              state={formState}
              onChange={handleChange}
              surface="edit"
              cols={2}
            />
          </Box>
        )}
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
