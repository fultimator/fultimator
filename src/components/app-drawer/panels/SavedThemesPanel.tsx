import React, { useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import { themeSlug } from "../../../utils/themePackCodec";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";
import type { PackTheme, CompendiumPack } from "../../../types/CompendiumPack";

interface FlatTheme {
  theme: PackTheme;
  pack: CompendiumPack;
}

interface ThemeRowMenuProps {
  flat: FlatTheme;
  onApply: (packId: string, themeId: string) => Promise<void>;
  onDelete: (packId: string, themeId: string) => Promise<void>;
  onSnackbar: (msg: string) => void;
}

function ThemeRowMenu({
  flat,
  onApply,
  onDelete,
  onSnackbar,
}: ThemeRowMenuProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [applying, setApplying] = useState(false);

  const doDelete = async () => {
    try {
      await onDelete(flat.pack.id, flat.theme.id);
      onSnackbar(`"${flat.theme.name}" deleted`);
    } catch (e) {
      onSnackbar(e instanceof Error ? e.message : "Failed to delete theme");
    }
  };

  const {
    isOpen: deleteOpen,
    closeDialog,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: doDelete,
  });

  const handleApply = async () => {
    setAnchor(null);
    setApplying(true);
    try {
      await onApply(flat.pack.id, flat.theme.id);
      onSnackbar("Theme applied");
    } catch (e) {
      onSnackbar(e instanceof Error ? e.message : "Failed to apply theme");
    } finally {
      setApplying(false);
    }
  };

  const handleExportJSON = () => {
    setAnchor(null);
    const payload = {
      schema: "fultimator.theme@1",
      id: flat.theme.id,
      name: flat.theme.name,
      description: flat.theme.description,
      baseTheme: flat.theme.baseTheme,
      styleProfile: flat.theme.styleProfile,
      isDarkMode: flat.theme.isDarkMode,
      customization: flat.theme.customization,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${themeSlug(flat.theme.name)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = () => {
    setAnchor(null);
    handleDelete();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={applying}
      >
        {applying ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          <MoreVertIcon fontSize="small" />
        )}
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleApply} dense>
          <CheckIcon fontSize="small" sx={{ mr: 1 }} />
          Apply
        </MenuItem>
        <MenuItem onClick={handleExportJSON} dense>
          <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export JSON
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          dense
          disabled={flat.pack.locked}
          sx={{ color: flat.pack.locked ? undefined : "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onClose={closeDialog}
        onConfirm={doDelete}
        title="Delete Theme"
        message={`Delete "${flat.theme.name}"?`}
        enableCtrlBypass={false}
      />
    </>
  );
}

interface PackGroupProps {
  pack: CompendiumPack;
  themes: PackTheme[];
  onApply: (packId: string, themeId: string) => Promise<void>;
  onDelete: (packId: string, themeId: string) => Promise<void>;
  onSnackbar: (msg: string) => void;
}

function PackGroup({
  pack,
  themes,
  onApply,
  onDelete,
  onSnackbar,
}: PackGroupProps) {
  return (
    <Box>
      {/* Pack header */}
      <Box
        sx={{
          px: 2,
          py: 0.75,
          backgroundColor: "action.hover",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "baseline",
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
          }}
        >
          {pack.isPersonal ? "Personal" : pack.name}
        </Typography>
        {!pack.isPersonal && pack.version && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontSize: "0.65rem" }}
          >
            v{pack.version}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ ml: "auto", fontSize: "0.65rem" }}
        >
          {themes.length} {themes.length === 1 ? "theme" : "themes"}
        </Typography>
      </Box>

      <List dense disablePadding>
        {themes.map((theme, idx) => (
          <React.Fragment key={theme.id}>
            {idx > 0 && <Divider component="li" />}
            <ListItem
              sx={{ py: 1, pr: 1 }}
              secondaryAction={
                <ThemeRowMenu
                  flat={{ theme, pack }}
                  onApply={onApply}
                  onDelete={onDelete}
                  onSnackbar={onSnackbar}
                />
              }
            >
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {theme.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="span"
                    sx={{ display: "block" }}
                  >
                    {theme.baseTheme} · {theme.styleProfile}
                    {theme.isDarkMode ? " · Dark" : ""}
                    {theme.description ? ` · ${theme.description}` : ""}
                  </Typography>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export const SavedThemesPanel: React.FC = () => {
  const { packs, loading, removeTheme, applyTheme } = useCompendiumPacks();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Only packs that have at least one theme, personal first then alpha
  const packsWithThemes = [...packs]
    .filter((p) => (p.themes ?? []).length > 0)
    .sort((a, b) => {
      if (a.isPersonal) return -1;
      if (b.isPersonal) return 1;
      return a.name.localeCompare(b.name);
    });

  if (packsWithThemes.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No saved themes yet. Use <strong>Save Theme</strong> in the Customizer
          tab to save your current customization.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {packsWithThemes.map((pack, idx) => (
          <React.Fragment key={pack.id}>
            {idx > 0 && <Divider />}
            <PackGroup
              pack={pack}
              themes={pack.themes!}
              onApply={applyTheme}
              onDelete={removeTheme}
              onSnackbar={setSnackbar}
            />
          </React.Fragment>
        ))}
      </Box>

      <Snackbar
        open={snackbar !== null}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};
