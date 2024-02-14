import { FormControl, TextField } from "@mui/material";
import { useTranslate } from "../../../translation/translate";

function ChangeName({ value, onChange }) {
  const { t } = useTranslate();
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="name"
        label={t("Change Name")}
        value={value}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
}

export default ChangeName;
