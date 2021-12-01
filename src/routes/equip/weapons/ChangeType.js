import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import types from "../../../libs/types";

function ChangeType({ value, onChange }) {
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="type">Cambia Tipo</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={value}
        label="Cambia tipo"
        onChange={onChange}
      >
        {Object.entries(types).map((key, i) => {
          return (
            <MenuItem key={key[0]} value={key[0]}>
              {key[1].long}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default ChangeType;
