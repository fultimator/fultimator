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
  Paper
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";

export default function EditPlayerBasics({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

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
      </Grid>
    </Paper>
  );
}

function EditPlayerLevel({ player, setPlayer }) {
  const { t } = useTranslate();
  const onRaiseLevel = (e) => {
    setPlayer((prevState) => {
      if (prevState.lvl >= 60) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl + 1;
      return newState;
    });
  };
  const onLowerLevel = (e) => {
    setPlayer((prevState) => {
      if (prevState.lvl <= 5) {
        return prevState;
      }

      const newState = Object.assign({}, prevState);
      newState.lvl = prevState.lvl - 1;
      return newState;
    });
  };
  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label={t("Level:")}
        //type="number"
        min={5}
        max={60}
        value={player.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              edge="start"
              onClick={onLowerLevel}
            >
              <Remove />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
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
