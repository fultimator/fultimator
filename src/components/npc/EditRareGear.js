import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

export default function EditRareGear({ npc, setNpc }) {
  const onChangeRareGear = (i, key, value) => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      newState.raregear[i][key] = value;
      return newState;
    });
  };

  const addRareGear = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.raregear) {
        newState.raregear = [];
      }
      newState.raregear.push({
        name: "",
        effect: "",
      });
      return newState;
    });
  };

  const removeRareGear = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.raregear.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <Typography fontFamily="Antonio" fontSize="1.3rem" sx={{ mb: 1 }}>
        Rare Equipment
        <IconButton onClick={addRareGear}>
          <AddCircleOutline />
        </IconButton>
      </Typography>

      {npc.raregear?.map((raregear, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item>
              <IconButton onClick={removeRareGear(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs={10} lg={4}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  multiline
                  id="name"
                  label="Name:"
                  value={raregear.name}
                  onChange={(e) => {
                    return onChangeRareGear(i, "name", e.target.value);
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
                  label="Effect:"
                  value={raregear.effect}
                  onChange={(e) => {
                    return onChangeRareGear(i, "effect", e.target.value);
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
