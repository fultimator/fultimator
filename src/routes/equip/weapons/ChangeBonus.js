import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { t } from "../../../translation/translate";

function ChangeBonus({
  basePrec,
  prec,
  damageBonus,
  setPrecBonus,
  setDamageBonus,
}) {
  return (
    <FormControl variant="outlined" fullWidth>
      {basePrec === 0 && (
        <FormControlLabel
          control={<Checkbox value={prec} />}
          onChange={(e) => {
            setPrecBonus(e.target.checked);
          }}
          label={t("+1 Accuracy")}
          size="small"
          sx={{ mb: -1 }}
        />
      )}
      <FormControlLabel
        control={<Checkbox value={damageBonus} />}
        onChange={(e) => {
          setDamageBonus(e.target.checked);
        }}
        label={t("+4 Damage")}
        sx={{ mt: -1 }}
      />
    </FormControl>
  );
}

export default ChangeBonus;
