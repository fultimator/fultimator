import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import groupBy from "../../../libs/groupby";
import qualities from "../../../libs/qualities";
import { useTranslate } from "../../../translation/translate";

function SelectBase({ value, onChange }) {
  const { t } = useTranslate();
  const groupedQualities = groupBy(qualities, "category");

  const options = [];

  for (const [category, qualities] of Object.entries(groupedQualities)) {
    options.push(<ListSubheader key={category}>{t(category)}</ListSubheader>);

    for (const quality of qualities) {
      options.push(
        <MenuItem key={quality.name} value={quality.name}>
          {t(quality.name)} ({quality.cost}z)
        </MenuItem>
      );
    }
  }

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="base-quality">{t("Select Base Quality")}</InputLabel>
      <Select
        labelId="base-quality"
        id="select-base-quality"
        value={value}
        label={t("Select Base Quality")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default SelectBase;
