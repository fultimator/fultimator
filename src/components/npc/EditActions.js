import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

export default function EditActions({ npc, setNpc }) {
  const onChangeActions = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.actions[i][key] = value;
      return newState;
    });
  };

  const addActions = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.actions) {
        newState.actions = [];
      }
      newState.actions.push({
        name: "",
        effect: "",
      });
      return newState;
    });
  };

  const removeActions = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.actions.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem" sx={{ mb: 1 }}>
        Other Actions
        <IconButton onClick={addActions}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.actions?.map((actions, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item>
              <IconButton onClick={removeActions(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs={10} lg={4}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label="Name:"
                  value={actions.name}
                  onChange={(e) => {
                    return onChangeActions(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12} lg={7}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  multiline
                  id="effect"
                  label="Effect:"
                  value={actions.effect}
                  onChange={(e) => {
                    return onChangeActions(i, "effect", e.target.value);
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
