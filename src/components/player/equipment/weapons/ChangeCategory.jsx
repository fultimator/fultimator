import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import weaponCategories from "../../../../libs/weaponCategories";

import { useTranslate } from "../../../../translation/translate";

function ChangeCategory({ value, onChange }) {
  const { t } = useTranslate();

  const options = [];

  for (const category of weaponCategories) {
    options.push(
      <MenuItem key={category} value={category}>
        {t(category)}
      </MenuItem>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("Change Category")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label={t("Change Category")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default ChangeCategory;
