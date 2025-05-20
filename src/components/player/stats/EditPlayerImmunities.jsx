import React, { useEffect } from "react";
import { Grid, Paper, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";
import ReactMarkdown from "react-markdown";

export default function EditPlayerImmunities({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  // Ensure player.immunities is defined with default values if not present
  useEffect(() => {
    if (!player.immunities) {
      setPlayer((prevPlayer) => ({
        ...prevPlayer,
        immunities: {
          slow: false,
          dazed: false,
          enraged: false,
          weak: false,
          shaken: false,
          poisoned: false,
        },
      }));
    }
  }, [player, setPlayer]);

  if (!player.immunities) {
    return null;
  }

  const handleStatusChange = (status) => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      immunities: {
        ...prevPlayer.immunities,
        [status]: !prevPlayer.immunities[status],
      },
    }));
  };

  const statusDescriptions = {
    slow: "Dexterity is lowered by 2",
    dazed: "Insight is lowered by 2",
    enraged: "Both Dexterity and Insight are lowered by 2",
    weak: "Might is lowered by 2",
    shaken: "Willpower is lowered by 2",
    poisoned: "Both Might and Willpower are lowered by 2",
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
          headerText={t("Status Effect Immunities")}
          showIconButton={false}
        />
      </Grid>
      <Grid container spacing={1}>
        {Object.keys(statusDescriptions).map((status) => (
          <Grid item xs={12} md={6} key={status}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!player.immunities[status]}
                  onChange={() => handleStatusChange(status)}
                  disabled={!isEditMode}
                />
              }
              label={t(status.charAt(0).toUpperCase() + status.slice(1))}
              sx={{ marginRight: 2 }}
            />
            <Typography variant="body2" component="span" sx={{ fontSize: "0.8em" }}>
              <ReactMarkdown
                allowedElements={["strong"]}
                unwrapDisallowed={true}
              >
                {t(statusDescriptions[status])}
              </ReactMarkdown>
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
