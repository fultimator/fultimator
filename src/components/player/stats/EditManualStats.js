import React, { useState, useEffect } from "react";
import { Grid, TextField, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../translation/translate";
import CustomHeader from "../../common/CustomHeader";

export default function EditManualStats({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  // Initialize state with player's current manual modifier values
  const [hpModifier, setHPModifier] = useState(player.modifiers?.hp || 0);
  const [mpModifier, setMPModifier] = useState(player.modifiers?.mp || 0);
  const [ipModifier, setIPModifier] = useState(player.modifiers?.ip || 0);
  const [defModifier, setDefModifier] = useState(player.modifiers?.def || 0);
  const [mdefModifier, setMdefModifier] = useState(player.modifiers?.mdef || 0);
  const [initModifier, setInitModifier] = useState(player.modifiers?.init || 0);
  const [meleePrecModifier, setMeleePrecModifier] = useState(
    player.modifiers?.meleePrec || 0
  );
  const [rangedPrecModifier, setRangedPrecModifier] = useState(
    player.modifiers?.rangedPrec || 0
  );
  const [magicPrecModifier, setMagicPrecModifier] = useState(
    player.modifiers?.magicPrec || 0
  );

  // Update player object with manual modifiers and trigger max stats update
  useEffect(() => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      modifiers: {
        hp: parseInt(hpModifier),
        mp: parseInt(mpModifier),
        ip: parseInt(ipModifier),
        def: parseInt(defModifier),
        mdef: parseInt(mdefModifier),
        init: parseInt(initModifier),
        meleePrec: parseInt(meleePrecModifier),
        rangedPrec: parseInt(rangedPrecModifier),
        magicPrec: parseInt(magicPrecModifier),
      },
    }));
    updateMaxStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hpModifier,
    mpModifier,
    ipModifier,
    defModifier,
    mdefModifier,
    initModifier,
    meleePrecModifier,
    rangedPrecModifier,
    magicPrecModifier,
  ]);

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
            headerText={t("Edit Stats Manually")}
            showIconButton={false}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Max HP Modifier")}
            type="number"
            fullWidth
            value={hpModifier}
            onChange={(e) => setHPModifier(e.target.value)}
            color={
              hpModifier > 0 ? "success" : hpModifier < 0 ? "error" : "primary"
            }
            focused={hpModifier > 0 || hpModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Max MP Modifier")}
            type="number"
            fullWidth
            value={mpModifier}
            onChange={(e) => setMPModifier(e.target.value)}
            color={
              mpModifier > 0 ? "success" : mpModifier < 0 ? "error" : "primary"
            }
            focused={mpModifier > 0 || mpModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Max IP Modifier")}
            type="number"
            fullWidth
            value={ipModifier}
            onChange={(e) => setIPModifier(e.target.value)}
            color={
              ipModifier > 0 ? "success" : ipModifier < 0 ? "error" : "primary"
            }
            focused={ipModifier > 0 || ipModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Max DEF Modifier")}
            type="number"
            fullWidth
            value={defModifier}
            onChange={(e) => setDefModifier(e.target.value)}
            color={
              defModifier > 0
                ? "success"
                : defModifier < 0
                ? "error"
                : "primary"
            }
            focused={defModifier > 0 || defModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Max MDEF Modifier")}
            type="number"
            fullWidth
            value={mdefModifier}
            onChange={(e) => setMdefModifier(e.target.value)}
            color={
              mdefModifier > 0
                ? "success"
                : mdefModifier < 0
                ? "error"
                : "primary"
            }
            focused={mdefModifier > 0 || mdefModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Max INIT Modifier")}
            type="number"
            fullWidth
            value={initModifier}
            onChange={(e) => setInitModifier(e.target.value)}
            color={
              initModifier > 0
                ? "success"
                : initModifier < 0
                ? "error"
                : "primary"
            }
            focused={initModifier > 0 || initModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Melee Precision Modifier")}
            type="number"
            fullWidth
            value={meleePrecModifier}
            onChange={(e) => setMeleePrecModifier(e.target.value)}
            color={
              meleePrecModifier > 0
                ? "success"
                : meleePrecModifier < 0
                ? "error"
                : "primary"
            }
            focused={meleePrecModifier > 0 || meleePrecModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Ranged Precision Modifier")}
            type="number"
            fullWidth
            value={rangedPrecModifier}
            onChange={(e) => setRangedPrecModifier(e.target.value)}
            color={
              rangedPrecModifier > 0
                ? "success"
                : rangedPrecModifier < 0
                ? "error"
                : "primary"
            }
            focused={rangedPrecModifier > 0 || rangedPrecModifier < 0}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label={t("Magic Precision Modifier")}
            type="number"
            fullWidth
            value={magicPrecModifier}
            onChange={(e) => setMagicPrecModifier(e.target.value)}
            color={
              magicPrecModifier > 0
                ? "success"
                : magicPrecModifier < 0
                ? "error"
                : "primary"
            }
            focused={magicPrecModifier > 0 || magicPrecModifier < 0}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
