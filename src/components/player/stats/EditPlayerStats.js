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

  const updateHpMax = () => {
    setPlayer({
      ...player,
      stats: {
        ...player.stats,
        hp: {
          ...player.stats.hp,
          max: player.lvl + player.attributes.might * 5,
        },
      },
    });
  };

  const updateMpMax = () => {
    setPlayer({
      ...player,
      stats: {
        ...player.stats,
        mp: {
          ...player.stats.mp,
          max: player.lvl + player.attributes.insight * 5,
        },
      },
    });
  };

  const updateIpMax = () => {
    setPlayer({
      ...player,
      stats: {
        ...player.stats,
        ip: {
          ...player.stats.ip,
          max: 6,
        },
      },
    });
  };

  const changeHp = (value) => {
    return () => {
      if (player.stats.hp.current + value > player.stats.hp.max) {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            hp: {
              ...player.stats.hp,
              current: player.stats.hp.max,
            },
          },
        });
      } else if (player.stats.hp.current + value < 0) {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            hp: {
              ...player.stats.hp,
              current: 0,
            },
          },
        });
      } else {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            hp: {
              ...player.stats.hp,
              current: player.stats.hp.current + value,
            },
          },
        });
      }
    };
  };

  const changeMp = (value) => {
    return () => {
      if (player.stats.mp.current + value > player.stats.mp.max) {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            mp: {
              ...player.stats.mp,
              current: player.stats.mp.max,
            },
          },
        });
      } else if (player.stats.mp.current + value < 0) {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            mp: {
              ...player.stats.mp,
              current: 0,
            },
          },
        });
      } else {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            mp: {
              ...player.stats.mp,
              current: player.stats.mp.current + value,
            },
          },
        });
      }
    };
  };

  const changeIp = (value) => {
    return () => {
      if (player.stats.ip.current + value > player.stats.ip.max) {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            ip: {
              ...player.stats.ip,
              current: player.stats.ip.max,
            },
          },
        });
      } else if (player.stats.ip.current + value < 0) {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            ip: {
              ...player.stats.ip,
              current: 0,
            },
          },
        });
      } else {
        setPlayer({
          ...player,
          stats: {
            ...player.stats,
            ip: {
              ...player.stats.ip,
              current: player.stats.ip.current + value,
            },
          },
        });
      }
    };
  };

  React.useEffect(() => {
    updateHpMax();
  }, [player.lvl, player.attributes.might]);

  React.useEffect(() => {
    updateMpMax();
  }, [player.lvl, player.attributes.insight]);

  React.useEffect(() => {
    updateIpMax();
  }, [player.lvl]);

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
            <Typography variant="h3">{t("HP")}</Typography>
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
              //onChange={onChangeInfo("hp.current")}
              variant="outlined"
            />
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="error">
                <Button onClick={changeHp(-1)}>-1</Button>
                <Button onClick={changeHp(-2)}>-2</Button>
                <Button onClick={changeHp(-5)}>-5</Button>
                <Button onClick={changeHp(-10)}>-10</Button>
                <Button onClick={changeHp(-20)}>-20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="error">
                <Button onClick={changeHp(+1)}>+1</Button>
                <Button onClick={changeHp(+2)}>+2</Button>
                <Button onClick={changeHp(+5)}>+5</Button>
                <Button onClick={changeHp(+10)}>+10</Button>
                <Button onClick={changeHp(+20)}>+20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={changeHp(player.stats.hp.max)}>Full</Button>
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
                <Button onClick={changeMp(-1)}>-1</Button>
                <Button onClick={changeMp(-2)}>-2</Button>
                <Button onClick={changeMp(-5)}>-5</Button>
                <Button onClick={changeMp(-10)}>-10</Button>
                <Button onClick={changeMp(-20)}>-20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="info">
                <Button onClick={changeMp(+1)}>+1</Button>
                <Button onClick={changeMp(+2)}>+2</Button>
                <Button onClick={changeMp(+5)}>+5</Button>
                <Button onClick={changeMp(+10)}>+10</Button>
                <Button onClick={changeMp(+20)}>+20</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={changeMp(player.stats.mp.max)}>Full</Button>
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
                <Button onClick={changeIp(-3)}>-3</Button>
                <Button onClick={changeIp(-2)}>-2</Button>
                <Button onClick={changeIp(-1)}>-1</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={5}>
              <ButtonGroup variant="outlined" size="small" color="info">
                <Button onClick={changeIp(+1)}>+1</Button>
                <Button onClick={changeIp(+2)}>+2</Button>
                <Button onClick={changeIp(+3)}>+3</Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={changeIp(player.stats.ip.max)}>Full</Button>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
