import React from "react";
import { Add, Remove } from "@mui/icons-material";
import {
  Card,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  Paper,
  Button,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerBasics({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [imgUrlTemp, setImgUrlTemp] = React.useState("");

  const onChange = (key) => {
    return (e) => {
      setPlayer((prevState) => {
        const newState = Object.assign({}, prevState);
        newState[key] = e.target.value;
        return newState;
      });
    };
  };

  const onChangeInfo = (key) => {
    return (e) => {
      setPlayer((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.info[key] = e.target.value;
        return newState;
      });
    };
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Basic Information")}
            addItem={() => console.log(player)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="name"
              label={t("Name:")}
              value={player.name}
              onChange={onChange("name")}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="pronouns"
              label={t("Pronouns:")}
              value={player.info.pronouns}
              onChange={onChangeInfo("pronouns")}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <EditPlayerLevel player={player} setPlayer={setPlayer} />
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="standard" fullWidth>
            <CustomTextarea
              id="description"
              label={t("Description:")}
              value={player.info.description}
              onChange={onChangeInfo("description")}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="fabulapoints"
              label={t("Fabula Points:")}
              value={player.info.fabulapoints}
              onChange={onChangeInfo("fabulapoints")}
              type="number"
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="zenit"
              label={t("Zenit:")}
              value={player.info.zenit}
              onChange={onChangeInfo("zenit")}
              type="number"
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl variant="standard" fullWidth>
            <Stack direction="row" spacing={2}>
              <TextField
                id="imgurl"
                label={t(
                  "Image URL (needs to end with .png, .jpg, .jpeg, etc...):"
                )}
                value={imgUrlTemp}
                onChange={(e) => {
                  setImgUrlTemp(e.target.value);
                }}
                fullWidth
              ></TextField>
              <Button
                variant="contained"
                onClick={() => {
                  setPlayer((prevState) => {
                    const newState = { ...prevState };
                    newState.info.imgurl = imgUrlTemp;
                    return newState;
                  });
                }}
                sx={{ height: "56px" }}
              >
                {t("Update Image")}
              </Button>
            </Stack>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}

function EditPlayerLevel({ player, setPlayer }) {
  const { t } = useTranslate();

  const onRaiseLevel = () => {
    setPlayer((prevState) => {
      if (prevState.lvl >= 60) return prevState;
      return { ...prevState, lvl: prevState.lvl + 1 };
    });
  };

  const onLowerLevel = () => {
    setPlayer((prevState) => {
      if (prevState.lvl <= 5) return prevState;
      return { ...prevState, lvl: prevState.lvl - 1 };
    });
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label={t("Level:")}
        value={player.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="decrease level"
              edge="start"
              onClick={onLowerLevel}
            >
              <Remove />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="increase level"
              edge="end"
              onClick={onRaiseLevel}
            >
              <Add />
            </IconButton>
          ),
        }}
      />
    </FormControl>
  );
}
