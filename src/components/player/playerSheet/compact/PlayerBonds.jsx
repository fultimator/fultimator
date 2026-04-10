import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import DeleteConfirmationDialog from "../../../../components/common/DeleteConfirmationDialog";

const StyledTableCellHeader = styled(TableCell)({
  padding: "2px 8px",
  color: "#fff",
  borderBottom: "none"
});

const StyledTableCell = styled(TableCell)({
  padding: "2px 8px"
});

const POSITIVE = ["admiration", "loyality", "affection"];
const NEGATIVE = ["inferiority", "mistrust", "hatred"];

function bondStrength(bond) {
  return [...POSITIVE, ...NEGATIVE].filter((s) => bond[s]).length;
}

export default function PlayerBonds({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const custom = useCustomTheme();
  const theme = useTheme();
  const positiveColor = theme.palette.success.main;
  const negativeColor = theme.palette.error.main;

  const [editBondIndex, setEditBondIndex] = useState(null);
  const [draftBond, setDraftBond] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const bonds = player.info?.bonds ?? [];

  useEffect(() => {
    if (editBondIndex !== null && bonds[editBondIndex]) {
      setDraftBond({ ...bonds[editBondIndex] });
    }
  }, [editBondIndex]);

  const closeModal = () => {
    setEditBondIndex(null);
    setDraftBond(null);
    setDeleteDialogOpen(false);
  };

  const addNewBond = () => {
    if (bonds.length >= 6) return;
    const newBond = { name: "", admiration: false, loyality: false, affection: false, inferiority: false, mistrust: false, hatred: false };
    setPlayer((prev) => ({ ...prev, info: { ...prev.info, bonds: [...prev.info.bonds, newBond] } }));
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

  if (bonds.length === 0 && !isEditMode) return null;

  const iconColWidth = 36;
  const starColWidth = 60;

  return (
    <>
      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                background: custom.primary,
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textTransform: "uppercase",
                },
              }}
            >
              <StyledTableCellHeader sx={{ width: iconColWidth }}>
                {isEditMode && (
                  <IconButton
                    size="small"
                    onClick={addNewBond}
                    disabled={bonds.length >= 6}
                    sx={{ color: "#fff", p: 0 }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                )}
              </StyledTableCellHeader>
              <StyledTableCellHeader>
                <Typography variant="h4">{t("Bonds")}</Typography>
              </StyledTableCellHeader>
              <StyledTableCellHeader sx={{ width: starColWidth, textAlign: "center", pr: 0 }}>
                <Typography variant="h4">★</Typography>
              </StyledTableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {bonds.map((bond, index) => {
              const positive = POSITIVE.filter((s) => bond[s]);
              const negative = NEGATIVE.filter((s) => bond[s]);
              const strength = bondStrength(bond);
              const sentiments = [...positive, ...negative];

              return (
                <TableRow key={index}>
                  <StyledTableCell sx={{ width: iconColWidth }}>
                    {isEditMode && (
                      <IconButton size="small" onClick={() => setEditBondIndex(index)} sx={{ p: 0 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%" }}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ textTransform: "uppercase", whiteSpace: "nowrap", mr: 1 }}
                      >
                        {bond.name}
                      </Typography>

                      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 0.5 }}>
                        {sentiments.map((s, i) => (
                          <Typography
                            key={s}
                            variant="body2"
                            sx={{
                              color: POSITIVE.includes(s) ? "success.main" : "error.main",
                              textTransform: "uppercase",
                              fontSize: "0.75rem"
                            }}
                          >
                            {t(s.charAt(0).toUpperCase() + s.slice(1))}
                            {i < sentiments.length - 1 && ","}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: starColWidth, textAlign: "center", pr: 0 }}>
                    {strength > 0 && (
                      <Typography variant="body2" fontWeight="bold">
                        ★{strength}
                      </Typography>
                    )}
                  </StyledTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
              <Typography variant="h4" sx={{ textTransform: "uppercase" }}>
                {draftBond.name}
              </Typography>
              {[...POSITIVE, ...NEGATIVE]
                .filter((s) => draftBond[s])
                .map((s) => (
                  <Typography
                    key={s}
                    variant="body2"
                    sx={{ color: POSITIVE.includes(s) ? "success.main" : "error.main" }}
                  >
                    {t(s.charAt(0).toUpperCase() + s.slice(1))}
                  </Typography>
                ))}
            </Box>
          )
        }
      />
    </>
  );
}