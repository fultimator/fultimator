import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Card,
  IconButton,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
// Card kept for the "add" dashed placeholder
import { useTheme } from "@mui/material/styles";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import { useTranslate } from "../../../../../translation/translate";
import SectionCard from "../../common/SectionCard";
import BondCard from "../../../actorCards/common/BondCard";
import AddIcon from "@mui/icons-material/Add";
import { useDeleteConfirmation } from "../../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../../common/DeleteConfirmationDialog";
import ActorEditModal from "../../../../../forms/ui/ActorEditModal";

export default function PlayerBonds({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const customTheme = useCustomTheme();
  const primary = theme.palette.primary.main;
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

  return (
    <>
      {(bonds.length > 0 || isEditMode) && (
        <>
<SectionCard
            title={t("Bonds")}
            noShadow={isCharacterSheet}
            actions={
              isEditMode && (
                <IconButton
                  size="small"
                  onClick={addNewBondAndEdit}
                  disabled={bonds.length >= 6}
                  sx={{ p: 0.5, color: "#fff" }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              )
            }
          >

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
                      <BondCard
                        bond={bond}
                        isEditMode={isEditMode}
                        onEdit={() => {
                          setIsCreatingBond(false);
                          setEditBondIndex(index);
                        }}
                      />
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
          </SectionCard>
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
