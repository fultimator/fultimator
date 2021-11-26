import { FormControl, Grid, TextField, Typography } from "@mui/material";

function ChangeDefs({ npc, setnpc }) {
  const onChangeDef = (key) => {
    return (e) => {
      setnpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.defs[key] = e.target.value;
        return newState;
      });
    };
  };
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Difese Extra</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            type="number"
            id="skills"
            label="+2 Dif +1 D.Mag"
            value={npc.defs["2def1dmag"]}
            onChange={onChangeDef("2def1dmag")}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="standard" fullWidth>
          <TextField
            type="number"
            id="skills"
            label="+1 Dif +2 D.Mag"
            value={npc.defs["1def2dmag"]}
            onChange={onChangeDef("1def2dmag")}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default ChangeDefs;
