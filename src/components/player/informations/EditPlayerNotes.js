import React, { useState } from "react";
import {
  Divider,
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import RemoveCircleOutline from "@mui/icons-material/RemoveCircleOutline";
import { Add } from "@mui/icons-material";

export default function EditPlayerNotes({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [open, setOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const [clockName, setClockName] = useState("");
  const [clockSections, setClockSections] = useState(4);

  const handleNoteNameChange = (key) => (e) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[key].name = e.target.value;
      return newState;
    });
  };

  const handleNoteDescriptionChange = (key) => (e) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[key].description = e.target.value;
      return newState;
    });
  };

  const removeItem = (key) => () => {
    const confirmDelete = window.confirm(
      t("Are you sure you want to delete this note?")
    );
    if (confirmDelete) {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.notes.splice(key, 1);
        return newState;
      });
    }
  };

  const handleAddClock = (index) => {
    setSelectedNoteIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNoteIndex(null);
    setClockName("");
    setClockSections(4);
  };

  const handleConfirm = () => {
    if (!clockName.trim()) {
      alert(t("Clock name is required."));
      return;
    }

    if (clockSections < 2 || clockSections > 30) {
      alert(t("Sections must be between 2 and 30."));
      return;
    }

    setPlayer((prevState) => {
      const newState = { ...prevState };
      if (!newState.notes[selectedNoteIndex].clocks) {
        newState.notes[selectedNoteIndex].clocks = [];
      }
      newState.notes[selectedNoteIndex].clocks.push({
        name: clockName,
        sections: clockSections,
        state: new Array(clockSections).fill(false),
      });
      return newState;
    });
    handleClose();
  };

  const handleRemoveClock = (noteIndex, clockIndex) => {
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.notes[noteIndex].clocks.splice(clockIndex, 1);
      return newState;
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Notes")}
            addItem={
              isEditMode
                ? () => {
                    setPlayer((prevState) => {
                      const newState = { ...prevState };
                      newState.notes.push({
                        name: "",
                        description: "",
                        clocks: [],
                      });
                      return newState;
                    });
                  }
                : null
            }
            showIconButton={isEditMode}
            icon={Add}
          />
        </Grid>
        {player.notes.map((note, index) => (
          <Grid
            container
            spacing={1}
            sx={{ py: 1 }}
            //alignItems="center"
            key={index}
          >
            {isEditMode && (
              <Grid item sx={{ p: 0, m: 0 }}>
                <IconButton onClick={removeItem(index)}>
                  <RemoveCircleOutline />
                </IconButton>
              </Grid>
            )}
            <Grid item xs={7}>
              <TextField
                id="name"
                label={t("Note Name") + ":"}
                value={note.name}
                onChange={handleNoteNameChange(index)}
                inputProps={{ maxLength: 50 }}
                InputProps={{
                  readOnly: !isEditMode,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextarea
                id="description"
                label={t("Description") + ":"}
                value={note.description}
                onChange={handleNoteDescriptionChange(index)}
                maxLength={5000}
                maxRows={10}
                readOnly={!isEditMode}
              />
            </Grid>
            {isEditMode && (
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => handleAddClock(index)}
                  disabled={note.clocks && note.clocks.length >= 4}
                >
                  {t("Add Clock")}
                </Button>
              </Grid>
            )}
            {note.clocks &&
              note.clocks.map((clock, clockIndex) => (
                <Grid item xs={12} sm={6} md={4} key={clockIndex}>
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      py: 1,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Grid item xs={10}>
                      <Typography variant="body2">
                        <strong style={{ fontSize: "1.4em" }}>
                          {clock.name}
                        </strong>{" "}
                        ({t("Sections")}: {clock.sections})
                      </Typography>
                    </Grid>
                    {isEditMode && (
                      <Grid item xs={2}>
                        <IconButton
                          onClick={() => handleRemoveClock(index, clockIndex)}
                          sx={{
                            color: theme.palette.error.main,
                          }}
                        >
                          <RemoveCircleOutline />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              ))}
            {index !== player.notes.length - 1 && (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            )}
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("Add Clock")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Enter the clock details below:")}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="clockName"
            label={t("Clock Name")}
            type="text"
            fullWidth
            variant="standard"
            value={clockName}
            onChange={(e) => setClockName(e.target.value)}
            inputProps={{ maxLength: 30 }}
          />
          <TextField
            margin="dense"
            id="clockSections"
            label={t("Clock Sections")}
            type="number"
            fullWidth
            variant="standard"
            value={clockSections}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              setClockSections(value);
            }}
            inputProps={{ min: 2, max: 30 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Cancel")}</Button>
          <Button onClick={handleConfirm}>{t("Add")}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
