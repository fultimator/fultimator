import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Chip,
  Tooltip,
  Typography,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import { SharedMnemosphereCard } from "../../../shared/itemCards";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import CompendiumSphereImportDialog from "./CompendiumSphereImportDialog";

export default function MnemoReceptaclePickerDialog({
  open,
  onClose,
  player,
  onLoad,
  onAddToBank,
}) {
  const { t } = useTranslate();
  const [selected, setSelected] = useState(null);
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [compendiumImport, setCompendiumImport] = useState(null);

  const eq0 = player?.equipment?.[0] ?? {};
  const mnemospheres = eq0.mnemospheres ?? [];
  const loaded = eq0.mnemoReceptacle ?? [];

  const available = mnemospheres.map((m) => ({
    item: m,
    disabled: loaded.includes(m.id),
    reason: loaded.includes(m.id) ? t("Already loaded") : null,
  }));

  const handleConfirm = () => {
    if (!selected) return;
    onLoad(selected.id);
    setSelected(null);
    onClose();
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const handleCompendiumAdd = (item, type) => {
    if (type === "mnemospheres") {
      setCompendiumImport({ item, type });
    } else if (onAddToBank) {
      onAddToBank(item, type);
    }
  };

  const handleConfirmImport = ({ level, cost }) => {
    if (!compendiumImport) return;
    if (onAddToBank)
      onAddToBank(compendiumImport.item, compendiumImport.type, {
        level,
        cost,
      });
    setCompendiumImport(null);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Load Mnemosphere")}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            {onAddToBank && (
              <Tooltip title={t("Browse mnemospheres in compendium")}>
                <IconButton
                  size="small"
                  onClick={() => setCompendiumOpen(true)}
                >
                  <Search />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {available.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              {t("No mnemospheres available")}
            </Typography>
          ) : (
            <List dense disablePadding>
              {available.map(({ item: m, disabled, reason }) => (
                <ListItem key={m.id} disablePadding>
                  <ListItemButton
                    selected={selected?.id === m.id}
                    disabled={disabled}
                    onClick={() => !disabled && setSelected(m)}
                    sx={{ flexDirection: "column", alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <ListItemText primary={`${t(m.class)} Lv.${m.lvl}`} />
                      <Box
                        sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
                      >
                        {reason && (
                          <Chip label={reason} size="small" color="error" />
                        )}
                        <Typography variant="caption">
                          {500 + m.lvl * 300}z
                        </Typography>
                      </Box>
                    </Box>
                    {selected?.id === m.id && (
                      <Box sx={{ width: "100%", mt: 1 }}>
                        <SharedMnemosphereCard
                          item={m}
                          variant="compact"
                          showCard={true}
                        />
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!selected}
          >
            {t("Load")}
          </Button>
        </DialogActions>
      </Dialog>

      {onAddToBank && (
        <CompendiumViewerModal
          open={compendiumOpen}
          onClose={() => setCompendiumOpen(false)}
          onAddItem={handleCompendiumAdd}
          initialType="mnemospheres"
          restrictToTypes={["mnemospheres"]}
          context="player"
        />
      )}

      {onAddToBank && (
        <CompendiumSphereImportDialog
          open={Boolean(compendiumImport)}
          item={compendiumImport?.item}
          type={compendiumImport?.type}
          onClose={() => setCompendiumImport(null)}
          onConfirm={handleConfirmImport}
          currentZenit={player?.info?.zenit}
        />
      )}
    </>
  );
}
