import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import weapons from "../../../../libs/weapons";
import qualities from "../../../../routes/equip/weapons/qualities";
import ChangeBase from "../../../../routes/equip/weapons/ChangeBase";
import ChangeMartial from "../../../../routes/equip/common/ChangeMartial";
import ChangeName from "../../../../routes/equip/common/ChangeName";
import ChangeType from "../../../../routes/equip/weapons/ChangeType";
import ChangeHands from "../../../../routes/equip/weapons/ChangeHands";
import ChangeAttr from "../../../../routes/equip/weapons/ChangeAttr";
import SelectQuality from "../../../../routes/equip/weapons/SelectQuality";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ChangeBonus from "../../../../routes/equip/weapons/ChangeBonus";
import ApplyRework from "../../../../routes/equip/common/ApplyRework";
import ChangeModifiers from "../ChangeModifiers";
import { Close } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import PrettyWeapon from "./PrettyWeapon";

export default function PlayerWeaponModal({
  open,
  onClose,
  editWeaponIndex,
  weapon,
  setWeapon,
  onAddWeapon,
  onDeleteWeapon,
}) {
  const { t } = useTranslate();
  const [base, setBase] = useState(weapon?.base || weapons[0]);
  const [name, setName] = useState(weapon?.name || weapons[0].name);
  const [type, setType] = useState(weapon?.type || weapons[0].type);
  const [hands, setHands] = useState(weapon?.hands || weapons[0].hands);
  const [att1, setAtt1] = useState(weapon?.att1 || weapons[0].att1);
  const [att2, setAtt2] = useState(weapon?.att2 || weapons[0].att2);
  const [martial, setMartial] = useState(weapon?.martial || false);
  const [damageBonus, setDamageBonus] = useState(weapon?.damageBonus || false);
  const [damageReworkBonus, setDamageReworkBonus] = useState(
    weapon?.damageReworkBonus || false
  );
  const [precBonus, setPrecBonus] = useState(weapon?.precBonus || false);
  const [rework, setRework] = useState(weapon?.rework || false);
  const [quality, setQuality] = useState(weapon?.quality || "");
  const [qualityCost, setQualityCost] = useState(weapon?.qualityCost || 0);
  const [totalBonus, setTotalBonus] = useState(weapon?.totalBonus || 0);
  const [selectedQuality, setSelectedQuality] = useState(
    weapon?.selectedQuality || ""
  );
  const [precModifier, setPrecModifier] = useState(weapon?.precModifier || 0);
  const [damageModifier, setDamageModifier] = useState(
    weapon?.damageModifier || 0
  );
  const [defModifier, setDefModifier] = useState(weapon?.defModifier || 0);
  const [mDefModifier, setMDefModifier] = useState(weapon?.mDefModifier || 0);
  const [isEquipped, setIsEquipped] = useState(weapon?.isEquipped || false);

  useEffect(() => {
    setBase(weapon?.base || weapons[0]);
    setName(weapon?.name || weapons[0].name);
    setType(weapon?.type || weapons[0].type);
    setHands(weapon?.hands || weapons[0].hands);
    setAtt1(weapon?.att1 || weapons[0].att1);
    setAtt2(weapon?.att2 || weapons[0].att2);
    setMartial(weapon?.martial || false);
    setDamageBonus(weapon?.damageBonus || false);
    setDamageReworkBonus(weapon?.damageReworkBonus || false);
    setPrecBonus(weapon?.precBonus || false);
    setRework(weapon?.rework || false);
    setQuality(weapon?.quality || "");
    setQualityCost(weapon?.qualityCost || 0);
    setTotalBonus(weapon?.totalBonus || 0);
    setSelectedQuality(weapon?.selectedQuality || "");
    setPrecModifier(weapon?.precModifier || 0);
    setDamageModifier(weapon?.damageModifier || 0);
    setDefModifier(weapon?.defModifier || 0);
    setMDefModifier(weapon?.mDefModifier || 0);
    setIsEquipped(weapon?.isEquipped || false);
  }, [weapon]);

  const calcCost = () => {
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

    // Bonus precision
    if (!rework && base.prec !== 1 && precBonus) {
      cost += 100;
      // Bonus precision (rework)
    } else if (rework && base.prec <= 1 && precBonus) {
      cost += 100;
    }

    // Quality
    cost += parseInt(qualityCost);
    return cost;
  };

  const calcDamage = () => {
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

    // Damage modifier
    damage += parseInt(damageModifier);

    return damage;
  };

  const calcPrec = () => {
    let prec = base.prec;

    // Bonus precision
    if (!rework && prec !== 1 && precBonus) {
      prec = 1;
    }
    // Bonus precision (rework)
    if (rework && prec === 1 && precBonus) {
      prec = 2;
    } else if (rework && prec === 0 && precBonus) {
      prec = 1;
    }

    // Precision modifier
    prec += parseInt(precModifier);

    return prec;
  };

  const handleSave = () => {
    const cost = calcCost();
    const damage = calcDamage();
    const prec = calcPrec();

    const updatedWeapon = {
      base,
      name,
      category: base.category,
      melee: base.melee || false,
      ranged: base.ranged || false,
      type,
      hands,
      att1,
      att2,
      martial,
      damageBonus,
      damageReworkBonus,
      precBonus,
      rework,
      quality,
      qualityCost,
      totalBonus,
      selectedQuality,
      cost,
      damage,
      prec,
      damageModifier: parseInt(damageModifier),
      precModifier: parseInt(precModifier),
      defModifier: parseInt(defModifier),
      mDefModifier: parseInt(mDefModifier),
      isEquipped:
        (weapon?.hands || weapons[0].hands) !== hands ||
        (weapon?.martial || false) !== martial
          ? false
          : isEquipped,
    };
    onAddWeapon(updatedWeapon);
  };

  const handleDelete = () => {
    if (editWeaponIndex !== null) {
      onDeleteWeapon(editWeaponIndex);
    }
    onClose();
  };

  const handleClearFields = () => {
    setBase(weapons[0]);
    setName(weapons[0].name);
    setType(weapons[0].type);
    setHands(weapons[0].hands);
    setAtt1(weapons[0].att1);
    setAtt2(weapons[0].att2);
    setMartial(weapons[0].martial);
    setDamageBonus(false);
    setDamageReworkBonus(false);
    setPrecBonus(false);
    setRework(false);
    setQuality("");
    setQualityCost(0);
    setSelectedQuality("");
    setDamageModifier(0);
    setPrecModifier(0);
    setDefModifier(0);
    setMDefModifier(0);
    setIsEquipped(false);
  };

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
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "lg",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Add Weapon")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent>
        <Grid container spacing={1} alignItems="center">
          {/* Change Base */}
          <Grid item xs={10} md={4}>
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
                setMartial(base.martial);
              }}
            />
          </Grid>
          {/* Change Martial */}
          <Grid item xs={2}>
            <ChangeMartial martial={martial} setMartial={setMartial} />
          </Grid>
          {/* Change Name */}
          <Grid item xs={12} md={6}>
            <ChangeName
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          {/* Change Type */}
          <Grid item xs={6} md={3}>
            <ChangeType
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </Grid>
          {/* Change Hands */}
          <Grid item xs={6} md={3}>
            <ChangeHands
              value={hands}
              onChange={(e) => setHands(e.target.value)}
            />
          </Grid>
          {/* Change Attributes */}
          <Grid item xs={12} md={6}>
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
          </Grid>
          <Accordion sx={{ width: "100%", marginLeft: "10px" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Modifiers</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ChangeModifiers
                    label={"Damage Modifier"}
                    value={damageModifier}
                    onChange={(e) => setDamageModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ChangeModifiers
                    label={"Precision Modifier"}
                    value={precModifier}
                    onChange={(e) => setPrecModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ChangeModifiers
                    label={"DEF Modifier"}
                    value={defModifier}
                    onChange={(e) => setDefModifier(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ChangeModifiers
                    label={"MDEF Modifier"}
                    value={mDefModifier}
                    onChange={(e) => setMDefModifier(e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} alignItems="center">
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
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <PrettyWeapon
            weapon={{
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
      </DialogContent>
      <DialogActions>
        {editWeaponIndex !== null && (
          <Button onClick={() => handleDelete(editWeaponIndex)} color="error">
            {t("Delete")}
          </Button>
        )}
        <Button onClick={handleSave} color="primary">
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
