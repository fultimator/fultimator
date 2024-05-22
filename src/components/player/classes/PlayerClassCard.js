import { useTheme } from "@mui/material/styles";
import { Paper, Grid, Typography, Button } from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function PlayerClassCard({ classItem, onRemove }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

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
                Permanently increase your maximum Hit Points by{" "}
                {classItem.benefits.hpplus}.
              </Typography>
            )}
            {classItem.benefits.mpplus !== 0 && (
              <Typography>
                Permanently increase your maximum Mind Points by{" "}
                {classItem.benefits.mpplus}.
              </Typography>
            )}
            {classItem.benefits.ipplus !== 0 && (
              <Typography>
                Permanently increase your maximum Inventory Points by{" "}
                {classItem.benefits.ipplus}.
              </Typography>
            )}
            {classItem.benefits.rituals && (
              <>
                {classItem.benefits.rituals.ritualism && (
                  <Typography>
                    You may perform Rituals whose effects fall within the
                    Ritualism discipline.
                  </Typography>
                )}
              </>
            )}
            {classItem.benefits.martials && (
              <>
                {classItem.benefits.martials.melee && (
                  <Typography>
                    Gain the ability to equip martial melee weapons.
                  </Typography>
                )}
                {classItem.benefits.martials.ranged && (
                  <Typography>
                    Gain the ability to equip martial ranged weapons.
                  </Typography>
                )}
                {classItem.benefits.martials.shields && (
                  <Typography>
                    Gain the ability to equip martial shields.
                  </Typography>
                )}
                {classItem.benefits.martials.armor && (
                  <Typography>
                    Gain the ability to equip martial armor.
                  </Typography>
                )}
              </>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          {/* Button to remove class */}
          <Button variant="contained" color="secondary" onClick={onRemove}>
            {t("Remove")}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
