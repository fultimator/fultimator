import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Casino } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";

export default function GenericRolls({ player, isEditMode }) {
  const { t } = useTranslate();
  const [open, setOpen] = useState(false);
  const [attribute1, setAttribute1] = useState("");
  const [attribute2, setAttribute2] = useState("");
  const [result1, setResult1] = useState(null);
  const [result2, setResult2] = useState(null);
  const [sumResult, setSumResult] = useState(null);
  const [isCritFailure, setIsCritFailure] = useState(false);
  const [isCritSuccess, setIsCritSuccess] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRollDice = () => {
    setIsCritFailure(false);
    setIsCritSuccess(false);
    const rollDice = (attributeValue) =>
      Math.floor(Math.random() * attributeValue) + 1;

    const diceRoll1 = rollDice(getAttributeValue(attribute1));
    const diceRoll2 = rollDice(getAttributeValue(attribute2));

    // Check for critical failure
    const isCriticalFailure = diceRoll1 === 1 && diceRoll2 === 1;
    // Check for critical success
    const isCriticalSuccess = diceRoll1 >= 6 && diceRoll2 >= 6 && diceRoll1 === diceRoll2;

    if (isCriticalFailure) {
      setIsCritFailure(true);
    } else if (isCriticalSuccess) {
      setIsCritSuccess(true);
    }

    setResult1(diceRoll1);
    setResult2(diceRoll2);
    setSumResult(diceRoll1 + diceRoll2);
  };

  const attributes = ["DEX", "INS", "MIG", "WLP"];

  const getAttributeValue = (attribute) => {
    switch (attribute) {
      case "DEX":
        return currDex;
      case "INS":
        return currInsight;
      case "MIG":
        return currMight;
      case "WLP":
        return currWillpower;
      default:
        return 0;
    }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const calculateAttribute = (
    base,
    decreaseStatuses,
    increaseStatuses,
    min,
    max
  ) => {
    let adjustedValue = base;

    decreaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue -= 2;
    });

    increaseStatuses.forEach((status) => {
      if (player.statuses[status]) adjustedValue += 2;
    });

    return clamp(adjustedValue, min, max);
  };

  const currDex = calculateAttribute(
    player.attributes.dexterity,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12
  );
  const currInsight = calculateAttribute(
    player.attributes.insight,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12
  );
  const currMight = calculateAttribute(
    player.attributes.might,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12
  );
  const currWillpower = calculateAttribute(
    player.attributes.willpower,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12
  );

  return (
    <>
      <Button
        variant="contained"
        sx={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}
        startIcon={<Casino />}
        onClick={handleClickOpen}
      >
        {t("Roll")}
      </Button>
      <Dialog open={open} onClose={handleClose} PaperProps={{
        sx: {
          width: "80%",
          maxWidth: "lg",
        },
      }}>
        <DialogTitle variant="h3">{t("Choose Attributes to Roll")}</DialogTitle>
        <DialogContent >
          <Grid container spacing={2} sx={{marginTop: "10px"}}>
            <Grid item xs={6}>
              <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                <InputLabel>{t("Die 1")}</InputLabel>
                <Select
                  value={attribute1}
                  onChange={(e) => setAttribute1(e.target.value)}
                  label={t("Die 1")}
                >
                  {attributes.map((attr) => (
                    <MenuItem key={attr} value={attr}>
                      {t(attr)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>{t("Die 2")}</InputLabel>
                <Select
                  value={attribute2}
                  onChange={(e) => setAttribute2(e.target.value)}
                  label={t("Die 2")}
                >
                  {attributes.map((attr) => (
                    <MenuItem key={attr} value={attr}>
                      {t(attr)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {result1 !== null && result2 !== null && (
            <Typography variant="h2" sx={{ marginTop: "20px" }}>
              {t("Dice Results")}
            </Typography>
          )}
          {result1 !== null && (
            <Typography variant="h5">{t("Die 1") +  ": "  + result1}</Typography>
          )}
          {result2 !== null && (
            <Typography variant="h5">{t("Die 2") + ": "  + result2}</Typography>
          )}
          {sumResult !== null && (
            <Typography variant="h3">{t(`Result`) + ": " + sumResult}</Typography>
          )}
          {isCritFailure && (
            <Typography variant="h3" sx={{ color: "#bb2124" }}>
              {t("Critical Failure") + "!"}
            </Typography>
          )}
          {isCritSuccess && (
            <Typography variant="h3" sx={{ color: "green" }}>
              {t("Critical Success") + "!"}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("Close")}</Button>
          <Button
            onClick={handleRollDice}
            disabled={!attribute1 || !attribute2}
          >
            {t("Roll")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
