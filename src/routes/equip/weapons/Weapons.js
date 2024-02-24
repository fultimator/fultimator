import { Grid, Typography, Paper, useTheme } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState } from "react";
import weapons from "./base";
import ChangeBase from "./ChangeBase";
import ChangeAttr from "./ChangeAttr";
import ChangeBonus from "./ChangeBonus";
import ChangeHands from "./ChangeHands";
import ChangeName from "../common/ChangeName";
import ChangeType from "./ChangeType";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "./SelectQuality";
import qualities from "./qualities";
import { useTranslate } from "../../../translation/translate";

function Weapons() {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const ternary = theme.palette.ternary.main;
  const quaternary = theme.palette.quaternary.main;
  const [base, setBase] = useState(weapons[0]);
  const [name, setName] = useState(weapons[0].name);
  const [type, setType] = useState(weapons[0].type);
  const [hands, setHands] = useState(weapons[0].hands);
  const [att1, setAtt1] = useState(weapons[0].att1);
  const [att2, setAtt2] = useState(weapons[0].att2);
  const [damageBonus, setDamageBonus] = useState(false);
  const [precBonus, setPrecBonus] = useState(false);
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");

  function calcCost() {
    let cost = base.cost;

    // Changed type
    if (type !== "physical") {
      cost += 100;
    }

    // Changed attributes
    if (base.att1 !== att1 || base.att2 !== att2) {
      if (att1 === att2) {
        cost += 50;
      }
    }

    // Bonus damage
    if (damageBonus) {
      cost += 200;
    }

    // Bonus prec
    if (base.prec !== 1 && precBonus) {
      cost += 100;
    }

    // Quality
    cost += parseInt(qualityCost);
    return cost;
  }

  function calcDamage() {
    let damage = base.damage;

    // Changed type
    if (base.hands === 1 && hands === 2) {
      damage += 4;
    }
    if (base.hands === 2 && hands === 1) {
      damage -= 4;
    }

    // Bonus damage
    if (damageBonus) {
      damage += 4;
    }

    return damage;
  }

  function calcPrec() {
    let prec = base.prec;

    // Bonus prec
    if (prec !== 1 && precBonus) {
      prec = 1;
    }
    return prec;
  }

  const cost = calcCost();
  const damage = calcDamage();
  const prec = calcPrec();

  return (
    <Grid container spacing={2}>
      {/* Form */}
      <Grid item xs={12} sm={6}>
        <Paper
          elevation={3}
          sx={{
            padding: 2,
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            borderRadius: "8px",
            border: "2px solid",
            borderColor: `${ternary}`
          }}
        >
          <Typography
            variant="h4"
            sx={{
              px: 3,
              py: 1,
              mx: -2,
              mt: -2,
              color: "#ffffff",
              background: `linear-gradient(to right, ${primary}, ${quaternary})`,
              borderRadius: "8px 8px 0 0",
            }}
          >
            <AutoAwesome sx={{ fontSize: 36, marginRight: 1 }} />
            {t("Rare Weapons")}
        </Typography>
          <Grid container sx={{mt: 0 }} spacing={2} alignItems="center">
            {/* Change Base */}
            <Grid item xs={6}>
              <ChangeBase
                value={base.name}
                onChange={(e) => {
                  const base = weapons.find((el) => el.name === e.target.value);

                  setBase(base);
                  setName(base.name);
                  setType(base.type);
                  setHands(base.hands);
                  setDamageBonus(false);
                  setPrecBonus(false);
                  setAtt1(base.att1);
                  setAtt2(base.att2);
                }}
              />
            </Grid>
            {/* Change Name */}
            <Grid item xs={6}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            {/* Change Type */}
            <Grid item xs={4}>
              <ChangeType
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </Grid>
            {/* Change Hands */}
            <Grid item xs={4}>
              <ChangeHands
                value={hands}
                onChange={(e) => setHands(e.target.value)}
              />
            </Grid>
            {/* Change Bonus */}
            <Grid item xs={4}>
              <ChangeBonus
                basePrec={base.prec}
                prec={prec}
                damageBonus={damageBonus}
                setPrecBonus={setPrecBonus}
                setDamageBonus={setDamageBonus}
              />
            </Grid>
            {/* Change Attributes */}
            <Grid item xs={5}>
              <ChangeAttr
                att1={att1}
                att2={att2}
                setAtt1={(e) => setAtt1(e.target.value)}
                setAtt2={(e) => setAtt2(e.target.value)}
              />
            </Grid>
            <Grid item xs={7}>
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
          base={base}
          custom={{
            name: name,
            att1: att1,
            att2: att2,
            type: type,
            hands: hands,
            category: base.category,
            melee: base.melee,
            ranged: base.ranged,
            cost: cost,
            damage: damage,
            prec: prec,
            quality: quality,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default Weapons;
