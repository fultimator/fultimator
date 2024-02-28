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

export default function EditNotes({ npc, setNpc }) {
  const { t } = useTranslate();
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
      <CustomHeader type="middle" addItem={addNotes} headerText={t("Notes")} />
      {npc.notes?.map((notes, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item sx={{ p: 0, m: 0 }}>
              <IconButton onClick={removeNotes(i)}>
                <RemoveCircleOutline />
              </IconButton>
            </Grid>
            <Grid item xs>
              <FormControl variant="standard" fullWidth>
                <TextField
                  id="name"
                  label={t("Name:")}
                  value={notes.name}
                  onChange={(e) => {
                    return onChangeNotes(i, "name", e.target.value);
                  }}
                  size="small"
                ></TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="standard" fullWidth>
                {/* <TextField
                  id="effect"
                  label={t("Details:")}
                  value={notes.effect}
                  onChange={(e) => {
                    return onChangeNotes(i, "effect", e.target.value);
                  }}
                  size="small"
                  sx={{ mb: 2 }}
                ></TextField> */}

                <CustomTextarea
                  label={t("Details:")}
                  value={notes.effect}
                  onChange={(e) => {
                    return onChangeNotes(i, "effect", e.target.value);
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
