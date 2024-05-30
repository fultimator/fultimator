import React from "react";
import {
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerStatuses({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const { secondary } = theme.palette;

  /* STATUS LIST
    Slow - Dexterity attribute is lowered by 2 points to maximum 6
    Dazed - Insight attribute is lowered by 2 points to maximum 6
    Enraged - Both Dexterity and Insight attributes are lowered by 2 points to maximum 6
    Weak - Might attribute is lowered by 2 points to maximum 6
    Shaken - Willpower attribute is lowered by 2 points to maximum 6
    Poisoned - Both Might and Willpower attributes are lowered by 2 points to maximum 6
    
    Dex Up - Dexterity attribute is increased by 2 points to maximum 12
    Ins Up - Insight attribute is increased by 2 points to maximum 12
    Mig Up - Might attribute is increased by 2 points to maximum 12
    Wlp Up - Willpower attribute is increased by 2 points to maximum 12
  */

  const handleStatusChange = (status) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      statuses: {
        ...prevPlayer.statuses,
        [status]: !prevPlayer.statuses[status],
      },
    }));
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: "15px", borderRadius: "8px", border: `2px solid ${secondary}` }}
    >
      <Grid item xs={12}>
        <CustomHeader
          type="top"
          headerText={t("Statuses")}
          addItem={() => console.log(player)}
        />
      </Grid>
      <Grid container spacing={2}>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.slow}
                onChange={() => handleStatusChange("slow")}
                disabled={!isEditMode}
              />
            }
            label={t("Slow")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.dazed}
                onChange={() => handleStatusChange("dazed")}
                disabled={!isEditMode}
              />
            }
            label={t("Dazed")}
          />
        </Grid>
        {/* Add more checkboxes for other statuses */}
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.enraged}
                onChange={() => handleStatusChange("enraged")}
                disabled={!isEditMode}
              />
            }
            label={t("Enraged")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.weak}
                onChange={() => handleStatusChange("weak")}
                disabled={!isEditMode}
              />
            }
            label={t("Weak")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.shaken}
                onChange={() => handleStatusChange("shaken")}
                disabled={!isEditMode}
              />
            }
            label={t("Shaken")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.poisoned}
                onChange={() => handleStatusChange("poisoned")}
                disabled={!isEditMode}
              />
            }
            label={t("Poisoned")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.dexUp}
                onChange={() => handleStatusChange("dexUp")}
                disabled={!isEditMode}
              />
            }
            label={t("Dex Up")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.insUp}
                onChange={() => handleStatusChange("insUp")}
                disabled={!isEditMode}
              />
            }
            label={t("Ins Up")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.migUp}
                onChange={() => handleStatusChange("migUp")}
                disabled={!isEditMode}
              />
            }
            label={t("Mig Up")}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={player.statuses.wlpUp}
                onChange={() => handleStatusChange("wlpUp")}
                disabled={!isEditMode}
              />
            }
            label={t("Wlp Up")}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
