import {
  FormControl,
  Grid,
  TextField,
  useTheme,
  Paper,
  Autocomplete,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerTraits({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;


  const themes = [
    t("Ambition"),
    t("Anger"),
    t("Belonging"),
    t("Doubt"),
    t("Duty"),
    t("Guilt"),
    t("Hope"),
    t("Justice"),
    t("Mercy"),
    t("Vengeance"),
  ];

  const [inputTheme, setInputTheme] = useState(player.info.theme || "");

  const onChangeInfo = (key) => {
    return (event, value) => {
      setPlayer((prevState) => {
        const newState = { ...prevState };
        newState.info[key] = event.target ? event.target.value : value;
        return newState;
      });
    };
  };

  const handleThemeChange = (event, newValue) => {
    // If newValue is null, set it to an empty string
    const updatedValue = newValue === null ? '' : newValue;
  
    setInputTheme(updatedValue);
    
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.info.theme = updatedValue; // Update the theme in the player state
      return newState;
    });
  };
  
  
  const handleThemeInputChange = (event, newInputValue) => {
    setInputTheme(newInputValue);
    setPlayer((prevState) => {
      const newState = { ...prevState };
      newState.info.theme = newInputValue;
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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader type="top" headerText={t("Traits")}
            showIconButton={false}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="identity"
              label={t("Identity") + ":"}
              value={player.info.identity}
              onChange={onChangeInfo("identity")}
              InputProps={{
                readOnly: !isEditMode,
              }}
              inputProps={{ maxLength: 300 }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            id="theme-autocomplete"
            options={themes}
            value={inputTheme}
            onChange={handleThemeChange}
            onInputChange={handleThemeInputChange}
            freeSolo
            readOnly={!isEditMode} // Disable Autocomplete when not in edit mode
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Theme") + ":"}
                fullWidth
                inputProps={{ ...params.inputProps, maxLength: 50 }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="origin"
              label={t("Origin") + ":"}
              value={player.info.origin}
              onChange={onChangeInfo("origin")}
              InputProps={{
                readOnly: !isEditMode,
              }}
              inputProps={{ maxLength: 50 }}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}
