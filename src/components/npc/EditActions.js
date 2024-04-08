import { RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
} from "@mui/material";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';

export default function EditActions({ npc, setNpc }) {
  const { t } = useTranslate();
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
      <CustomHeader type="top" addItem={addActions} headerText={t("Other Actions")} />
      {npc.actions?.map((actions, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item sx={{ p: 0, m: 0 }}>
              <IconButton onClick={removeActions(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={actions.name}
                  onChange={(e) => {
                    return onChangeActions(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="spCost"
                  label={t("SP Cost:")}
                  type="number"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  value={actions?.spCost ?? 1}
                  onChange={(e) => onChangeActions(i, "spCost", e.target.value)}
                  size="small"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} value={actions.effect}
                  onChange={(e) => {
                    return onChangeActions(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={actions.effect}
                  onChange={(e) => {
                    return onChangeActions(i, "effect", e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
}
