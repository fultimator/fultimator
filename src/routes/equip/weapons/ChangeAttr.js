import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import attributes from "../../../libs/attributes";

function ChangeAttr({ att1, att2, setAtt1, setAtt2 }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="att1">Cambia Car 1</InputLabel>
          <Select
            labelId="att1"
            id="select-att1"
            value={att1}
            label="Cambia tipo"
            onChange={setAtt1}
          >
            {Object.entries(attributes).map((key, i) => {
              return (
                <MenuItem key={key[0]} value={key[0]}>
                  {key[1].short}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id="att2">Cambia Car 2</InputLabel>
          <Select
            labelId="att2"
            id="select-att2"
            value={att2}
            label="Cambia tipo"
            onChange={setAtt2}
          >
            {Object.entries(attributes).map((key, i) => {
              return (
                <MenuItem key={key[0]} value={key[0]}>
                  {key[1].short}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ChangeAttr;
