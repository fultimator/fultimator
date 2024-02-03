import {
  Badge,
  Button,
  Divider,
  Grid,
  IconButton,
  TextField,
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
import { t } from "../../translation/translate";

export default function PrepareRoll({ savePreparedRoll, createRoll }) {
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
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      rowSpacing={1}
      sx={{ mt: 1 }}
    >
      <Grid item>
        <IconButton
          sx={{ fontSize: "4rem", color: "primary.main" }}
          onContextMenu={onLower(setd4)}
          onClick={onRaise(setd4)}
        >
          <Badge
            badgeContent={d4}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <D4Icon />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          sx={{ fontSize: "4rem", color: "primary.main" }}
          onContextMenu={onLower(setd6)}
          onClick={onRaise(setd6)}
        >
          <Badge
            badgeContent={d6}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <D6Icon />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          sx={{ fontSize: "4rem", color: "primary.main" }}
          onContextMenu={onLower(setd8)}
          onClick={onRaise(setd8)}
        >
          <Badge
            badgeContent={d8}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <D8Icon />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          sx={{ fontSize: "4rem", color: "primary.main" }}
          onContextMenu={onLower(setd10)}
          onClick={onRaise(setd10)}
        >
          <Badge
            badgeContent={d10}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <D10Icon />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          sx={{ fontSize: "4rem", color: "primary.main" }}
          onContextMenu={onLower(setd12)}
          onClick={onRaise(setd12)}
        >
          <Badge
            badgeContent={d12}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <D12Icon />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          sx={{ fontSize: "4rem", color: "primary.main" }}
          onContextMenu={onLower(setd20)}
          onClick={onRaise(setd20)}
        >
          <Badge
            badgeContent={d20}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <D20Icon />
          </Badge>
        </IconButton>
      </Grid>
      <Divider
        orientation="vertical"
        flexItem
        sx={{ p: 0.1, bgcolor: "primary.main" }}
      />
      <Grid item>
        <IconButton
          sx={{ color: "primary.main" }}
          onContextMenu={onLower(setBonus)}
          onClick={onRaise(setBonus)}
        >
          <Badge
            badgeContent={bonus}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <AddCircleOutline sx={{ fontSize: "4rem" }} />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          sx={{ color: "primary.main" }}
          onContextMenu={onLower(setMalus)}
          onClick={onRaise(setMalus)}
        >
          <Badge
            badgeContent={malus}
            color="secondary"
            sx={{ "& .MuiBadge-badge": { fontSize: "1.2rem" } }}
          >
            <RemoveCircleOutline sx={{ fontSize: "4rem" }} />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          label="Description"
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
          }}
        ></TextField>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={1}
          rowSpacing={0}
          sx={{}}
        >
          <Grid item>
            <Button
              variant="contained"
              startIcon={
                <SouthWest sx={{ display: { xs: "none", sm: "inline" } }} />
              }
              onClick={onRoll}
            >
              {t("Roll")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={
                <Close sx={{ display: { xs: "none", sm: "inline" } }} />
              }
              onClick={onReset}
            >
              {t("Reset")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={
                <SouthEast sx={{ display: { xs: "none", sm: "inline" } }} />
              }
              onClick={onSave}
            >
              {t("Prepare")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
