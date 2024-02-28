import { RemoveCircleOutline } from "@mui/icons-material";

import {
  Grid,
  FormControl,
  IconButton,
  TextField,
  useMediaQuery
} from "@mui/material";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from '../common/CustomTextarea';
import CustomHeader from '../common/CustomHeader';

export default function EditSpecial({ npc, setNpc }) {
  const { t } = useTranslate();
  const isSmallScreen = useMediaQuery('(max-width: 899px)');
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
      <CustomHeader type={isSmallScreen ? 'middle' : 'top'} addItem={addSpecial} headerText={t("Special Rules")} />
      {npc.special?.map((special, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item sx={{ p: 0, m: 0 }}>
              <IconButton onClick={removeSpecial(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={special.name}
                  onChange={(e) => {
                    return onChangeSpecial(i, "name", e.target.value);
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
                  value={special?.spCost ?? 1}
                  onChange={(e) => onChangeSpecial(i, "spCost", e.target.value)}
                  size="small"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField id="effect" label={t("Effect:")} value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  id="effect"
                  label={t("Effect:")}
                  value={special.effect}
                  onChange={(e) => {
                    return onChangeSpecial(i, "effect", e.target.value);
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
