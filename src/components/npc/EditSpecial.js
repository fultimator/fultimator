import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";

export default function EditSpecial({ npc, setNpc }) {
  const { t } = useTranslate();
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
        {t("Special Rules")}
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
                  label={t("Name:")}
                  value={special.name}
                  onChange={(e) => {
                    return onChangeSpecial(i, "name", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12} lg={6}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="spCost"
                  label={t("SP Cost:")}
                  type="number"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  value={special?.spCost ?? 1}
                  onChange={(e) => onChangeSpecial(i, "spCost", e.target.value)}
                  size="small"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="standard" fullWidth>
              <TextField
                  id="effect"
                  label={t("Effect:")}
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
