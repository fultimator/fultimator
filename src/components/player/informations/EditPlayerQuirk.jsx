import React, { useCallback } from "react";
import { Grid, TextField, useTheme, Paper } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerQuirk({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const onChangeQuirk = useCallback(
    (key) => (value) => {
      setPlayer((prevState) => ({
        ...prevState,
        quirk: {
          ...prevState.quirk,
          [key]: value,
        },
      }));
    },
    [setPlayer]
  );

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
            headerText={t("Quirk")}
            showIconButton={false}
          />
        </Grid>
        <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
          <Grid item xs={7}>
            <TextField
              id="name"
              label={t("Quirk Name") + ":"}
              value={player.quirk?.name || ""}
              onChange={(e) => onChangeQuirk("name")(e.target.value)}
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
              value={player.quirk?.description || ""}
              onChange={(e) => onChangeQuirk("description")(e.target.value)}
              maxLength={5000}
              maxRows={10}
              readOnly={!isEditMode}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <CustomTextarea
              id="effect"
              label={t("Effect") + ":"}
              value={player.quirk?.effect || ""}
              onChange={(e) => onChangeQuirk("effect")(e.target.value)}
              maxLength={5000}
              maxRows={10}
              readOnly={!isEditMode}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
