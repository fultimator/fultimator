import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import groupBy from "../../../libs/groupby";
import qualities from "../Accessories/qualities";
import { t } from "../../../translation/translate";

function SelectQuality({ quality, setQuality }) {
  const groupedQualities = groupBy(qualities, "category");

  const options = [];

  for (const [category, qualities] of Object.entries(groupedQualities)) {
    options.push(<ListSubheader key={category}>{category}</ListSubheader>);

    for (const quality of qualities) {
      options.push(
        <MenuItem key={quality.name} value={quality.name}>
          {quality.name} ({quality.cost}z)
        </MenuItem>
      );
    }
  }

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="quality">{t("Select Quality")}</InputLabel>
      <Select
        labelId="quality"
        id="select-quality"
        value={quality}
        label="Select Quality"
        onChange={setQuality}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default SelectQuality;
