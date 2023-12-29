import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

export default function EditSpecial({ npc, setNpc }) {
  const onChangeSpecial = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.special[i][key] = value;
      return newState;
    });
  };

  const addSpecial = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.special) {
        newState.special = [];
      }
      newState.special.push({
        name: "",
        effect: "",
      });
      return newState;
    });
  };

  const removeSpecial = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.special.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem" sx={{ mb: 1 }}>
        Special Rules
        <IconButton onClick={addSpecial}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.special?.map((special, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item>
              <IconButton onClick={removeSpecial(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs={10} lg={4}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label="Name:"
                  value={special.name}
                  onChange={(e) => {
                    return onChangeSpecial(i, "name", e.target.value);
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
                  value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
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
