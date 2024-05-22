import { Add, Remove } from "@mui/icons-material";
import {
  Card,
  Divider,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
  Paper,
  Autocomplete,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";

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
    return (e, value) => {
      setPlayer((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.info[key] = value;
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
          <Autocomplete
            id="theme-autocomplete"
            options={themes}
            value={player.info.theme}
            onInputChange={onChangeInfo("theme")}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Theme:")}
                fullWidth
              />
            )}            
          />
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
