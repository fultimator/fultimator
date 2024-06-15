import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import { Martial } from "../../../components/icons";
import groupBy from "../../../libs/groupby";
import weapons from "../../../libs/weapons";
import { useTranslate } from "../../../translation/translate";

function ChangeBase({ value, onChange }) {
  const { t } = useTranslate();
  const groupedWeapons = groupBy(weapons, "category");

  const options = [];

  for (const [category, weapons] of Object.entries(groupedWeapons)) {
    options.push(<ListSubheader key={category}>{t(category)}</ListSubheader>);

    for (const weapon of weapons) {
      options.push(
        <MenuItem key={weapon.name} value={weapon.name}>
          {t(weapon.name)} {" "}
          {weapon.martial && <Martial />}{" "}
        </MenuItem>
      );
    }
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("Weapons")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label={t("Basic Weapon")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default ChangeBase;
