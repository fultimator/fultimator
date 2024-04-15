import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import { Martial } from "../../../components/icons";
import groupBy from "../../../libs/groupby";
import armors from "./base";
import { useTranslate } from "../../../translation/translate";

function ChangeBase({ value, onChange }) {
  const { t } = useTranslate();
  const groupedArmors = groupBy(armors, "category");

  const options = [];

  for (const [category, armors] of Object.entries(groupedArmors)) {
    options.push(<ListSubheader key={category}>{category}</ListSubheader>);

    for (const armor of armors) {
      options.push(
        <MenuItem key={armor.name} value={armor.name}>
          {armor.name} {" "}
          {armor.martial && <Martial />}{" "}
        </MenuItem>
      );
    }
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("Armor/Shield")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label={t("Basic Armor/Shield")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default ChangeBase;
