import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Grid,
  Typography,
  Divider,
  Box,
  Card,
  IconButton,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useDeleteConfirmation } from "../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";
import ActorEditModal from "../../common/ActorEditModal";

const POSITIVE_SENTIMENTS = ["admiration", "loyality", "affection"];
const NEGATIVE_SENTIMENTS = ["inferiority", "mistrust", "hatred"];

export default function PlayerBonds({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const positiveColor = theme.palette.success.main;
  const negativeColor = "red";

  const [editBondIndex, setEditBondIndex] = useState(null);
  const [isCreatingBond, setIsCreatingBond] = useState(false);
  const [draftBond, setDraftBond] = useState(null);
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({
    onConfirm: () => {},
  });

  const bonds = useMemo(() => player.info?.bonds ?? [], [player.info?.bonds]);

  useEffect(() => {
    if (!isCreatingBond && editBondIndex !== null && bonds[editBondIndex]) {
      setDraftBond({ ...bonds[editBondIndex] });
    }
  }, [isCreatingBond, editBondIndex, bonds]);

  const closeModal = () => {
    setEditBondIndex(null);
    setIsCreatingBond(false);
    setDraftBond(null);
    setDeleteDialogOpen(false);
  };

  const addNewBondAndEdit = () => {
    if (bonds.length >= 6) return;
    const newBond = {
      name: "",
      admiration: false,
      loyality: false,
      affection: false,
      inferiority: false,
      mistrust: false,
      hatred: false,
    };
    setIsCreatingBond(true);
    setEditBondIndex(null);
    setDraftBond(newBond);
  };

  const handlePairToggle = (positiveKey, negativeKey) => (_event, value) => {
    setDraftBond((prev) => ({
      ...prev,
      [positiveKey]: value === positiveKey,
      [negativeKey]: value === negativeKey,
    }));
  };

  const saveBond = () => {
    if (isCreatingBond) {
      setPlayer((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          bonds: [...(prev.info?.bonds ?? []), { ...draftBond }],
        },
      }));
      closeModal();
      return;
    }

    const updated = bonds.map((b, i) =>
      i === editBondIndex ? { ...draftBond } : b,
    );
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
                    boxShadow: "none",
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
              <Box
                sx={{
                  backgroundColor: primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
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
                    onClick={addNewBondAndEdit}
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

            <Grid
              container
              spacing={0.75}
              sx={{ p: 0.75, flex: 1, minWidth: 0, width: "100%" }}
            >
              {bonds && bonds.length > 0
                ? bonds.map((bond, index) => (
                    <Grid
                      key={index}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                      }}
                    >
                      <Card
                        sx={{
                          height: "100%",
                          minWidth: { xs: "none", sm: "150px" },
                          minHeight: 48,
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        {/* Header bar */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            padding: "5px",
                            paddingLeft: "10px",
                            backgroundColor: primary,
                          }}
                        >
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              color: "#fff",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              flex: 1,
                            }}
                          >
                            {bond.name || t("Bond Name")}
                          </Typography>
                          {calculateBondStrength(bond) > 0 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#fff",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {"★ " + calculateBondStrength(bond)}
                            </Typography>
                          )}
                          {isEditMode && (
                            <IconButton
                              size="small"
                              onClick={() => {
                                setIsCreatingBond(false);
                                setEditBondIndex(index);
                              }}
                              sx={{ p: 0.5, color: "#fff" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        {/* Body */}
                        <Box
                          sx={{
                            px: 1,
                            py: 0.75,
                            flex: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.45,
                            alignContent: "flex-start",
                            alignItems:
                              getSentiments(bond).length > 0
                                ? "flex-start"
                                : "center",
                          }}
                        >
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
                                  color: POSITIVE_SENTIMENTS.includes(key)
                                    ? positiveColor
                                    : negativeColor,
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
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                  textAlign: "center",
                                }}
                              >
                                {t("No sentiments")}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))
                : null}
              {isEditMode && bonds.length < 6 && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Card
                    onClick={addNewBondAndEdit}
                    sx={{
                      height: "100%",
                      minHeight: 48,
                      px: 1,
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px dashed",
                      borderColor: "divider",
                      bgcolor: "transparent",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <AddIcon
                      sx={{
                        color: "text.secondary",
                        fontSize: "2rem",
                      }}
                    />
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      )}
      {(isCreatingBond || editBondIndex !== null) && draftBond && (
        <ActorEditModal
          open
          onClose={closeModal}
          onConfirm={saveBond}
          title={isCreatingBond ? t("Add Bond") : t("Edit Bond")}
          subtitle={t(
            "Set the bond name and sentiments. Opposed sentiments auto-exclude each other.",
          )}
          maxWidth="sm"
          actions={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isCreatingBond ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                >
                  {t("Delete")}
                </Button>
              ) : null}
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={closeModal}>{t("Cancel")}</Button>
              <Button variant="contained" color="primary" onClick={saveBond}>
                {t("Save")}
              </Button>
            </Box>
          }
        >
          <Box sx={{ mt: 0.5 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t("Bond Name")}
                  value={draftBond.name}
                  onChange={(e) =>
                    setDraftBond((prev) => ({ ...prev, name: e.target.value }))
                  }
                  slotProps={{
                    htmlInput: { maxLength: 50 },
                  }}
                />
              </Grid>
              {[
                [
                  {
                    key: "admiration",
                    label: t("Admiration"),
                    color: positiveColor,
                  },
                  {
                    key: "inferiority",
                    label: t("Inferiority"),
                    color: negativeColor,
                  },
                ],
                [
                  {
                    key: "loyality",
                    label: t("Loyality"),
                    color: positiveColor,
                  },
                  {
                    key: "mistrust",
                    label: t("Mistrust"),
                    color: negativeColor,
                  },
                ],
                [
                  {
                    key: "affection",
                    label: t("Affection"),
                    color: positiveColor,
                  },
                  {
                    key: "hatred",
                    label: t("Hatred"),
                    color: negativeColor,
                  },
                ],
              ].map((pair) => (
                <Grid key={pair[0].key} size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 0.75,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <ToggleButtonGroup
                      exclusive
                      value={
                        draftBond[pair[0].key]
                          ? pair[0].key
                          : draftBond[pair[1].key]
                            ? pair[1].key
                            : null
                      }
                      onChange={handlePairToggle(pair[0].key, pair[1].key)}
                      sx={{
                        width: "100%",
                        "& .MuiToggleButtonGroup-grouped": {
                          flex: 1,
                          minHeight: 34,
                          borderColor: "divider",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                          fontSize: "0.78rem",
                          px: 1,
                        },
                      }}
                    >
                      <ToggleButton
                        value={pair[0].key}
                        sx={{
                          color: pair[0].color,
                          "&.Mui-selected": {
                            color: pair[0].color,
                            bgcolor: "rgba(76, 175, 80, 0.11)",
                          },
                        }}
                      >
                        {pair[0].label}
                      </ToggleButton>
                      <ToggleButton
                        value={pair[1].key}
                        sx={{
                          color: pair[1].color,
                          "&.Mui-selected": {
                            color: pair[1].color,
                            bgcolor: "rgba(244, 67, 54, 0.1)",
                          },
                        }}
                      >
                        {pair[1].label}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        px: 0.75,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t("OR")}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </ActorEditModal>
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
              <Typography
                variant="h4"
                sx={{ textTransform: "uppercase", fontWeight: "bold" }}
              >
                {draftBond.name}
              </Typography>
              {[
                {
                  key: "admiration",
                  label: t("Admiration"),
                  color: positiveColor,
                },
                { key: "loyality", label: t("Loyality"), color: positiveColor },
                {
                  key: "affection",
                  label: t("Affection"),
                  color: positiveColor,
                },
                {
                  key: "inferiority",
                  label: t("Inferiority"),
                  color: negativeColor,
                },
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
