import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import groupBy from "../../../libs/groupby";
import weapons from "./base";
import { t } from "../../../translation/translate";

function ChangeBase({ value, onChange }) {
  const groupedWeapons = groupBy(weapons, "category");

  const options = [];

  for (const [category, weapons] of Object.entries(groupedWeapons)) {
    options.push(<ListSubheader key={category}>{category}</ListSubheader>);

    for (const weapon of weapons) {
      options.push(
        <MenuItem key={weapon.name} value={weapon.name}>
          {weapon.name}
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
        label="Basic Weapon"
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default ChangeBase;
