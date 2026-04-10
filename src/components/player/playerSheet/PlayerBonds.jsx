import React, { useState, useEffect } from "react";
import { Paper, Grid, Typography, Divider, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const bonds = player.info?.bonds ?? [];

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

  const FilledStarSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 95.74 95.98"
      width="18"
      height="18"
    >
      <path
        fill={theme.palette.mode === 'dark' ? "white" : "black"}
        opacity=".96"
        stroke={theme.palette.mode === 'dark' ? "white" : "black"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6px"
        d="M33.55,33.94l-28.7,11.66c-2.5,1.01-2.46,4.56.06,5.52l29,11.08,11.7,28.97c.98,2.43,4.44,2.41,5.39-.04l11.28-29.09,28.57-11.79c2.54-1.05,2.51-4.66-.05-5.66l-28.84-11.27-11.73-28.5c-1.02-2.47-4.54-2.43-5.5.06l-11.18,29.04Z"
      />
    </svg>
  );

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
              <Box sx={{ backgroundColor: primary, display: "flex", flexDirection: "column", alignItems: "center", py: 1, position: "relative" }}>
                <Typography
                  variant="h1"
                  sx={{
                    writingMode: "vertical-lr",
                    textTransform: "uppercase",
                    color: custom.white,
                    transform: "rotate(180deg)",
                    fontSize: "2em",
                    minHeight: "100px",
                  }}
                  align="center"
                >
                  {t("Bonds")}
                </Typography>
              </Box>
            )}

            <Grid container spacing={2} sx={{ padding: "1em" }}>
              {bonds && bonds.length > 0
                ? bonds.map((bond, index) => (
                  <Grid item xs={12} md={6} key={index} sx={{ display: "flex", alignItems: "flex-start" }}>
                    {isEditMode && (
                      <IconButton size="small" onClick={() => setEditBondIndex(index)} sx={{ mt: "2px", mr: 0.5, flexShrink: 0 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Typography variant="h4">
                      <span
                        style={{
                          fontWeight: "bolder",
                          fontSize: "1.6em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span style={{ wordWrap: "break-word" }}>
                          {bond.name + ": "}
                        </span>
                      </span>
                      <span
                        style={{
                          fontSize: "1.4em",
                          textTransform: "uppercase",
                        }}
                      >
                        {/* BOND TYPES
                    Admiration
                    Loyality
                    Affection
                    Inferiority
                    Mistrust
                    Hatred*/}
                        {[
                          bond.admiration && (
                            <span key="admiration" style={{ color: positiveColor }}>
                              {t("Admiration")}
                            </span>
                          ),
                          bond.loyality && (
                            <span key="loyality" style={{ color: positiveColor }}>
                              {t("Loyality")}
                            </span>
                          ),
                          bond.affection && (
                            <span key="affection" style={{ color: positiveColor }}>
                              {t("Affection")}
                            </span>
                          ),
                          bond.inferiority && (
                            <span key="inferiority" style={{ color: negativeColor }}>
                              {t("Inferiority")}
                            </span>
                          ),
                          bond.mistrust && (
                            <span key="mistrust" style={{ color: negativeColor }}>
                              {t("Mistrust")}
                            </span>
                          ),
                          bond.hatred && (
                            <span key="hatred" style={{ color: negativeColor }}>
                              {t("Hatred")}
                            </span>
                          ),
                        ]
                          .filter(Boolean)
                          .reduce(
                            (acc, curr, i, arr) => [
                              ...acc,
                              curr,
                              i < arr.length - 1 ? ", " : "",
                            ],
                            []
                          )}
                        {calculateBondStrength(bond) > 0 && (
                          <span>
                            {" "}
                            <Typography component="span" sx={{ ml: -1, mr: 0, fontSize: "1.2em" }}>
                              【
                            </Typography>
                            {FilledStarSVG}
                            {calculateBondStrength(bond)}
                            <Typography component="span" sx={{ mr: -0.7, fontSize: "1.2em" }}>
                              】
                            </Typography>
                          </span>
                        )}
                      </span>
                    </Typography>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("Bond Name")}
                  value={draftBond.name}
                  onChange={(e) => setDraftBond((prev) => ({ ...prev, name: e.target.value }))}
                  inputProps={{ maxLength: 50 }}
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
                <Grid item xs={4} key={key}>
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
              onClick={() => setDeleteDialogOpen(true)}
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
        onClose={() => setDeleteDialogOpen(false)}
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
