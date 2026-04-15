import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import StarIcon from "@mui/icons-material/Star";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/Lock";
import type { CompendiumItemType } from "../../types/CompendiumPack";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";

interface Props {
  itemType: CompendiumItemType;
  data: unknown;
  size?: "small" | "medium";
  /** Pack id to exclude from the target list (e.g. the pack currently being viewed) */
  excludePackId?: string;
  /** Override tooltip text (e.g. "Clone to Custom" for official classes) */
  tooltipOverride?: string;
}

export default function AddToCompendiumButton({ itemType, data, size = "small", excludePackId, tooltipOverride }: Props) {
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null); // pack id
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const personalPack = packs.find((p) => p.isPersonal && p.id !== excludePackId) ?? null;
  const nonPersonalPacks = packs.filter((p) => !p.isPersonal && p.id !== excludePackId);
  // const hasMultiplePacks = nonPersonalPacks.length > 0 || personalPack !== null;

  // All available targets (personal first, then others), minus excluded pack
  const allTargets = [...(personalPack ? [personalPack] : []), ...nonPersonalPacks];
  const unlockedTargets = allTargets.filter((p) => !p.locked);

  const doAdd = async (packId: string) => {
    setAdding(true);
    try {
      await addItem(packId, itemType, data);
      setJustAdded(packId);
      setTimeout(() => setJustAdded(null), 2000);
      setSnackbar({ open: true, message: "Added to compendium", severity: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add item";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setAdding(false);
      setAnchorEl(null);
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (allTargets.length > 1) {
      setAnchorEl(e.currentTarget);
    } else if (unlockedTargets.length === 1) {
      // Only one unlocked target — add directly
      await doAdd(unlockedTargets[0].id);
    } else if (allTargets.length === 0) {
      // No packs yet — create personal
      const personal = await ensurePersonalPack();
      await doAdd(personal.id);
    } else {
      // All targets are locked — open menu so user can see why
      setAnchorEl(e.currentTarget);
    }
  };

  const renderIcon = (pack: typeof allTargets[number], id: string) => {
    if (justAdded === id) return <CheckIcon fontSize="small" color="success" />;
    if (pack.locked) return <LockIcon fontSize="small" color="disabled" />;
    if (pack.isPersonal) return <StarIcon fontSize="small" color="warning" />;
    return <CollectionsBookmarkIcon fontSize="small" />;
  };

  return (
    <>
      <Tooltip title={tooltipOverride ?? "Add to Compendium"}>
        <span style={{ display: "inline-flex" }}>
          <IconButton size={size} onClick={handleClick} disabled={adding}>
            {adding ? (
              <CircularProgress size={16} />
            ) : (
              <LibraryAddIcon fontSize={size} />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {personalPack && (
          <MenuItem
            disabled={!!personalPack.locked}
            onClick={async () => {
              if (personalPack.locked) return;
              const p = await ensurePersonalPack();
              doAdd(p.id);
            }}
            sx={personalPack.locked ? { opacity: 0.4, filter: "blur(0.5px)" } : undefined}
          >
            <ListItemIcon>
              {renderIcon(personalPack, personalPack.id)}
            </ListItemIcon>
            <ListItemText>Personal</ListItemText>
          </MenuItem>
        )}
        {nonPersonalPacks.length > 0 && personalPack && <Divider />}
        {nonPersonalPacks.map((pack) => (
          <MenuItem
            key={pack.id}
            disabled={!!pack.locked}
            onClick={() => { if (!pack.locked) doAdd(pack.id); }}
            sx={pack.locked ? { opacity: 0.4, filter: "blur(0.5px)" } : undefined}
          >
            <ListItemIcon>
              {renderIcon(pack, pack.id)}
            </ListItemIcon>
            <ListItemText>{pack.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
