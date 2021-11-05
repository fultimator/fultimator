import { FormControl, TextField } from "@mui/material";

function ChangeTraits({ monster, setMonster }) {
  const onChangeTraits = (e) => {
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.traits = e.target.value;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="traits"
        label="Traits"
        value={monster.traits}
        onChange={onChangeTraits}
      ></TextField>
    </FormControl>
  );
}

export default ChangeTraits;
