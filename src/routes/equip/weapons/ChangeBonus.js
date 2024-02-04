import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { useTranslate } from "../../../translation/translate";

function ChangeBonus({
  basePrec,
  prec,
  damageBonus,
  setPrecBonus,
  setDamageBonus,
}) {
  const { t } = useTranslate();
  return (
    <FormControl variant="outlined" fullWidth>
      {basePrec === 0 && (
        <FormControlLabel
          control={<Checkbox value={prec} />}
          onChange={(e) => {
            setPrecBonus(e.target.checked);
          }}
          label={"+1 " + t("Accuracy", true)}
          size="small"
          sx={{ mb: -1 }}
        />
      )}
      <FormControlLabel
        control={<Checkbox value={damageBonus} />}
        onChange={(e) => {
          setDamageBonus(e.target.checked);
        }}
        label={"+4 " + t("Damage", true)}
        sx={{ mt: -1 }}
      />
    </FormControl>
  );
}

export default ChangeBonus;
