import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

export default function EditNotes({ npc, setNpc }) {
  const onChangeNotes = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.notes[i][key] = value;
      return newState;
    });
  };

  const addNotes = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.notes) {
        newState.notes = [];
      }
      newState.notes.push({
        name: "",
        effect: "",
      });
      return newState;
    });
  };

  const removeNotes = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.notes.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem" sx={{ mb: 1 }}>
        Notes
        <IconButton onClick={addNotes}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.notes?.map((notes, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item>
              <IconButton onClick={removeNotes(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs={10} lg={4}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  multiline
                  id="name"
                  label="Name:"
                  value={notes.name}
                  onChange={(e) => {
                    return onChangeNotes(i, "name", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  multiline
                  id="effect"
                  label="Details:"
                  value={notes.effect}
                  onChange={(e) => {
                    return onChangeNotes(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField>
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
}
