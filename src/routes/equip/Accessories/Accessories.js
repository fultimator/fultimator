import { Grid, Paper, useTheme } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState } from "react";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "./SelectQuality";
import ChangeName from "../common/ChangeName";
import qualities from "./qualities";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from '../../../components/common/CustomHeaderAlt';

function Accessories() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [name, setName] = useState("");
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");

  function calcCost() {
    return parseInt(qualityCost);
  }

  const cost = calcCost();

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={3}
          sx={{
            p: "14px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          {/* Header */}
          <CustomHeaderAlt headerText={t("Accessories")} icon={<AutoAwesome fontSize="large" />} />
          <Grid container sx={{ mt: 0 }} spacing={2} alignItems="center">
            <Grid item xs={6}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
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
          custom={{
            name: name,
            cost: cost,
            quality: quality,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default Accessories;
