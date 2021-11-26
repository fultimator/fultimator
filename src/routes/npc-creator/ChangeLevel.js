import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormControl, IconButton, TextField } from "@mui/material";

function ChangeLevel({ npc, setnpc }) {
  const onRaiseLevel = (e) => {
    setnpc((prevState) => {
      if (prevState.lvl >= 60) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl + 5;
      return newState;
    });
  };
  const onLowerLevel = (e) => {
    setnpc((prevState) => {
      if (prevState.lvl <= 5) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl - 5;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label="Livello"
        type="number"
        min={5}
        max={60}
        value={npc.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="start"
              onClick={onLowerLevel}
            >
              <FontAwesomeIcon icon={faMinus} />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="end"
              onClick={onRaiseLevel}
            >
              <FontAwesomeIcon icon={faPlus} />
            </IconButton>
          ),
        }}
      />
    </FormControl>
  );
}

export default ChangeLevel;
