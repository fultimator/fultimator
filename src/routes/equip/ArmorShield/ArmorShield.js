import { Grid, Typography, Paper, useTheme } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState } from "react";
import armor from "./base";
import ChangeBase from "./ChangeBase";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "../common/SelectQuality";
import ChangeName from "../common/ChangeName";
import qualities from "./qualities";
import { useTranslate } from "../../../translation/translate";

function ArmorShield() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const quaternary = theme.palette.quaternary.main;

  const [base, setBase] = useState(armor[0]);
  const [name, setName] = useState(armor[0].name);

  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");

  function calcCost() {
    let cost = base.cost;
    // Quality
    cost += parseInt(qualityCost);
    return cost;
  }

  const cost = calcCost();

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid item xs={12} sm={6}>
        <Grid item xs={12}>
          <Typography
            variant="h4"
            sx={{
              px: 3,
              py: 1,
              color: "#ffffff",
              background: `linear-gradient(to right, ${primary}, ${quaternary}, transparent)`,
            }}
          >
            <AutoAwesome sx={{ fontSize: 36, marginRight: 1 }} />
            {t("Armor and Shield")}
          </Typography>
        </Grid>
        <Paper
          sx={{
            background: "#ffffff",
            padding: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Change Base */}
            <Grid item xs={4}>
              <ChangeBase
                value={base.name}
                onChange={(e) => {
                  const base = armor.find((el) => el.name === e.target.value);

                  setBase(base);
                  setName(base.name);
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <SelectQuality
                quality={selectedQuality}
                setQuality={(e) => {
                  const quality = qualities.find(
                    (el) => el.name === e.target.value
                  );
                  setSelectedQuality(quality.name);
                  setQuality(quality.quality);
                  setQualityCost(quality.cost);
                }}
              />
            </Grid>

            <Grid item xs={4}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <ChangeQuality
                quality={quality}
                setQuality={(e) => setQuality(e.target.value)}
                qualityCost={qualityCost}
                setQualityCost={(e) => setQualityCost(e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Pretty */}
      <Grid item xs={12} sm={6}>
        <Pretty
          base={base}
          custom={{
            ...base,
            name: name,
            cost: cost,
            quality: quality,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default ArmorShield;
