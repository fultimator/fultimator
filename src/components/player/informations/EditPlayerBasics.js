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
  InputAdornment,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import { ReactComponent as ZenitIcon } from "../../zenit.svg";
import { ReactComponent as ExpIcon } from "../../exp.svg";
import {ReactComponent as FabulaIcon} from "../../fabula.svg";

export default function EditPlayerBasics({ player, setPlayer, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const [imgUrlTemp, setImgUrlTemp] = React.useState(player.info.imgurl);

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
              label={t("Name") + ":"}
              value={player.name}
              onChange={onChange("name")}
              InputProps={{
                readOnly: !isEditMode,
              }}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="pronouns"
              label={t("Pronouns") + ":"}
              value={player.info.pronouns}
              onChange={onChangeInfo("pronouns")}
              InputProps={{
                readOnly: !isEditMode,
              }}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <EditPlayerLevel
            player={player}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="standard" fullWidth>
            <CustomTextarea
              id="description"
              label={t("Description") + ":"}
              value={player.info.description}
              onChange={onChangeInfo("description")}
              readOnly={!isEditMode}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="fabulapoints"
              label={t("Fabula Points") + ":"}
              value={player.info.fabulapoints}
              onChange={onChangeInfo("fabulapoints")}
              type="number"
              InputProps={{
                readOnly: !isEditMode,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <FabulaIcon style={{ width: "28px", height: "28px" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="exp"
              label={t("Exp") + ":"}
              value={player.info.exp}
              onChange={onChangeInfo("exp")}
              type="number"
              InputProps={{
                readOnly: !isEditMode,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <ExpIcon style={{ width: "28px", height: "28px" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="zenit"
              label={t("Zenit") + ":"}
              value={player.info.zenit}
              onChange={onChangeInfo("zenit")}
              type="number"
              InputProps={{
                readOnly: !isEditMode,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <ZenitIcon style={{ width: "28px", height: "28px" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>
        {isEditMode ? (
          <>
            <Grid item xs={12} sm={8}>
              <TextField
                id="imgurl"
                label={t("Image URL") + ":"}
                value={imgUrlTemp}
                onChange={(e) => {
                  setImgUrlTemp(e.target.value);
                }}
                fullWidth
              ></TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button
                variant="contained"
                onClick={() => {
                  setPlayer((prevState) => {
                    const newState = { ...prevState };
                    newState.info.imgurl = imgUrlTemp;
                    return newState;
                  });
                }}
                sx={{ height: "56px", width: "100%" }}
              >
                {t("Update Image")}
              </Button>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setPlayer((prevState) => {
                    const newState = { ...prevState };
                    newState.info.imgurl = null;
                    return newState;
                  });
                }}
                sx={{ height: "56px", width: "100%" }}
              >
                {t("Remove Image")}
              </Button>
            </Grid>
          </>
        ) : null}
      </Grid>
    </Paper>
  );
}

function EditPlayerLevel({ player, setPlayer, isEditMode }) {
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
        label={t("Level") + ":"}
        sx={{ width: "100%" }}
        value={player.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="decrease level"
              edge="start"
              onClick={onLowerLevel}
              disabled={!isEditMode}
            >
              <Remove />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="increase level"
              edge="end"
              onClick={onRaiseLevel}
              disabled={!isEditMode}
            >
              <Add />
            </IconButton>
          ),
        }}
      />
    </FormControl>
  );
}
