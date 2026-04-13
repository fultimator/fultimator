import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Grid,
  Typography,
  Divider,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Close, Add, RemoveCircleOutlined } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";

export default function PlayerNoteModal({
  open,
  onClose,
  editNoteIndex,
  note,
  onSaveNote,
  onDeleteNote,
}) {
  const { t } = useTranslate();

  const [name, setName] = useState(note?.name || "");
  const [description, setDescription] = useState(note?.description || "");
  const [clocks, setClocks] = useState(note?.clocks || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(note?.showInPlayerSheet !== false);

  const [clockDialogOpen, setClockDialogOpen] = useState(false);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setName(note?.name || "");
    setDescription(note?.description || "");
    setClocks(note?.clocks || []);
    setShowInPlayerSheet(note?.showInPlayerSheet !== false);
  }, [note, open]);

  const handleSave = () => {
    onSaveNote({
      ...note,
      name,
      description,
      clocks,
      showInPlayerSheet,
    });
    onClose();
  };

  const handleAddClock = () => {
    if (!clockName.trim()) {
      alert(t("Clock name is required."));
      return;
    }
    if (clockSections < 2 || clockSections > 30) {
      alert(t("Sections must be between 2 and 30."));
      return;
    }

    setClocks([
      ...clocks,
      {
        name: clockName,
        sections: clockSections,
        state: new Array(clockSections).fill(false),
      },
    ]);
    setClockDialogOpen(false);
    setClockName("");
    setClockSections(4);
  };

  const handleRemoveClock = (index) => {
    const newClocks = [...clocks];
    newClocks.splice(index, 1);
    setClocks(newClocks);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
          {editNoteIndex !== null ? t("Edit Note") : t("Add Note")}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid  size={12}>
              <TextField
                fullWidth
                label={t("Note Name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{
                  htmlInput: { maxLength: 50 }
                }}
              />
            </Grid>
            <Grid  size={12}>
              <CustomTextarea
                label={t("Description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxRows={10}
              />
            </Grid>
            <Grid  size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showInPlayerSheet}
                    onChange={(e) => setShowInPlayerSheet(e.target.checked)}
                  />
                }
                label={t("Show in Character Sheet")}
              />
            </Grid>
            <Grid  size={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">{t("Clocks")}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setClockDialogOpen(true)}
                  disabled={clocks.length >= 4}
                >
                  {t("Add Clock")}
                </Button>
              </Box>
              <Grid container spacing={1}>
                {clocks.map((clock, index) => (
                  <Grid  key={index} size={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2">
                        <strong>{clock.name}</strong> ({clock.sections} {t("sections")})
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveClock(index)}
                      >
                        <RemoveCircleOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
          <Box>
            {editNoteIndex !== null && (
              <Button
                variant="contained"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                {t("Delete")}
              </Button>
            )}
          </Box>
          <Box>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              {t("Cancel")}
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {t("Save")}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {/* Add Clock Dialog */}
      <Dialog open={clockDialogOpen} onClose={() => setClockDialogOpen(false)}>
        <DialogTitle variant="h3">{t("Add Clock")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("Clock Name")}
            fullWidth
            variant="outlined"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            slotProps={{
              htmlInput: { maxLength: 30 }
            }}
          />
          <TextField
            margin="dense"
            label={t("Clock Sections")}
            type="number"
            fullWidth
            variant="outlined"
            value={clockSections}
            onChange={(e) => setClockSections(parseInt(e.target.value, 10))}
            slotProps={{
              htmlInput: { min: 2, max: 30 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClockDialogOpen(false)} color="secondary">
            {t("Cancel")}
          </Button>
          <Button onClick={handleAddClock} color="primary" variant="contained">
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          onDeleteNote(editNoteIndex);
          setDeleteDialogOpen(false);
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t("Are you sure you want to delete this note?")}
        itemPreview={
          <Box>
            <Typography variant="h4">{name || t("Untitled Note")}</Typography>
          </Box>
        }
      />
    </>
  );
}
