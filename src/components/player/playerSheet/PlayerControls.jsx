import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  Button,
  ButtonGroup,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import { typesList } from "../../../libs/types";
import { TypeIcon } from "../../types";

const STAT_INCREMENTS = {
  hp: [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20],
  mp: [-20, -10, -5, -2, -1, 1, 2, 5, 10, 20],
  ip: [-3, -2, -1, 1, 2, 3],
};

function StatChangeDialog({
  open,
  handleClose,
  stat,
  statKey,
  value,
  max,
  onApply,
  t,
  player,
}) {
  const [amount, setValue] = useState("");
  const [isHealing, setIsHealing] = useState(true);
  const [damageType, setDamageType] = useState("");
  const [isGuarding, setIsGuarding] = useState(false);
  const [isIgnoreResistance, setIsIgnoreResistance] = useState(false);
  const [isIgnoreImmunity, setIsIgnoreImmunity] = useState(false);

  const isHpStat = statKey === "hp";

  useEffect(() => {
    if (!open) return;
    setValue("");
    setIsHealing(true);
    setDamageType("");
    setIsGuarding(false);
    setIsIgnoreResistance(false);
    setIsIgnoreImmunity(false);
  }, [open, statKey]);

  const calculateDamage = (
    target,
    damageValue,
    damageTypeValue = "",
    guarding = false,
    ignoreResistance = false,
    ignoreImmunity = false,
  ) => {
    const affinities = target?.affinities || {};
    const damage = Number.parseInt(damageValue, 10) || 0;
    let finalDamage = damage;

    if (affinities[damageTypeValue]) {
      switch (affinities[damageTypeValue]) {
        case "vu":
          finalDamage = guarding ? damage : damage * 2;
          break;
        case "rs":
          finalDamage = ignoreResistance ? damage : Math.floor(damage * 0.5);
          break;
        case "ab":
          finalDamage = -damage;
          break;
        case "im":
          finalDamage = ignoreImmunity ? damage : 0;
          break;
        default:
          break;
      }
    } else if (guarding) {
      finalDamage = ignoreResistance ? damage : Math.floor(damage * 0.5);
    }

    return finalDamage;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number.parseInt(amount, 10) || 0;
    let adjustedValue;

    if (isHealing) {
      adjustedValue = val;
    } else if (isHpStat) {
      adjustedValue = -calculateDamage(
        player,
        val,
        damageType,
        isGuarding,
        isIgnoreResistance,
        isIgnoreImmunity,
      );
    } else {
      adjustedValue = -val;
    }

    onApply(adjustedValue);
    setValue("");
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          backdropFilter: "blur(4px)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          variant="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "1px solid #ddd",
            pb: 1,
          }}
        >
          {t("Update")} {stat}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
            minWidth: 250,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {stat}: {value} / {max}
          </Typography>
          <ToggleButtonGroup
            value={isHealing ? "heal" : "damage"}
            exclusive
            onChange={(_, v) => v !== null && setIsHealing(v === "heal")}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="heal" color="success" sx={{ px: 3 }}>
              {t("Heal")}
            </ToggleButton>
            <ToggleButton value="damage" color="error" sx={{ px: 3 }}>
              {t("Damage")}
            </ToggleButton>
          </ToggleButtonGroup>
          <TextField
            fullWidth
            type="number"
            label={t("Amount")}
            value={amount}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          {isHpStat && !isHealing && (
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="player-damage-type-label">
                  {t("combat_sim_damage_type")}
                </InputLabel>
                <Select
                  label={t("combat_sim_damage_type")}
                  labelId="player-damage-type-label"
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value)}
                  renderValue={(selected) =>
                    selected ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TypeIcon type={selected} />
                        <span>{t(selected)}</span>
                      </Box>
                    ) : (
                      t("combat_sim_none")
                    )
                  }
                >
                  <MenuItem value="">{t("combat_sim_none")}</MenuItem>
                  {typesList.map((type) => (
                    <MenuItem
                      key={type}
                      value={type}
                      sx={{ display: "flex", alignItems: "center", py: "6px" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: 70,
                        }}
                      >
                        <TypeIcon type={type} />
                        <ListItemText
                          sx={{ ml: 1, mb: 0, textTransform: "capitalize" }}
                        >
                          {t(type)}
                        </ListItemText>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isGuarding}
                    onChange={(e) => setIsGuarding(e.target.checked)}
                  />
                }
                label={t("combat_sim_is_guarding")}
              />
              {(damageType !== "" || isGuarding) && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isIgnoreResistance}
                      onChange={(e) => setIsIgnoreResistance(e.target.checked)}
                    />
                  }
                  label={t("combat_sim_ignore_resistance")}
                />
              )}
              {damageType !== "" && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isIgnoreImmunity}
                      onChange={(e) => setIsIgnoreImmunity(e.target.checked)}
                    />
                  }
                  label={t("combat_sim_ignore_immunity")}
                />
              )}
              {(damageType !== "" || isGuarding) && amount !== "" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    {t("combat_sim_calculated_damage")}:{" "}
                    <strong>
                      {(() => {
                        const calculated = calculateDamage(
                          player,
                          amount,
                          damageType,
                          isGuarding,
                          isIgnoreResistance,
                          isIgnoreImmunity,
                        );
                        return calculated < 0
                          ? `${Math.abs(calculated)} ${t("combat_sim_healing")}`
                          : `${calculated}`;
                      })()}
                    </strong>
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={handleClose} color="secondary" variant="contained">
            {t("Cancel")}
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {t("Apply")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function PlayerControls({ player, setPlayer }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [zenitChange, setZenitChange] = useState(0);
  const [changeType, setChangeType] = useState("+");
  const [statDialog, setStatChangeDialog] = useState(null);

  const changeStat = (stat, value) => () => {
    setPlayer((prevPlayer) => {
      const current = Math.max(
        0,
        Math.min(
          prevPlayer.stats[stat].current + value,
          prevPlayer.stats[stat].max,
        ),
      );
      return {
        ...prevPlayer,
        stats: {
          ...prevPlayer.stats,
          [stat]: { ...prevPlayer.stats[stat], current },
        },
      };
    });
  };

  const changeFabulaPoints = (value) => () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      info: {
        ...prevPlayer.info,
        fabulapoints: Math.max(
          0,
          Math.min(9999, prevPlayer.info.fabulapoints + value),
        ),
      },
    }));
  };

  const changeZenit = () => {
    const changeValue = changeType === "+" ? zenitChange : -zenitChange;
    setPlayer((prevPlayer) => {
      const newZenit = Math.max(
        0,
        Math.min(99999999, prevPlayer.info.zenit + changeValue),
      );
      return {
        ...prevPlayer,
        info: {
          ...prevPlayer.info,
          zenit: newZenit,
        },
      };
    });
    setZenitChange(0);
  };

  const handleZenitChangeInput = (e) => {
    const next = Number.parseInt(e.target.value, 10);
    setZenitChange(Number.isNaN(next) ? 0 : Math.max(0, next));
  };

  const handleStatApply = (amount) => {
    if (!statDialog) return;
    const key = statDialog.key;
    setPlayer((prev) => {
      const current = Math.max(
        0,
        Math.min(prev.stats[key].current + amount, prev.stats[key].max),
      );
      return {
        ...prev,
        stats: { ...prev.stats, [key]: { ...prev.stats[key], current } },
      };
    });
  };

  const renderStatControls = (stat, label, color) => {
    const increments = STAT_INCREMENTS[stat];
    const negativeIncrements = increments.filter((val) => val < 0);
    const positiveIncrements = increments.filter((val) => val > 0);

    return (
      <Grid
        container
        spacing={1}
        sx={{ alignItems: "center", flexWrap: "wrap" }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 3,
            md: 3,
          }}
        >
          <Typography
            variant="h3"
            sx={{ lineHeight: 1.2, width: "fit-content" }}
          >
            {`${t(label)}【${player.stats[stat].current}/${player.stats[stat].max}】`}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: "grow",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: "wrap" }}
            useFlexGap
          >
            <Button
              variant="outlined"
              color={color}
              size="small"
              onClick={() =>
                setStatChangeDialog({
                  key: stat,
                  label: t(label),
                  value: player.stats[stat].current,
                  max: player.stats[stat].max,
                })
              }
            >
              {t("Edit")}
            </Button>
            <Button
              variant="contained"
              color={color}
              size="small"
              onClick={changeStat(stat, player.stats[stat].max)}
            >
              {t("Full")}
            </Button>

            {stat === "hp" && (
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={changeStat(
                  "hp",
                  Math.floor(player.stats.hp.max / 2) - player.stats.hp.current,
                )}
              >
                {t("Half")}
              </Button>
            )}

            <ButtonGroup variant="outlined" size="small" color={color}>
              {negativeIncrements.map((val) => (
                <Button key={val} onClick={changeStat(stat, val)}>
                  {val}
                </Button>
              ))}
            </ButtonGroup>

            <ButtonGroup variant="outlined" size="small" color={color}>
              {positiveIncrements.map((val) => (
                <Button key={val} onClick={changeStat(stat, val)}>
                  +{val}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <Divider sx={{ my: 0.75 }} />
      <Paper
        elevation={3}
        sx={{
          borderRadius: "8px",
          border: "2px solid",
          borderColor: secondary,
          display: "flex",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            writingMode: "vertical-lr",
            textTransform: "uppercase",
            marginLeft: "-1px",
            marginRight: "10px",
            marginTop: "-1px",
            marginBottom: "-1px",
            backgroundColor: primary,
            color: "#fff",
            borderRadius: "0 8px 8px 0",
            transform: "rotate(180deg)",
            fontSize: "2em",
          }}
          align="center"
        >
          {t("Controls")}
        </Typography>

        <Grid container spacing={1} sx={{ p: 1 }}>
          <Grid size={12}>{renderStatControls("hp", "HP", "error")}</Grid>
          <Grid size={12}>{renderStatControls("mp", "MP", "info")}</Grid>
          <Grid size={12}>{renderStatControls("ip", "IP", "success")}</Grid>

          <Grid size={12}>
            <Grid container spacing={1} sx={{ alignItems: "center" }}>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                  md: 3,
                }}
              >
                <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                  {`${t("Fabula Points")}【${player.info.fabulapoints}】`}
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: "grow",
                }}
              >
                <ButtonGroup variant="outlined" size="small" color="primary">
                  <Button onClick={changeFabulaPoints(-1)}>-1</Button>
                  <Button onClick={changeFabulaPoints(1)}>+1</Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={12}>
            <Grid container spacing={1} sx={{ alignItems: "center" }}>
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                  md: 3,
                }}
              >
                <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
                  {`${t("Zenit")}【${player.info.zenit}】`}
                </Typography>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: "grow",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <ToggleButtonGroup
                    value={changeType}
                    exclusive
                    size="small"
                    onChange={(event, newChangeType) =>
                      newChangeType !== null && setChangeType(newChangeType)
                    }
                    aria-label="zenit-change-type"
                  >
                    <ToggleButton value="+" sx={{ fontWeight: 700, px: 1.2 }}>
                      {t("+")}
                    </ToggleButton>
                    <ToggleButton value="-" sx={{ fontWeight: 700, px: 1.2 }}>
                      {t("-")}
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <TextField
                    type="number"
                    size="small"
                    value={zenitChange}
                    onChange={handleZenitChangeInput}
                    sx={{ width: 90 }}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />

                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={changeZenit}
                  >
                    {t("Apply")}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <StatChangeDialog
        open={!!statDialog}
        handleClose={() => setStatChangeDialog(null)}
        stat={statDialog?.label}
        statKey={statDialog?.key}
        value={statDialog?.value}
        max={statDialog?.max}
        onApply={handleStatApply}
        t={t}
        player={player}
      />
    </>
  );
}
