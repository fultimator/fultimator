import { FormControl, TextField } from "@mui/material";

function ChangeName({ value, onChange }) {
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="name"
        label="Change Name"
        value={value}
        onChange={onChange}
      ></TextField>
    </FormControl>
  );
}

export default ChangeName;
