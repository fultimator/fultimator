import { FormControl, TextField } from "@mui/material";

function ChangeName({ npc, setnpc }) {
  const onChangeName = (e) => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.name = e.target.value;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="name"
        label="Nome"
        value={npc.name}
        onChange={onChangeName}
      ></TextField>
    </FormControl>
  );
}

export default ChangeName;
