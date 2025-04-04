import {
  Badge,
  Button,
  Typography,
  Grid,
  IconButton,
  Paper,
  TextField,
  Card,
} from "@mui/material";
import {
  AddCircleOutline,
  Close,
  RemoveCircleOutline,
  SouthEast,
  SouthWest,
} from "@mui/icons-material";

import { D10Icon, D12Icon, D20Icon, D4Icon, D6Icon, D8Icon } from "../icons";
import { useCallback, useEffect, useState } from "react";
import { prepareDice } from "../../libs/rolls";
import { useTranslate } from "../../translation/translate";
import { useTheme } from "@mui/material/styles";

export default function PrepareRoll({ savePreparedRoll, createRoll }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [d4, setd4] = useState(0);
  const [d6, setd6] = useState(0);
  const [d8, setd8] = useState(0);
  const [d10, setd10] = useState(0);
  const [d12, setd12] = useState(0);
  const [d20, setd20] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [malus, setMalus] = useState(0);
  const [label, setLabel] = useState("");

  const onRaise = (set) => {
    return (e) => {
      set((prevState) => prevState + 1);
      e.preventDefault();
    };
  };

  const onLower = (set) => {
    return (e) => {
      set((prevState) => (prevState > 0 ? prevState - 1 : 0));
      e.preventDefault();
    };
  };

  const onRoll = useCallback(() => {
    const { dice, modifier } = prepareDice(
      d4,
      d6,
      d8,
      d10,
      d12,
      d20,
      bonus,
      malus
    );

    if (dice.length > 0) {
      createRoll(dice, modifier, label);
    }
  }, [d4, d6, d8, d10, d12, d20, bonus, malus, createRoll, label]);

  const onReset = () => {
    setd4(0);
    setd6(0);
    setd8(0);
    setd10(0);
    setd12(0);
    setd20(0);
    setBonus(0);
    setMalus(0);
    setLabel("");
  };

  const onSave = () => {
    const { dice, modifier } = prepareDice(
      d4,
      d6,
      d8,
      d10,
      d12,
      d20,
      bonus,
      malus
    );

    if (dice.length > 0) {
      savePreparedRoll(dice, modifier, label);
    }
  };

  const handleEnter = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onRoll();
      }
    },
    [onRoll] // Necessary so that roll keeps track of them
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEnter);
    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  });

  return (
    <Paper elevation={1} sx={{ p: 2, mx: "auto" }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <Card sx={{ p: 2, bgcolor: "background.default" }}>
            <Typography>
              {t("Left-click on a die to add it to your pool")}
              <br />
              {t("Right-click a die to remove it from your hand")}
              <br />
              {t("Press enter to roll")}
            </Typography>
          </Card>
        </Grid>
        {/* Dice Row */}
        <Grid item xs={12}>
          <Grid container justifyContent="space-around" spacing={2}>
            {[
              { icon: <D4Icon />, count: d4, set: setd4 },
              { icon: <D6Icon />, count: d6, set: setd6 },
              { icon: <D8Icon />, count: d8, set: setd8 },
              { icon: <D10Icon />, count: d10, set: setd10 },
              { icon: <D12Icon />, count: d12, set: setd12 },
              { icon: <D20Icon />, count: d20, set: setd20 },
            ].map(({ icon, count, set }, index) => (
              <Grid item key={index}>
                <IconButton
                  sx={{
                    fontSize: "3rem",
                    color: isDarkMode ? "secondary.main" : "primary.main",
                  }}
                  onClick={onRaise(set)}
                  onContextMenu={onLower(set)}
                >
                  <Badge
                    badgeContent={count}
                    color="secondary"
                    sx={{ "& .MuiBadge-badge": { fontSize: "1rem" } }}
                  >
                    {icon}
                  </Badge>
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Modifiers */}
        <Grid item xs={12}>
          <Grid container justifyContent="center" spacing={2}>
            <Grid item>
              <IconButton
                onClick={onRaise(setBonus)}
                onContextMenu={onLower(setBonus)}
                sx={{ color: isDarkMode ? "#fff" : "#333" }}
              >
                <Badge badgeContent={bonus} color="success">
                  <AddCircleOutline sx={{ fontSize: "3rem" }} />
                </Badge>
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                onClick={onRaise(setMalus)}
                onContextMenu={onLower(setMalus)}
                sx={{ color: isDarkMode ? "#fff" : "#333" }}
              >
                <Badge badgeContent={malus} color="error">
                  <RemoveCircleOutline sx={{ fontSize: "3rem" }} />
                </Badge>
              </IconButton>
            </Grid>
          </Grid>
        </Grid>

        {/* Label */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("Description")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            variant="outlined"
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Grid container spacing={2} justifyContent="center" wrap="nowrap">
            <Grid item>
              <Button
                variant="contained"
                startIcon={<SouthWest sx={{ display: { xs: "none", sm: "inline-flex" } }} />}
                onClick={onRoll}
                color="primary"
              >
                {t("Roll")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={onReset}
                color="inherit"
              >
                {t("Reset")}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<SouthEast sx={{ display: { xs: "none", sm: "inline-flex" } }} />}
                onClick={onSave}
                color="primary"
              >
                {t("Prepare")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
