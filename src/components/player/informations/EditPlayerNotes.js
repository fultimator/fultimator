import React from "react";
import {
  Divider,
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
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

  const handleNoteNameChange = (key) => {
    return (e) => {
      setPlayer((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.notes[key].name = e.target.value;
        return newState;
      });
    };
  };

  const handleNoteDescriptionChange = (key) => {
    return (e) => {
      setPlayer((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.notes[key].description = e.target.value;
        return newState;
      });
    };
  };

  const removeItem = (key) => {
    return () => {
      setPlayer((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.notes.splice(key, 1);
        return newState;
      });
    };
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
            alignItems="center"
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
            <Grid item xs={12} sm={12}>
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
            {index !== player.notes.length - 1 && (
              <Grid item xs={12}>
                <Divider />
              </Grid>
            )}
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
