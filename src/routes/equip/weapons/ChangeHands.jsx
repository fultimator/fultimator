import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useTranslate } from "../../../translation/translate";

function ChangeHands({ value, onChange }) {
  const { t } = useTranslate();
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="hands">{t("Change Hands")}</InputLabel>
      <Select
        labelId="hands"
        id="select-hands"
        value={value}
        label={t("Change Hands")}
        onChange={onChange}
      >
        <MenuItem value={1}>{t("One Hand")}</MenuItem>
        <MenuItem value={2}>{t("Two Hand")}</MenuItem>
      </Select>
    </FormControl>
  );
}

export default ChangeHands;
