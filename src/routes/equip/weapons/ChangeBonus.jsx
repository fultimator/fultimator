import { Checkbox, FormControl, FormControlLabel, Grid } from "@mui/material";
import { useTranslate } from "../../../translation/translate";

function ChangeBonus({
  basePrec,
  precBonus,
  damageBonus,
  damageReworkBonus,
  setPrecBonus,
  setDamageBonus,
  setDamageReworkBonus,
  rework,
  totalBonus,
}) {
  const { t } = useTranslate();
  const handlePrecChange = (e) => {
    setPrecBonus(e.target.checked);
  };

  const handleDamageChange = (e) => {
    setDamageBonus(e.target.checked);
  };

  const handleDamageReworkChange = (e) => {
    setDamageReworkBonus(e.target.checked);
  };

  return (
    <FormControl variant="outlined" fullWidth>
      <Grid container spacing={2}>
        {((rework && basePrec <= 1) || (!rework && basePrec === 0)) && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox checked={precBonus} onChange={handlePrecChange} />
              }
              label={`+1 ${t("Accuracy")} (+100z)`}
              size="small"
            />
          </Grid>
        )}
        {!rework && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox checked={damageBonus} onChange={handleDamageChange} />
              }
              label={`+4 ${t("Damage")} (+200z)`}
              size="small"
            />
          </Grid>
        )}
        {rework && (
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={damageReworkBonus}
                  onChange={handleDamageReworkChange}
                />
              }
              label={"+" + totalBonus + " " + t("Damage", true)}
              size="small"
            />
          </Grid>
        )}
      </Grid>
    </FormControl>
  );
}

export default ChangeBonus;
