import React from "react";
import { Grid, Paper, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import ReactMarkdown from "react-markdown";

export default function EditPlayerStatuses({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const handleStatusChange = (status) => {
    setPlayer((prevPlayer) => {
      // Check if the current status corresponds to an immunity
      const isImmune = player.immunities && player.immunities[status] === true;

      return {
        ...prevPlayer,
        statuses: {
          ...prevPlayer.statuses,
          [status]: isImmune ? false : !prevPlayer.statuses[status],
        },
      };
    });
  };

  const statusDescriptions = {
    slow: "Dexterity is lowered by 2",
    dazed: "Insight is lowered by 2",
    enraged: "Both Dexterity and Insight are lowered by 2",
    weak: "Might is lowered by 2",
    shaken: "Willpower is lowered by 2",
    poisoned: "Both Might and Willpower are lowered by 2",
    dexUp: "Dexterity is increased by 2",
    insUp: "Insight is increased by 2",
    migUp: "Might is increased by 2",
    wlpUp: "Willpower is increased by 2",
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid item xs={12}>
        <CustomHeader
          type="top"
          headerText={t("Statuses")}
          showIconButton={false}
        />
      </Grid>
      <Grid container spacing={1}>
        {Object.keys(statusDescriptions).map((status) =>  {
          // Check if the immunity for the current status is true
          const isImmune = player.immunities && player.immunities[status] === true;

          return (
          <Grid item xs={12} md={6} key={status}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={player.statuses[status]}
                  onChange={() => handleStatusChange(status)}
                  disabled={!isEditMode || isImmune}
                />
              }
              label={t(status.charAt(0).toUpperCase() + status.slice(1))}
              sx={{ marginRight: 2 }}
            />
            <Typography variant="body2" component="span" sx={{fontSize: "0.8em"}}>
              <ReactMarkdown
                allowedElements={["strong"]}
                unwrapDisallowed={true}
              >
                {t(statusDescriptions[status])}
              </ReactMarkdown>
            </Typography>
          </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
