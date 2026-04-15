import {
  Grid,
  Paper,
  useTheme,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChangeModifiers from "../../../components/player/equipment/ChangeModifiers";
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
  const [defModifier, setDefModifier] = useState(0);
  const [mDefModifier, setMDefModifier] = useState(0);
  const [initModifier, setInitModifier] = useState(0);
  const [magicModifier, setMagicModifier] = useState(0);
  const [precModifier, setPrecModifier] = useState(0);
  const [damageMeleeModifier, setDamageMeleeModifier] = useState(0);
  const [damageRangedModifier, setDamageRangedModifier] = useState(0);
  const [modifiersExpanded, setModifiersExpanded] = useState(false);

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

      if (base) setBase(base);
      if (name) setName(name);
      if (quality) setQuality(quality);
      if (martial) setMartial(martial);
      if (cost) setQualityCost(cost);
      if (init) setInit(init);
      if (rework) setRework(rework);

      if (data.defModifier) {
        setDefModifier(data.defModifier);
        setModifiersExpanded(true);
      }
      if (data.mDefModifier) {
        setMDefModifier(data.mDefModifier);
        setModifiersExpanded(true);
      }
      if (data.initModifier) {
        setInitModifier(data.initModifier);
        setModifiersExpanded(true);
      }
      if (data.magicModifier) {
        setMagicModifier(data.magicModifier);
        setModifiersExpanded(true);
      }
      if (data.precModifier) {
        setPrecModifier(data.precModifier);
        setModifiersExpanded(true);
      }
      if (data.damageMeleeModifier) {
        setDamageMeleeModifier(data.damageMeleeModifier);
        setModifiersExpanded(true);
      }
      if (data.damageRangedModifier) {
        setDamageRangedModifier(data.damageRangedModifier);
        setModifiersExpanded(true);
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
    setDefModifier(0);
    setMDefModifier(0);
    setInitModifier(0);
    setMagicModifier(0);
    setPrecModifier(0);
    setDamageMeleeModifier(0);
    setDamageRangedModifier(0);
    setModifiersExpanded(false);
  };

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
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
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            {/* Change Base */}
            <Grid size={4}>
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
            {/* <Grid size={2}>
              <ChangeMartial martial={martial} setMartial={setMartial} />
            </Grid> */}
            <Grid size={4}>
              <SelectQuality
                quality={selectedQuality}
                setQuality={(e) => {
                  const quality = qualities.find(
                    (el) => el.name === e.target.value,
                  );
                  setSelectedQuality(quality.name);
                  setQuality(quality.quality);
                  setQualityCost(quality.cost);
                }}
              />
            </Grid>

            <Grid size={4}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <ChangeQuality
                quality={quality}
                setQuality={(e) => setQuality(e.target.value)}
                qualityCost={qualityCost}
                setQualityCost={(e) => setQualityCost(e.target.value)}
              />
              <Divider />
            </Grid>
            <Grid size={12}>
              <Accordion
                sx={{ width: "100%" }}
                expanded={modifiersExpanded}
                onChange={() => setModifiersExpanded(!modifiersExpanded)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{t("Modifiers")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"DEF Modifier"}
                        value={defModifier}
                        onChange={(e) => setDefModifier(e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"MDEF Modifier"}
                        value={mDefModifier}
                        onChange={(e) => setMDefModifier(e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"INIT Modifier"}
                        value={initModifier}
                        onChange={(e) => setInitModifier(e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"Magic Modifier"}
                        value={magicModifier}
                        onChange={(e) => setMagicModifier(e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"Precision Modifier"}
                        value={precModifier}
                        onChange={(e) => setPrecModifier(e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"Damage (Melee) Modifier"}
                        value={damageMeleeModifier}
                        onChange={(e) => setDamageMeleeModifier(e.target.value)}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 6,
                        md: 4,
                      }}
                    >
                      <ChangeModifiers
                        label={"Damage (Ranged) Modifier"}
                        value={damageRangedModifier}
                        onChange={(e) =>
                          setDamageRangedModifier(e.target.value)
                        }
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Divider />
            </Grid>
            <Grid sx={{ py: 0 }} size={12}>
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                <Grid>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {t("Upload JSON")}
                  </Button>
                </Grid>
                <Grid>
                  <Button variant="outlined" onClick={handleClearFields}>
                    {t("Clear All Fields")}
                  </Button>
                </Grid>
                {/* Rework */}
                <Grid size="grow">
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
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <Pretty
          base={base}
          custom={{
            base,
            ...base,
            name: name,
            cost: cost,
            martial: martial,
            quality: quality,
            qualityCost: qualityCost,
            selectedQuality: selectedQuality,
            init: init,
            rework: rework,
            defModifier: defModifier,
            mDefModifier: mDefModifier,
            initModifier: initModifier,
            magicModifier: magicModifier,
            precModifier: precModifier,
            damageMeleeModifier: damageMeleeModifier,
            damageRangedModifier: damageRangedModifier,
            damageModifier: 0,
            isEquipped: false,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default ArmorShield;
