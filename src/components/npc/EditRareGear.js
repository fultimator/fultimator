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

export default function EditRareGear({ npc, setNpc }) {
  const { t } = useTranslate();
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
      <CustomHeader type="middle"addItem={addRareGear} headerText={t("Rare Equipment")} />
      {npc.raregear?.map((raregear, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item xs={1}>
              <IconButton onClick={removeRareGear(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs={11}>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={raregear.name}
                  onChange={(e) => {
                    return onChangeRareGear(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} ={raregear.effect}
                  onChange={(e) => {
                    return onChangeRareGear(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={raregear.effect}
                  onChange={(e) => {
                    return onChangeRareGear(i, "effect", e.target.value);
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
