import React, { useState, useEffect, useMemo } from "react";
import { Paper, Grid, Typography, Divider, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

const POSITIVE_SENTIMENTS = ["admiration", "loyality", "affection"];
const NEGATIVE_SENTIMENTS = ["inferiority", "mistrust", "hatred"];

export default function PlayerBonds({ player, setPlayer, isEditMode, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const positiveColor = theme.palette.success.main;
  const negativeColor = "red";

  const [editBondIndex, setEditBondIndex] = useState(null);
  const [draftBond, setDraftBond] = useState(null);
  const { isOpen: deleteDialogOpen, closeDialog: setDeleteDialogOpen, handleDelete } = useDeleteConfirmation({
    onConfirm: () => {},
  });;

  const bonds = useMemo(() => player.info?.bonds ?? [], [player.info?.bonds]);

  useEffect(() => {
    if (editBondIndex !== null && bonds[editBondIndex]) {
      setDraftBond({ ...bonds[editBondIndex] });
    }
  }, [editBondIndex, bonds]);

  const closeModal = () => {
    setEditBondIndex(null);
    setDraftBond(null);
    setDeleteDialogOpen(false);
  };

  const addNewBond = () => {
    if (bonds.length >= 6) return;
    const newBond = { name: "", admiration: false, loyality: false, affection: false, inferiority: false, mistrust: false, hatred: false };
    setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: [...(prev.info?.bonds ?? []), newBond] } }));
  };

  const handleDraftCheck = (key) => (event) => {
    setDraftBond((prev) => {
      const next = { ...prev, [key]: event.target.checked };
      if (key === "admiration" && event.target.checked) next.inferiority = false;
      if (key === "inferiority" && event.target.checked) next.admiration = false;
      if (key === "loyality" && event.target.checked) next.mistrust = false;
      if (key === "mistrust" && event.target.checked) next.loyality = false;
      if (key === "affection" && event.target.checked) next.hatred = false;
      if (key === "hatred" && event.target.checked) next.affection = false;
      return next;
    });
  };

  const saveBond = () => {
    const updated = bonds.map((b, i) => i === editBondIndex ? { ...draftBond } : b);
    setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: updated } }));
    closeModal();
  };

  const deleteBond = (index) => {
    const updated = bonds.filter((_, i) => i !== index);
    setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: updated } }));
    closeModal();
  };

  const calculateBondStrength = (bond) => {
    return (
      (bond.admiration ? 1 : 0) +
      (bond.loyality ? 1 : 0) +
      (bond.affection ? 1 : 0) +
      (bond.inferiority ? 1 : 0) +
      (bond.mistrust ? 1 : 0) +
      (bond.hatred ? 1 : 0)
    );
  };

  const getSentiments = (bond) =>
    [...POSITIVE_SENTIMENTS, ...NEGATIVE_SENTIMENTS].filter((key) => bond[key]);

  return (
    <>
      {(bonds.length > 0 || isEditMode) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Paper
            elevation={3}
            sx={
              isCharacterSheet
                ? {
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "none"
                }
                : {
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: secondary,
                  display: "flex",
                }
            }
          >
            {isCharacterSheet ? (
              <Box sx={{ backgroundColor: primary, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Typography
                  variant="h1"
                  sx={{
                    textTransform: "uppercase",
                    padding: "5px",
                    color: custom.white,
                    fontSize: "1.5em",
                  }}
                  align="center"
                >
                  {t("Bonds")}
                </Typography>
                {isEditMode && (
                  <IconButton
                    size="small"
                    onClick={addNewBond}
                    disabled={bonds.length >= 6}
                    sx={{ position: "absolute", right: 8, color: custom.white }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ) : (
              <Typography
                variant="h1"
                sx={{
                  writingMode: "vertical-lr",
                  textTransform: "uppercase",
                  marginLeft: "-1px",
                  marginRight: "10px",
                  marginTop: "-1px",
                  marginBottom: "-1px",
                  paddingY: "10px",
                  backgroundColor: primary,
                  color: custom.white,
                  borderRadius: "0 8px 8px 0",
                  transform: "rotate(180deg)",
                  fontSize: "2em",
                }}
                align="center"
              >
                {t("Bonds")}
              </Typography>
            )}

            <Grid container spacing={0.75} sx={{ p: 0.75 }}>
              {bonds && bonds.length > 0
                ? bonds.map((bond, index) => (
                  <Grid
                    key={index}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4
                    }}>
                    <Box
                      sx={{
                        height: "100%",
                        border: "1px solid",
                        borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                        borderRadius: 1,
                        px: 1.1,
                        py: 0.8,
                        minHeight: 64,
                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                        boxShadow: theme.palette.mode === "dark"
                          ? "inset 0 0 0 1px rgba(255,255,255,0.05)"
                          : "inset 0 0 0 1px rgba(255,255,255,0.55)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            textTransform: "uppercase",
                            lineHeight: 1.1,
                            wordBreak: "break-word",
                            fontSize: { xs: "1rem", sm: "1.08rem" },
                            letterSpacing: "0.02em",
                          }}
                        >
                          {bond.name || t("Bond Name")}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
                          {calculateBondStrength(bond) > 0 && (
                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                              {"★ " + calculateBondStrength(bond)}
                            </Typography>
                          )}
                          {isEditMode && (
                            <IconButton size="small" onClick={() => setEditBondIndex(index)} sx={{ p: 0.5 }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.45 }}>
                        {getSentiments(bond).length > 0 ? (
                          getSentiments(bond).map((key) => (
                            <Typography
                              key={key}
                              variant="caption"
                              sx={{
                                px: 0.8,
                                py: 0.35,
                                borderRadius: 0.75,
                                textTransform: "uppercase",
                                fontWeight: 800,
                                fontSize: { xs: "0.7rem", sm: "0.74rem" },
                                letterSpacing: "0.02em",
                                color: POSITIVE_SENTIMENTS.includes(key) ? positiveColor : negativeColor,
                                bgcolor: POSITIVE_SENTIMENTS.includes(key)
                                  ? "rgba(76, 175, 80, 0.2)"
                                  : "rgba(244, 67, 54, 0.2)",
                                border: "1px solid",
                                borderColor: POSITIVE_SENTIMENTS.includes(key)
                                  ? "rgba(76, 175, 80, 0.35)"
                                  : "rgba(244, 67, 54, 0.35)",
                              }}
                            >
                              {t(key.charAt(0).toUpperCase() + key.slice(1))}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="caption" sx={{
                            color: "text.secondary"
                          }}>
                            {"-"}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))
                : null}
            </Grid>
          </Paper>
        </>
      )}
      {editBondIndex !== null && draftBond && (
        <Dialog open onClose={closeModal} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
            {t("Edit Bond")}
            <IconButton
              aria-label="close"
              onClick={closeModal}
              sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid  size={12}>
                <TextField
                  fullWidth
                  label={t("Bond Name")}
                  value={draftBond.name}
                  onChange={(e) => setDraftBond((prev) => ({ ...prev, name: e.target.value }))}
                  slotProps={{
                    htmlInput: { maxLength: 50 }
                  }}
                />
              </Grid>
              {[
                { key: "admiration", label: t("Admiration"), color: positiveColor },
                { key: "loyality", label: t("Loyality"), color: positiveColor },
                { key: "affection", label: t("Affection"), color: positiveColor },
                { key: "inferiority", label: t("Inferiority"), color: negativeColor },
                { key: "mistrust", label: t("Mistrust"), color: negativeColor },
                { key: "hatred", label: t("Hatred"), color: negativeColor },
              ].map(({ key, label, color }) => (
                <Grid  key={key} size={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!draftBond[key]}
                        onChange={handleDraftCheck(key)}
                      />
                    }
                    label={<Typography sx={{ fontSize: "14px", color }}>{label}</Typography>}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              {t("Delete")}
            </Button>
            <Box>
              <Button onClick={closeModal} sx={{ mr: 1 }}>{t("Cancel")}</Button>
              <Button variant="contained" color="primary" onClick={saveBond}>{t("Save")}</Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={setDeleteDialogOpen}
        onConfirm={() => deleteBond(editBondIndex)}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to remove this bond?")}
        itemPreview={
          draftBond && (
            <Box>
              <Typography variant="h4" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                {draftBond.name}
              </Typography>
              {[
                { key: "admiration", label: t("Admiration"), color: positiveColor },
                { key: "loyality", label: t("Loyality"), color: positiveColor },
                { key: "affection", label: t("Affection"), color: positiveColor },
                { key: "inferiority", label: t("Inferiority"), color: negativeColor },
                { key: "mistrust", label: t("Mistrust"), color: negativeColor },
                { key: "hatred", label: t("Hatred"), color: negativeColor },
              ]
                .filter(({ key }) => draftBond[key])
                .map(({ key, label, color }) => (
                  <Typography key={key} variant="body2" sx={{ color }}>
                    {label}
                  </Typography>
                ))}
            </Box>
          )
        }
      />
    </>
  );
}
