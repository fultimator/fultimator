import {
    FormControl,
    TextField
  } from "@mui/material";
  import { useTranslate } from "../../../translation/translate";
  
  function ChangeModifiers({label, value, onChange }) {
    const { t } = useTranslate();
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="modifier"
        label={t(label)}
        value={value}
        onChange={onChange}
        type="number"
        color={
          value > 0 ? "success" : value < 0 ? "error" : "primary"
        }
        focused={value > 0 || value < 0}
      />
    </FormControl>
  );
}
  
  export default ChangeModifiers;
  