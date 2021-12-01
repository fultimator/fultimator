import { FormControl, TextField } from "@mui/material";

function ChangeName({ value, onChange }) {
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="name"
        label="Cambia Nome"
        value={value}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
}

export default ChangeName;
