import { Grid, Typography, Paper, useTheme } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState } from "react";
import Pretty from "./Pretty";
import ChangeQuality from "./ChangeQuality";
import SelectQuality from "./SelectQuality";
import ChangeName from "./ChangeName";
import qualities from "./qualities";

function Accessories() {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const quaternary = theme.palette.quaternary.main;

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
            Accessories
          </Typography>
        </Grid>
        <Paper
          sx={{
            background: "#ffffff",
            padding: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
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
