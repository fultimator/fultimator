import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function ChangeType({ npc, setnpc }) {
  const onChangeType = (e) => {
    setnpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.type = e.target.value;
      return newState;
    });
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="type">Specie</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={npc.type}
        label="Type"
        onChange={onChangeType}
      >
        <MenuItem value={"Bestia"}>Bestia</MenuItem>
        <MenuItem value={"Costrutto"}>Costrutto</MenuItem>
        <MenuItem value={"Demone"}>Demone</MenuItem>
        <MenuItem value={"Elementale"}>Elementale</MenuItem>
        <MenuItem value={"Mostro"}>Mostro</MenuItem>
        <MenuItem value={"Pianta"}>Pianta</MenuItem>
        <MenuItem value={"Non Morto"}>Non Morto</MenuItem>
        <MenuItem value={"Umanoide"}>Umanoide</MenuItem>
      </Select>
    </FormControl>
  );
}

export default ChangeType;
