import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function ChangeHands({ value, onChange }) {
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="hands">Change Hands</InputLabel>
      <Select
        labelId="hands"
        id="select-hands"
        value={value}
        label="Change Hands"
        onChange={onChange}
      >
        <MenuItem value={1}>One Hand</MenuItem>
        <MenuItem value={2}>Two Hand</MenuItem>
      </Select>
    </FormControl>
  );
}

export default ChangeHands;
