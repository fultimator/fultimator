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
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import useUploadJSON from "../../../hooks/useUploadJSON";
import ApplyRework from "../common/ApplyRework";

function ArmorShield() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [base, setBase] = useState(armor[0]);
  const [name, setName] = useState(armor[0].name);
  const [quality, setQuality] = useState("");
  const [martial, setMartial] = useState(false);
  const [qualityCost, setQualityCost] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [init, setInit] = useState(0);
  const [rework, setRework] = useState(false);

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
      const { base, name, quality, martial, cost, init, rework } = data;

      if (base) {
        setBase(base);
      }
      if (name) {
        setName(name);
      }
      if (quality) {
        setQuality(quality);
      }
      if (martial) {
        setMartial(martial);
      }
      if (cost) {
        setQualityCost(cost);
      }
      if (init) {
        setInit(init);
      }
      if (rework) {
        setRework(rework);
      }
    }
  });

  const handleClearFields = () => {
    setBase(armor[0]);
    setName(armor[0].name);
    setMartial(armor[0].martial);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setInit(armor[0].init);
    setRework(false);
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
            headerText={t("Armor and Shield")}
            icon={<AutoAwesome fontSize="large" />}
          />
          <Grid container spacing={2} alignItems="center">
            {/* Change Base */}
            <Grid item xs={4}>
              <ChangeBase
                value={base.name}
                onChange={(e) => {
                  const base = armor.find((el) => el.name === e.target.value);

                  setBase(base);
                  setName(base.name);
                  setMartial(base.martial);
                  setInit(base.init);
                }}
              />
            </Grid>
            {/* <Grid item xs={2}>
              <ChangeMartial martial={martial} setMartial={setMartial} />
            </Grid> */}
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
                {/* Rework */}
                <Grid item xs>
                  <ApplyRework rework={rework} setRework={setRework} />
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
            martial: martial,
            quality: quality,
            init: init,
            rework: rework,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default ArmorShield;
