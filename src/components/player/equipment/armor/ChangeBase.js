import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Martial } from "../../../../components/icons";
import armor from "../../../../libs/armor";
import { useTranslate } from "../../../../translation/translate";

function ChangeBase({ value, onChange }) {
  const { t } = useTranslate();

  const options = armor.map((armorItem) => (
    <MenuItem key={armorItem.name} value={armorItem.name}>
      {t(armorItem.name)} {armorItem.martial && <Martial />}
    </MenuItem>
  ));

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("Armor")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label={t("Basic Armor")}
        onChange={onChange}
      >
        {options}
      </Select>
    </FormControl>
  );
}

export default ChangeBase;
