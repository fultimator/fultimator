import { useState, useEffect, useMemo } from "react";
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
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { useDeleteConfirmation } from "../../../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../../../components/common/DeleteConfirmationDialog";

const StyledTableCellHeader = styled(TableCell)({
  padding: 0,
  color: "#fff"
});

const StyledTableCell = styled(TableCell)({
  padding: 0
});

const POSITIVE = ["admiration", "loyality", "affection"];
const NEGATIVE = ["inferiority", "mistrust", "hatred"];

function bondStrength(bond) {
  return [...POSITIVE, ...NEGATIVE].filter((s) => bond[s]).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, "ig");
  return source.split(regex).map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={`${part}-${idx}`} style={{ backgroundColor: "yellow", padding: 0 }}>{part}</mark>
    ) : part
  );
}

export default function PlayerBonds({ player, setPlayer, isEditMode, searchQuery = "" }) {
  const { t } = useTranslate();
  const custom = useCustomTheme();
  const theme = useTheme();
  const positiveColor = theme.palette.success.main;
  const negativeColor = theme.palette.error.main;

  const [editBondIndex, setEditBondIndex] = useState(null);
  const [draftBond, setDraftBond] = useState(null);
  const { isOpen: deleteDialogOpen, closeDialog: setDeleteDialogOpen, handleDelete } = useDeleteConfirmation({
    onConfirm: () => {},
  });;

  const bonds = useMemo(() => player.info?.bonds ?? [], [player.info?.bonds]);
  const normalizedQuery = searchQuery.trim().toLowerCase();

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

  const visibleBonds = bonds.filter((bond) => {
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

  return (
    <>
      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
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
              <StyledTableCellHeader sx={{ width: 36 }} />
              <StyledTableCellHeader>
                <Typography variant="h4">{t("Bonds")}</Typography>
              </StyledTableCellHeader>
              <StyledTableCellHeader sx={{ width: { xs: 55, sm: 80 }, display: { xs: 'none', sm: 'table-cell' } }}>
                <Typography variant="h4" sx={{ fontSize: '0.875rem' }}>{t("Sentiments")}</Typography>
              </StyledTableCellHeader>
              <StyledTableCellHeader sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
              <StyledTableCellHeader sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}>
                {isEditMode && (
                  <Tooltip title={t("Add Bond")}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={addNewBond}
                        disabled={bonds.length >= 6}
                        sx={{ color: "#fff", p: 0.5 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </StyledTableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleBonds.map((bond, index) => {
              const originalIndex = bonds.indexOf(bond);
              const positive = POSITIVE.filter((s) => bond[s]);
              const negative = NEGATIVE.filter((s) => bond[s]);
              const strength = bondStrength(bond);
              const sentiments = [...positive, ...negative];

              return (
                <TableRow key={index}>
                  <StyledTableCell sx={{ width: 36 }} />
                  <StyledTableCell sx={{ minWidth: { xs: 60, sm: 100 }, wordBreak: "break-word" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                      {highlightMatch(bond.name, searchQuery)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: { xs: 150, sm: 220 }, display: { xs: 'none', sm: 'table-cell' } }}>
                    <Box sx={{ display: "flex", flexWrap: "nowrap", gap: 0.5, overflow: "visible" }}>
                      {sentiments.map((s, i) => (
                        <Typography
                          key={s}
                          variant="body2"
                          sx={{
                            color: POSITIVE.includes(s) ? "success.main" : "error.main",
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {highlightMatch(t(s.charAt(0).toUpperCase() + s.slice(1)), searchQuery)}
                          {i < sentiments.length - 1 && ","}
                        </Typography>
                      ))}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: { xs: 65, sm: 90 }, display: { xs: 'none', sm: 'table-cell' } }} />
                  <StyledTableCell sx={{ width: { xs: 110, sm: 110 }, textAlign: "right" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                      {strength > 0 && (
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          ★{strength}
                        </Typography>
                      )}
                      {isEditMode && (
                        <IconButton size="small" onClick={() => setEditBondIndex(originalIndex)} sx={{ p: 0.5 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
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
