import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { useTranslate } from "../../../translation/translate";

function ChangeBonus({
  basePrec,
  prec,
  damageBonus,
  damageReworkBonus,
  setPrecBonus,
  setDamageBonus,
  setDamageReworkBonus,
  rework,
  totalBonus
}) {
  const { t } = useTranslate();
  const handlePrecChange = (e) => {
    setPrecBonus(e.target.value);
  };

  const handleDamageChange = (e) => {
    setDamageBonus(e.target.value);
  };

  const handleDamageReworkChange = (e) => {
    setDamageReworkBonus(e.target.value);
  };

  return (
    <FormControl variant="outlined" fullWidth>
      {((rework && basePrec < 2) || (!rework && basePrec === 0)) && (
        <FormControlLabel
          control={<Checkbox value={prec} onChange={handlePrecChange} />}
          label={"+1 " + t("Accuracy", true)}
          size="small"
          sx={{ mb: -1 }}
        />
      )}
      {!rework && (
        <FormControlLabel
          control={<Checkbox value={damageBonus} onChange={handleDamageChange} />}
          label={"+4 " + t("Damage", true)}
          size="small"
          sx={{ mt: -1 }}
        />
      )}
      {rework && (
        <FormControlLabel
          control={<Checkbox value={damageReworkBonus} onChange={handleDamageReworkChange} />}
          label={"+" + totalBonus + " " + t("Damage", true)}
          size="small"
          sx={{ mt: -1 }}
        />
      )}
    </FormControl>
  );
}

export default ChangeBonus;
