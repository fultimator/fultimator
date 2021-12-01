import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function ChangeHands({ value, onChange }) {
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="hands">Cambia Mani</InputLabel>
      <Select
        labelId="hands"
        id="select-hands"
        value={value}
        label="Cambia mani"
        onChange={onChange}
      >
        <MenuItem value={1}>Una Mano</MenuItem>
        <MenuItem value={2}>Due Mani</MenuItem>
      </Select>
    </FormControl>
  );
}

export default ChangeHands;
