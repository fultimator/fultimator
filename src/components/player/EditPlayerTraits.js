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
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";

export default function EditPlayerTraits({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  const themes = [
    t("Ambition"),
    t("Anger"),
    t("Belonging"),
    t("Doubt"),
    t("Duty"),
    t("Guilt"),
    t("Hope"),
    t("Justice"),
    t("Mercy"),
    t("Vengeance"),
  ];

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
          <CustomHeader type="top" headerText={t("Traits")} />
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="identity"
              label={t("Identity:")}
              value={player.info.identity}
              onChange={onChangeInfo("identity")}
            ></TextField>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="companionlvl">Theme:</InputLabel>
            <Select
              labelId="theme"
              id="select-theme"
              value={player.info.theme}
              label={t("Theme:")}
              onChange={onChangeInfo("theme")}
            >
              {themes.map((theme, i) => (
                <MenuItem key={i} value={theme}>
                  {theme}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="origin"
              label={t("Origin:")}
              value={player.info.origin}
              onChange={onChangeInfo("origin")}
            ></TextField>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}
