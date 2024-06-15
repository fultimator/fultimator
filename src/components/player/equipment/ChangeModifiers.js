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
      />
    </FormControl>
  );
}
  
  export default ChangeModifiers;
  