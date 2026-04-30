import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Close, ExpandLess, ExpandMore } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import { useCompendiumPacks } from "../../../hooks/useCompendiumPacks";
import classList from "../../../libs/classes";
import { findPendingMigrations, applyMigrations } from "../../../libs/migrate";

function slugify(str) {
  return (str ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildBuiltinSources() {
  const classes = classList.map((c) => ({
    ...c,
    _packItemId: `builtin:${slugify(c.name ?? "")}`,
    skills: (c.skills ?? []).map((s) => ({
      ...s,
      name: s.skillName ?? s.name,
    })),
  }));
  return { classes };
}

const TYPE_LABELS = {
  class: "Classes",
  mnemosphere: "Mnemospheres",
  hoplosphere: "Hoplospheres",
  heroic: "Heroic Skills",
  "player-spell": "Player Spells",
  "npc-spell": "NPC Spells",
};

const TYPE_ORDER = [
  "class",
  "mnemosphere",
  "hoplosphere",
  "heroic",
  "player-spell",
  "npc-spell",
];

export default function MigrateFromCompendiumDialog({
  open,
  onClose,
  player,
  onApply,
}) {
  const { t } = useTranslate();
  const { packs, loading } = useCompendiumPacks();
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(new Set());

  const packMap = useMemo(() => {
    const map = new Map();
    for (const pack of packs) {
      map.set(pack.id, pack);
    }
    return map;
  }, [packs]);

  const builtinSources = useMemo(() => buildBuiltinSources(), []);

  const migrations = useMemo(() => {
    if (!player || loading) return [];
    return findPendingMigrations(player, packMap, builtinSources);
  }, [player, packMap, builtinSources, loading]);

  useEffect(() => {
    setSelected(new Set(migrations.map((m) => m.instancePath)));
  }, [migrations]);

  const byType = useMemo(() => {
    const map = {};
    for (const m of migrations) {
      if (!map[m.type]) map[m.type] = [];
      map[m.type].push(m);
    }
    return map;
  }, [migrations]);

  const activeTypes = TYPE_ORDER.filter((t) => byType[t]?.length > 0);

  function toggleItem(path) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  function toggleType(type) {
    const paths = (byType[type] ?? []).map((m) => m.instancePath);
    const allSelected = paths.every((p) => selected.has(p));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) paths.forEach((p) => next.delete(p));
      else paths.forEach((p) => next.add(p));
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(migrations.map((m) => m.instancePath)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function toggleExpand(path) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  function handleApply() {
    const updated = applyMigrations(player, migrations, selected);
    onApply(updated);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0,
        }}
      >
        <Typography variant="h3">{t("Migrate from Compendium")}</Typography>
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : migrations.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ py: 2, textAlign: "center" }}
          >
            {t("All compendium-linked items are up to date.")}
          </Typography>
        ) : (
          <>
            <Box
              sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center" }}
            >
              <Typography variant="body2" color="text.secondary">
                {selected.size} / {migrations.length} {t("selected")}
              </Typography>
              <Button size="small" onClick={selectAll}>
                {t("Select all")}
              </Button>
              <Button size="small" onClick={deselectAll}>
                {t("Deselect all")}
              </Button>
            </Box>

            {activeTypes.map((type) => {
              const items = byType[type];
              const paths = items.map((m) => m.instancePath);
              const allChecked = paths.every((p) => selected.has(p));
              const someChecked = paths.some((p) => selected.has(p));

              return (
                <Box key={type} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allChecked}
                          indeterminate={someChecked && !allChecked}
                          onChange={() => toggleType(type)}
                          size="small"
                        />
                      }
                      label={
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          {t(TYPE_LABELS[type])}
                          <Chip
                            size="small"
                            label={items.length}
                            sx={{ ml: 1, height: 18, fontSize: "0.7rem" }}
                          />
                        </Typography>
                      }
                    />
                  </Box>
                  <List dense disablePadding sx={{ pl: 2 }}>
                    {items.map((migration) => {
                      const isExpanded = expanded.has(migration.instancePath);
                      const label =
                        migration.instance.name ??
                        migration.instance.class ??
                        migration.instancePath;
                      return (
                        <React.Fragment key={migration.instancePath}>
                          <ListItem
                            disableGutters
                            secondaryAction={
                              <IconButton
                                size="small"
                                onClick={() =>
                                  toggleExpand(migration.instancePath)
                                }
                              >
                                {isExpanded ? (
                                  <ExpandLess fontSize="small" />
                                ) : (
                                  <ExpandMore fontSize="small" />
                                )}
                              </IconButton>
                            }
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Checkbox
                                size="small"
                                checked={selected.has(migration.instancePath)}
                                onChange={() =>
                                  toggleItem(migration.instancePath)
                                }
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={t(label)}
                              secondary={`${migration.diffs.length} change(s)`}
                            />
                          </ListItem>
                          <Collapse in={isExpanded} unmountOnExit>
                            <Box sx={{ pl: 4, pb: 1 }}>
                              {migration.diffs.map((diff, i) => (
                                <Typography
                                  key={i}
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  • {diff}
                                </Typography>
                              ))}
                            </Box>
                          </Collapse>
                        </React.Fragment>
                      );
                    })}
                  </List>
                  <Divider />
                </Box>
              );
            })}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={selected.size === 0}
        >
          {t("Migrate selected")} ({selected.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
