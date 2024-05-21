import React from "react";
import {
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
  Button,
  ButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function EditPlayerStats({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const { secondary } = theme.palette;

  const updateMaxStats = () => {
    setPlayer((prevPlayer) => {
      const maxHP = prevPlayer.lvl + prevPlayer.attributes.might * 5;
      const maxMP = prevPlayer.lvl + prevPlayer.attributes.insight * 5;
      return {
        ...prevPlayer,
        stats: {
          hp: { ...prevPlayer.stats.hp, max: maxHP, current: Math.min(prevPlayer.stats.hp.current, maxHP) },
          mp: { ...prevPlayer.stats.mp, max: maxMP, current: Math.min(prevPlayer.stats.mp.current, maxMP) },
          ip: { ...prevPlayer.stats.ip, max: 6, current: Math.min(prevPlayer.stats.ip.current, 6) },
        },
      };
    });
  };

  const changeStat = (stat, value) => () => {
    setPlayer((prevPlayer) => {
      const current = Math.max(0, Math.min(prevPlayer.stats[stat].current + value, prevPlayer.stats[stat].max));
      return { ...prevPlayer, stats: { ...prevPlayer.stats, [stat]: { ...prevPlayer.stats[stat], current } } };
    });
  };

  React.useEffect(() => {
    updateMaxStats();
  }, [player.lvl, player.attributes.might, player.attributes.insight]);

  const renderStatControls = (stat, label, color, increments) => (
    <Stack direction="row" spacing={2} sx={{ mt: 1 }} alignItems="center">
      <Typography variant="h3" sx={{ minWidth: '50px' }}>{t(label)}</Typography>
      <TextField
        label={t("Max")}
        value={player.stats[stat].max}
        variant="outlined"
        InputProps={{ readOnly: true }}
        sx={{ width: '80px' }}
      />
      <TextField
        label={t("Current")}
        value={player.stats[stat].current}
        error={stat === "hp" && player.stats.hp.current <= Math.floor(player.stats.hp.max / 2)}
        variant="outlined"
        sx={{ width: '80px' }}
      />
      <ButtonGroup variant="outlined" size="small" color={color}>
        {increments.map((val) => (
          <Button key={val} onClick={changeStat(stat, val)}>{val > 0 ? `+${val}` : val}</Button>
        ))}
      </ButtonGroup>
      <Button onClick={changeStat(stat, player.stats[stat].max)}>{t("Full")}</Button>
      {stat === "hp" && (
        <Button onClick={changeStat("hp", Math.floor(player.stats.hp.max / 2) - player.stats.hp.current)}>
          {t("Half")}
        </Button>
      )}
      {stat === "hp" && player.stats.hp.current <= Math.floor(player.stats.hp.max / 2) && (
        <Typography variant="h6" color="error">CRISIS</Typography>
      )}
    </Stack>
  );

  return (
    <Paper elevation={3} sx={{ p: "15px", borderRadius: "8px", border: `2px solid ${secondary}` }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader type="top" headerText={t("Statistics")} addItem={() => console.log(player)} />
        </Grid>
        <Grid item xs={12}>
          {renderStatControls("hp", "HP", "error", [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20])}
        </Grid>
        <Grid item xs={12}>
          {renderStatControls("mp", "MP", "info", [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20])}
        </Grid>
        <Grid item xs={12}>
          {renderStatControls("ip", "IP", "success", [-3, -2, -1, 1, 2, 3])}
        </Grid>
      </Grid>
    </Paper>
  );
}
