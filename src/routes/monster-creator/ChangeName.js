import { FormControl, TextField } from "@mui/material";

function ChangeName({ monster, setMonster }) {
  const onChangeName = (e) => {
    setMonster((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.name = e.target.value;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="name"
        label="Name"
        value={monster.name}
        onChange={onChangeName}
      ></TextField>
    </FormControl>
  );
}

export default ChangeName;
