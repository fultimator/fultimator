import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Grid,
  Card,
  Typography,
  IconButton,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import SectionCard from "./SectionCard";
import CompactSectionHeader from "/src/components/shared/actors/pc/variants/compact/CompactSectionHeader";
import BondCard from "./BondCard";
import AddIcon from "@mui/icons-material/Add";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";
import ActorEditModal from "/src/forms/ui/ActorEditModal";

const POSITIVE = ["admiration", "loyality", "affection"];
const NEGATIVE = ["inferiority", "mistrust", "hatred"];

const BOND_PAIRS = [
  ["admiration", "inferiority"],
  ["loyality", "mistrust"],
  ["affection", "hatred"],
];

export default function PlayerBonds({
  player,
  setPlayer,
  isEditMode,
  isCharacterSheet,
  compact = false,
  searchQuery = "",
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const positiveColor = theme.palette.success.main;
  const negativeColor = theme.palette.error.main;

  const [editBondIndex, setEditBondIndex] = useState(null);
  const [isCreatingBond, setIsCreatingBond] = useState(false);
  const [draftBond, setDraftBond] = useState(null);
  const {
    isOpen: deleteDialogOpen,
    closeDialog: setDeleteDialogOpen,
    handleDelete,
  } = useDeleteConfirmation({ onConfirm: () => {} });

  const bonds = useMemo(() => player.info?.bonds ?? [], [player.info?.bonds]);
  const normalizedQuery = searchQuery.trim().toLowerCase();

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

  const openAddBond = () => {
    if (bonds.length >= 6) return;
    setIsCreatingBond(true);
    setEditBondIndex(null);
    setDraftBond({
      name: "",
      admiration: false,
      loyality: false,
      affection: false,
      inferiority: false,
      mistrust: false,
      hatred: false,
    });
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

  const visibleBonds = bonds
    .map((bond, i) => ({ ...bond, originalIndex: i }))
    .filter((bond) => {
      if (!normalizedQuery) return true;
      const sentiments = [...POSITIVE, ...NEGATIVE]
        .filter((s) => bond[s])
        .map((s) => t(s.charAt(0).toUpperCase() + s.slice(1)))
        .join(" ");
      return (
        bond.name?.toLowerCase().includes(normalizedQuery) ||
        sentiments.toLowerCase().includes(normalizedQuery)
      );
    });

  if (visibleBonds.length === 0 && !isEditMode) return null;

  const addButton = isEditMode && (
    <Tooltip title={t("Add Bond")}>
      <span>
        <IconButton
          size="small"
          onClick={openAddBond}
          disabled={bonds.length >= 6}
          sx={{ p: compact ? "2px" : 0.5, color: "#fff" }}
        >
          <AddIcon
            sx={{ fontSize: compact ? "1.15rem" : undefined }}
            fontSize={compact ? undefined : "small"}
          />
        </IconButton>
      </span>
    </Tooltip>
  );

  const modal = (isCreatingBond || editBondIndex !== null) && draftBond && (
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
          {!isCreatingBond && (
            <Button variant="contained" color="error" onClick={handleDelete}>
              {t("Delete")}
            </Button>
          )}
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
              slotProps={{ htmlInput: { maxLength: 50 } }}
            />
          </Grid>
          {BOND_PAIRS.map(([posKey, negKey]) => (
            <Grid key={posKey} size={12}>
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
                    draftBond[posKey]
                      ? posKey
                      : draftBond[negKey]
                        ? negKey
                        : null
                  }
                  onChange={handlePairToggle(posKey, negKey)}
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
                    value={posKey}
                    sx={{
                      color: positiveColor,
                      "&.Mui-selected": {
                        color: positiveColor,
                        bgcolor: "rgba(76, 175, 80, 0.11)",
                      },
                    }}
                  >
                    {t(posKey.charAt(0).toUpperCase() + posKey.slice(1))}
                  </ToggleButton>
                  <ToggleButton
                    value={negKey}
                    sx={{
                      color: negativeColor,
                      "&.Mui-selected": {
                        color: negativeColor,
                        bgcolor: "rgba(244, 67, 54, 0.1)",
                      },
                    }}
                  >
                    {t(negKey.charAt(0).toUpperCase() + negKey.slice(1))}
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
  );

  const deleteDialog = (
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
            {[...POSITIVE, ...NEGATIVE]
              .filter((s) => draftBond[s])
              .map((s) => (
                <Typography
                  key={s}
                  variant="body2"
                  sx={{
                    color: POSITIVE.includes(s) ? positiveColor : negativeColor,
                  }}
                >
                  {t(s.charAt(0).toUpperCase() + s.slice(1))}
                </Typography>
              ))}
          </Box>
        )
      }
    />
  );

  if (compact) {
    return (
      <>
        <Paper
          sx={{ mb: 1, overflow: "hidden" }}
          elevation={0}
          variant="outlined"
        >
          <CompactSectionHeader title={t("Bonds")}>
            {addButton}
          </CompactSectionHeader>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "6px",
              p: "6px",
            }}
          >
            {visibleBonds.map((bond) => (
              <BondCard
                key={bond.originalIndex}
                bond={bond}
                isEditMode={isEditMode}
                searchQuery={searchQuery}
                onEdit={() => {
                  setIsCreatingBond(false);
                  setEditBondIndex(bond.originalIndex);
                }}
                compact
              />
            ))}
            {isEditMode && bonds.length < 6 && !normalizedQuery && (
              <Box
                onClick={openAddBond}
                sx={{
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 56,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: theme.palette.primary.main,
                  },
                  transition: "border-color 0.15s ease",
                }}
              >
                <AddIcon sx={{ color: "text.secondary", fontSize: "1.5rem" }} />
              </Box>
            )}
          </Box>
        </Paper>
        {modal}
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <SectionCard
        title={t("Bonds")}
        noShadow={isCharacterSheet}
        actions={addButton}
      >
        <Grid
          container
          spacing={0.75}
          sx={{ p: 0.75, flex: 1, minWidth: 0, width: "100%" }}
        >
          {visibleBonds.map((bond) => (
            <Grid key={bond.originalIndex} size={{ xs: 12, sm: 6, md: 4 }}>
              <BondCard
                bond={bond}
                isEditMode={isEditMode}
                onEdit={() => {
                  setIsCreatingBond(false);
                  setEditBondIndex(bond.originalIndex);
                }}
              />
            </Grid>
          ))}
          {isEditMode && bonds.length < 6 && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={openAddBond}
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
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <AddIcon sx={{ color: "text.secondary", fontSize: "2rem" }} />
              </Card>
            </Grid>
          )}
        </Grid>
      </SectionCard>
      {modal}
      {deleteDialog}
    </>
  );
}
