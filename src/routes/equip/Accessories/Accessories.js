import { Grid, Paper, Button, useTheme, Divider } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState, useRef } from "react";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "./SelectQuality";
import ChangeName from "../common/ChangeName";
import qualities from "./qualities";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";

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

  const fileInputRef = useRef(null);

  const handleFileUpload = (data) => {
    if (data) {
      const { name, quality, cost } = data;

      if (name) {
        setName(name);
      }
      if (quality) {
        setSelectedQuality("");
        setQuality(quality);
      }
      if (cost) {
        setQualityCost(cost);
      }
    }
  };

  const handleClearFields = () => {
    setName("");
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
  };

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
          <CustomHeaderAlt
            headerText={t("Accessories")}
            icon={<AutoAwesome fontSize="large" />}
          />
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
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" onClick={handleClearFields}>
                    {t("Clear All Fields")}
                  </Button>
                </Grid>
              </Grid>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = JSON.parse(reader.result);
                      handleFileUpload(result);
                    };
                    reader.readAsText(file);
                  }
                }}
                style={{ display: "none" }}
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
