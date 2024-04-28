import { Grid, Paper, Button, useTheme, Divider } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import weapons from "./base";
import ChangeBase from "./ChangeBase";
import ChangeAttr from "./ChangeAttr";
import ChangeMartial from "../common/ChangeMartial";
import ChangeBonus from "./ChangeBonus";
import ChangeHands from "./ChangeHands";
import ChangeName from "../common/ChangeName";
import ChangeType from "./ChangeType";
import Pretty from "./Pretty";
import ChangeQuality from "../common/ChangeQuality";
import SelectQuality from "./SelectQuality";
import qualities from "./qualities";
import ApplyRework from '../common/ApplyRework';
import { useTranslate } from "../../../translation/translate";
import CustomHeaderAlt from '../../../components/common/CustomHeaderAlt';

function Weapons() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const [base, setBase] = useState(weapons[0]);
  const [name, setName] = useState(weapons[0].name);
  const [type, setType] = useState(weapons[0].type);
  const [hands, setHands] = useState(weapons[0].hands);
  const [att1, setAtt1] = useState(weapons[0].att1);
  const [att2, setAtt2] = useState(weapons[0].att2);
  const [martial, setMartial] = useState(false);
  const [damageBonus, setDamageBonus] = useState(false);
  const [damageReworkBonus, setDamageReworkBonus] = useState(false);
  const [precBonus, setPrecBonus] = useState(false);
  const [rework, setRework] = useState(false);
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");

  const fileInputRef = useRef(null);

  const handleFileUpload = (data) => {
    if (data) {
      const {
        base,
        name,
        att1,
        att2,
        martial,
        type,
        hand,
        quality,
        qualityCost,
        damageBonus,
        damageReworkBonus,
        precBonus,
        rework
      } = data;

      if (base) {
        setBase(base);
      }
      if (name) {
        setName(name);
      }
      if (att1) {
        setAtt1(att1);
      }
      if (att2) {
        setAtt2(att2);
      }
      if (martial) {
        setMartial(martial);
      }
      if (type) {
        setType(type);
      }
      if (hand) {
        setHands(hand);
      }
      if (quality) {
        setSelectedQuality("");
        setQuality(quality);
      }
      if (qualityCost) {
        setQualityCost(qualityCost);
      }
      if (damageBonus) {
        setDamageBonus(damageBonus);
      }
      if (damageReworkBonus) {
        setDamageReworkBonus(damageReworkBonus);
      }
      if (precBonus) {
        setPrecBonus(precBonus);
      }
      if (rework) {
        setRework(rework);
      }
    }
  };

  const handleClearFields = () => {
    setBase(weapons[0]);
    setName(weapons[0].name);
    setType(weapons[0].type);
    setHands(weapons[0].hands);
    setAtt1(weapons[0].att1);
    setAtt2(weapons[0].att2);
    setMartial(weapons[0].martial)
    setDamageBonus(false);
    setDamageReworkBonus(false);
    setPrecBonus(false);
    setRework(false);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
  };

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
    if (!rework && base.prec !== 1 && precBonus) {
      cost += 100;
      // Bonus prec (rework)
    } else if (rework && base.prec <= 1 && precBonus) {
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
    if (!rework && damageBonus) {
      damage += 4;
    }
    if (rework && damageReworkBonus) {
      const bonus = Math.floor(calcCost() / 1000) * 2;
      damage += bonus;
    }

    return damage;
  }

  function calcPrec() {
    let prec = base.prec;

    // Bonus prec
    if (!rework && prec !== 1 && precBonus) {
      prec = 1;
    }
    // Bonus prec (rework)
    if (rework && prec === 1 && precBonus) {
      prec = 2;
    } else if (rework && prec === 0 && precBonus) {
      prec = 1;
    }

    return prec;
  }

  const cost = calcCost();
  const damage = calcDamage();
  const prec = calcPrec();

  // Calculate totalBonus when damageReworkBonus changes
  useEffect(() => {
    if (damageReworkBonus) {
      const bonus = Math.floor(cost / 1000) * 2;
      setTotalBonus(bonus);
    }
  }, [damageReworkBonus, cost]);

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
          <CustomHeaderAlt headerText={t("Rare Weapons")} icon={<AutoAwesome fontSize="large" />} />
          <Grid container spacing={1} alignItems="center">
            {/* Change Base */}
            <Grid item xs={4}>
              <ChangeBase
                value={base.name}
                onChange={(e) => {
                  const base = weapons.find((el) => el.name === e.target.value);

                  setBase(base);
                  setName(base.name);
                  setType(base.type);
                  setHands(base.hands);
                  setDamageBonus(false);
                  setDamageReworkBonus(false);
                  setPrecBonus(false);
                  setAtt1(base.att1);
                  setAtt2(base.att2);
                  setMartial(base.martial)
                }}
              />
            </Grid>
            {/* Change Martial */}
            <Grid item xs={2}>
              <ChangeMartial martial={martial} setMartial={setMartial} />
            </Grid>
            {/* Change Name */}
            <Grid item xs={6}>
              <ChangeName
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            {/* Change Type */}
            <Grid item xs={3}>
              <ChangeType
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </Grid>
            {/* Change Hands */}
            <Grid item xs={3}>
              <ChangeHands
                value={hands}
                onChange={(e) => setHands(e.target.value)}
              />
            </Grid>
            {/* Change Attributes */}
            <Grid item xs={6}>
              <ChangeAttr
                att1={att1}
                att2={att2}
                setAtt1={(e) => setAtt1(e.target.value)}
                setAtt2={(e) => setAtt2(e.target.value)}
              />
            </Grid>
            {/* Change Quality */}
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
            {/* Change Bonus */}
            <Grid item xs={6}>
              <ChangeBonus
                basePrec={base.prec}
                precBonus={precBonus}
                damageBonus={damageBonus}
                damageReworkBonus={damageReworkBonus}
                setPrecBonus={setPrecBonus}
                setDamageBonus={setDamageBonus}
                setDamageReworkBonus={setDamageReworkBonus}
                rework={rework}
                totalBonus={totalBonus}
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
              <Grid container spacing={1} alignItems="center">
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Upload JSON
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" onClick={handleClearFields}>
                    Clear All Fields
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
          base={base}
          custom={{
            base: base,
            name: name,
            att1: att1,
            att2: att2,
            martial: martial,
            type: type,
            hands: hands,
            category: base.category,
            melee: base.melee,
            ranged: base.ranged,
            cost: cost,
            damage: damage,
            prec: prec,
            quality: quality,
            qualityCost: qualityCost,
            damageBonus: damageBonus,
            damageReworkBonus: damageReworkBonus,
            precBonus: precBonus,
            rework: rework,
          }}
        />
      </Grid>
    </Grid>
  );
}
export default Weapons;
