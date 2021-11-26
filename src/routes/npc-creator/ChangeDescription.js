import { FormControl, TextField } from "@mui/material";

function ChangeDescription({ npc, setnpc }) {
  const onChangeDescription = (e) => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.desc = e.target.value;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="Description"
        label="Descrizione"
        value={npc.desc}
        onChange={onChangeDescription}
        multiline
        rows={5}
      ></TextField>
    </FormControl>
  );
}

export default ChangeDescription;
