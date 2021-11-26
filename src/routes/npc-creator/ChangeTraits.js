import { FormControl, TextField } from "@mui/material";

function ChangeTraits({ npc, setnpc }) {
  const onChangeTraits = (e) => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.traits = e.target.value;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="traits"
        label="Tratti"
        value={npc.traits}
        onChange={onChangeTraits}
      ></TextField>
    </FormControl>
  );
}

export default ChangeTraits;
