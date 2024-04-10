import { Grid, Paper, useTheme, Button, Divider } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState, useRef } from "react";
import armor from "./base";
import ChangeBase from "./ChangeBase";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "./SelectQuality";
import ChangeName from "../common/ChangeName";
import qualities from "./qualities";
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from '../../../components/common/CustomHeaderAlt';
import useUploadJSON from "../../../hooks/useUploadJSON";

function ArmorShield() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

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

  const fileInputRef = useRef(null);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (data) {
      const {
        base,
        name,
        quality,
        cost
      } = data;

      if (base) {
        setBase(base);
      }
      if (name) {
        setName(name);
      }
      if (quality) {
        setQuality(quality);
      }
      if (cost) {
        setQualityCost(cost);
      }
    }
  });


  const handleClearFields = () => {
    setBase(armor[0]);
    setName(armor[0].name);
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
          <CustomHeaderAlt headerText={t("Armor and Shield")} icon={<AutoAwesome fontSize="large" />} />
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
              <Divider />
            </Grid>
            <Grid item xs={12} sx={{ py: 0 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Button variant="outlined" onClick={() => fileInputRef.current.click()}>
                    Upload JSON
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" onClick={handleClearFields}>
                    Clear All Fields
                  </Button>
                </Grid>
              </Grid>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
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
            base,
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
