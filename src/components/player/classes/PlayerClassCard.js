import React from "react";
import { useTheme } from "@mui/material/styles";
import { Paper, Grid, Typography, Button, TextField } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function PlayerClassCard({
  classItem,
  onRemove,
  onLevelChange,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const handleLevelChange = (newValue) => {
    onLevelChange(newValue);
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
          <CustomHeader type="top" headerText={t(classItem.name)} />
        </Grid>
        {classItem.benefits && (
          <Grid item xs={12}>
            {classItem.benefits.hpplus !== 0 && (
              <Typography>
                {t("Permanently increase your maximum Hit Points by")}{" "}
                {classItem.benefits.hpplus}.
              </Typography>
            )}
            {classItem.benefits.mpplus !== 0 && (
              <Typography>
                {t("Permanently increase your maximum Mind Points by")}{" "}
                {classItem.benefits.mpplus}.
              </Typography>
            )}
            {classItem.benefits.ipplus !== 0 && (
              <Typography>
                {t("Permanently increase your maximum Inventory Points by")}{" "}
                {classItem.benefits.ipplus}.
              </Typography>
            )}
            {classItem.benefits.rituals && (
              <>
                {classItem.benefits.rituals.ritualism && (
                  <Typography>
                    {t("You may perform Rituals whose effects fall within the Ritualism discipline.")}
                  </Typography>
                )}
              </>
            )}
            {classItem.benefits.martials && (
              <>
                {classItem.benefits.martials.melee && (
                  <Typography>
                    {t("Gain the ability to equip martial melee weapons.")}
                  </Typography>
                )}
                {classItem.benefits.martials.ranged && (
                  <Typography>
                    {t("Gain the ability to equip martial ranged weapons.")}
                  </Typography>
                )}
                {classItem.benefits.martials.shields && (
                  <Typography>
                    {t("Gain the ability to equip martial shields.")}
                  </Typography>
                )}
                {classItem.benefits.martials.armor && (
                  <Typography>
                    {t("Gain the ability to equip martial armor.")}
                  </Typography>
                )}
              </>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            label="Level"
            type="number"
            value={classItem.lvl}
            InputProps={{ inputProps: { min: 1, max: 10 } }}
            onChange={(e) => handleLevelChange(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="secondary" onClick={onRemove}>
            {t("Remove")}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
