import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
  } from "@mui/material";
  import { Martial } from "../../../../components/icons";
  import shields from "../../../../libs/shields";
  import { useTranslate } from "../../../../translation/translate";
  
  function ChangeBase({ value, onChange }) {
    const { t } = useTranslate();
  
    const options = shields.map((shield) => (
      <MenuItem key={shield.name} value={shield.name}>
        {t(shield.name)} {shield.martial && <Martial />}
      </MenuItem>
    ));
  
    return (
      <FormControl fullWidth>
        <InputLabel id="type">{t("Shields")}</InputLabel>
        <Select
          labelId="type"
          id="select-type"
          value={value}
          label={t("Basic Shield")}
          onChange={onChange}
        >
          {options}
        </Select>
      </FormControl>
    );
  }
  
  export default ChangeBase;
  