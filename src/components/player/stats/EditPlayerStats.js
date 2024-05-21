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
  Slider,
  Button,
  ButtonGroup,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import ExplainPlayerAttributes from "./ExplainPlayerAttributes";

export default function EditPlayerStats({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;

  /* Statistics
  hp: {
    max: player.lvl + (player.attributes.might * 5),
    current: // Editable field that shows the current HP of the player,
  }
  mp: {
    max: player.lvl + (player.attributes.insight * 5),
    current: // Editable field that shows the current MP of the player,
  }
  ip: {
    max: 6,
    current: // Editable field that shows the current IP of the player,
  }
  */

  const updateMaxStats = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      stats: {
        ...prevPlayer.stats,
        hp: {
          ...prevPlayer.stats.hp,
          max: prevPlayer.lvl + prevPlayer.attributes.might * 5,
          current: Math.min(
            prevPlayer.stats.hp.current,
            prevPlayer.lvl + prevPlayer.attributes.might * 5
          ),
        },
        mp: {
          ...prevPlayer.stats.mp,
          max: prevPlayer.lvl + prevPlayer.attributes.insight * 5,
          current: Math.min(
            prevPlayer.stats.mp.current,
            prevPlayer.lvl + prevPlayer.attributes.insight * 5
          ),
        },
        ip: {
          ...prevPlayer.stats.ip,
          max: 6,
          current: Math.min(prevPlayer.stats.ip.current, 6),
        },
      },
    }));
  };

  const changeStat = (stat, value) => () => {
    setPlayer((prevPlayer) => {
      const current = prevPlayer.stats[stat].current + value;
      return {
        ...prevPlayer,
        stats: {
          ...prevPlayer.stats,
          [stat]: {
            ...prevPlayer.stats[stat],
            current: Math.max(0, Math.min(current, prevPlayer.stats[stat].max)),
          },
        },
      };
    });
  };

  React.useEffect(() => {
    updateMaxStats();
  }, [player.lvl, player.attributes.might, player.attributes.insight]);

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
            headerText={t("Statistics")}
            addItem={() => console.log(player)}
          />
        </Grid>
        {/* HP Statistic */}
        <Grid item xs={12} md={12}>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Stack direction="column">
              <Typography variant="h3">{t("HP")}</Typography>
              <Typography variant="h4" color="error">
                {player.stats.hp.current <= Math.floor(player.stats.hp.max / 2)
                  ? "CRYSYS"
                  : null}
              </Typography>
            </Stack>
            <TextField
              id="outlined-basic"
              label={t("Max")}
              value={player.stats.hp.max}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="outlined-basic"
              label={t("Current")}
              value={player.stats.hp.current}
              error={
                player.stats.hp.current <= Math.floor(player.stats.hp.max / 2)
              }
              //onChange={onChangeInfo("hp.current")}
              variant="outlined"
            />
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="error">
                <Button onClick={changeStat("hp", -1)}>-1</Button>
                <Button onClick={changeStat("hp", -2)}>-2</Button>
                <Button onClick={changeStat("hp", -5)}>-5</Button>
                <Button onClick={changeStat("hp", -10)}>-10</Button>
                <Button onClick={changeStat("hp", -20)}>-20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="error">
                <Button onClick={changeStat("hp", +1)}>+1</Button>
                <Button onClick={changeStat("hp", +2)}>+2</Button>
                <Button onClick={changeStat("hp", +5)}>+5</Button>
                <Button onClick={changeStat("hp", +10)}>+10</Button>
                <Button onClick={changeStat("hp", +20)}>+20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={changeStat("hp", player.stats.hp.max)}>
                {t("Full")}
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                onClick={changeStat(
                  "hp",
                  Math.floor(player.stats.hp.max / 2) - player.stats.hp.current
                )}
              >
                {t("Half")}
              </Button>
            </Grid>
          </Stack>
        </Grid>
        {/* MP Statistic */}
        <Grid item xs={12} md={12}>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="h3">{t("MP")}</Typography>
            <TextField
              id="outlined-basic"
              label={t("Max")}
              value={player.stats.mp.max}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="outlined-basic"
              label={t("Current")}
              value={player.stats.mp.current}
              //onChange={onChangeInfo("mp.current")}
              variant="outlined"
            />
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="info">
                <Button onClick={changeStat("mp", -1)}>-1</Button>
                <Button onClick={changeStat("mp", -2)}>-2</Button>
                <Button onClick={changeStat("mp", -5)}>-5</Button>
                <Button onClick={changeStat("mp", -10)}>-10</Button>
                <Button onClick={changeStat("mp", -20)}>-20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="info">
                <Button onClick={changeStat("mp", +1)}>+1</Button>
                <Button onClick={changeStat("mp", +2)}>+2</Button>
                <Button onClick={changeStat("mp", +5)}>+5</Button>
                <Button onClick={changeStat("mp", +10)}>+10</Button>
                <Button onClick={changeStat("mp", +20)}>+20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={changeStat("mp", player.stats.mp.max)}>
                {t("Full")}
              </Button>
            </Grid>
          </Stack>
        </Grid>
        {/* IP Statistic */}
        <Grid item xs={12} md={12}>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="h3">{t("IP")}</Typography>
            <TextField
              id="outlined-basic"
              label={t("Max")}
              value={player.stats.ip.max}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              id="outlined-basic"
              label={t("Current")}
              value={player.stats.ip.current}
              //onChange={onChangeInfo("ip.current")}
              variant="outlined"
            />
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="info">
                <Button onClick={changeStat("ip", -3)}>-3</Button>
                <Button onClick={changeStat("ip", -2)}>-2</Button>
                <Button onClick={changeStat("ip", -1)}>-1</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="info">
                <Button onClick={changeStat("ip", +1)}>+1</Button>
                <Button onClick={changeStat("ip", +2)}>+2</Button>
                <Button onClick={changeStat("ip", +3)}>+3</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={changeStat("ip", player.stats.ip.max)}>
                {t("Full")}
              </Button>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
