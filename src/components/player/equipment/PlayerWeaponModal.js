import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  useTheme,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import { useTranslate } from "../../../translation/translate";
import weapons from "../../../routes/equip/weapons/base";
import qualities from "../../../routes/equip/weapons/qualities";
import attributes from "../../../libs/attributes";
import types from "../../../libs/types";
import ChangeBase from "../../../routes/equip/weapons/ChangeBase";
import ChangeMartial from "../../../routes/equip/common/ChangeMartial";
import ChangeName from "../../../routes/equip/common/ChangeName";
import ChangeType from "../../../routes/equip/weapons/ChangeType";
import ChangeHands from "../../../routes/equip/weapons/ChangeHands";
import ChangeAttr from "../../../routes/equip/weapons/ChangeAttr";
import SelectQuality from "../../../routes/equip/weapons/SelectQuality";
import ChangeQuality from "../../../routes/equip/common/ChangeQuality";
import ChangeBonus from "../../../routes/equip/weapons/ChangeBonus";
import ApplyRework from "../../../routes/equip/common/ApplyRework";
import { Martial } from "../../icons";
import { OpenBracket, CloseBracket } from "../../Bracket";
import Diamond from "../../Diamond";
//import PrettySingle from "../../../routes/equip/weapons/Pretty";
import { Close } from "@mui/icons-material";

export default function PlayerWeaponModal({ open, onClose }) {
  const { t } = useTranslate();
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
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} alignItems="center">
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
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <PrettySingle
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
        <Button variant="contained" color="secondary">
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PrettySingle({ weapon, showActions }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  const ref = useRef();

  const StyledMarkdown = styled(ReactMarkdown)({
    whiteSpace: "pre-line",
  });

  return (
    <>
      <Card>
        <div
          ref={ref}
          style={{ backgroundColor: "white", background: "white" }}
        >
          <Stack>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                background: `${primary}`,
                color: "#ffffff",
                "& .MuiTypography-root": {
                  fontSize: { xs: "0.8rem", sm: "1.2rem" },
                  textTransform: "uppercase",
                },
              }}
            >
              <Grid item xs={1}></Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="left">
                  {t("Weapon")}
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography variant="h4" textAlign="center">
                  {t("Cost")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h4" textAlign="center">
                  {t("Accuracy")}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" textAlign="center">
                  {t("Damage")}
                </Typography>
              </Grid>
            </Grid>
            <Grid container>
              <Grid container direction="column" item xs>
                {/* First Row */}
                <Grid
                  container
                  justifyContent="space-between"
                  item
                  sx={{
                    background: `linear-gradient(to right, ${ternary}, ${white})`,
                    borderBottom: `1px solid ${secondary}`,
                    padding: "5px",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
                  }}
                >
                  <Grid
                    item
                    xs={3}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography fontWeight="bold" sx={{ marginRight: "4px" }}>
                      {weapon.name}
                    </Typography>
                    {weapon.martial && <Martial />}
                  </Grid>
                  <Grid item xs={1}>
                    <Typography textAlign="center">{`${weapon.cost}z`}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {`${attributes[weapon.att1].shortcaps} + ${
                        attributes[weapon.att2].shortcaps
                      }`}
                      <CloseBracket />
                      {weapon.prec !== 0 ? `+${weapon.prec}` : ""}
                    </Typography>
                  </Grid>

                  <Grid item xs={4}>
                    <Typography fontWeight="bold" textAlign="center">
                      <OpenBracket />
                      {t("HR +")} {weapon.damage}
                      <CloseBracket />
                      {types[weapon.type].long}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Second Row */}
                <Grid
                  container
                  justifyContent="flex-end"
                  sx={{
                    background: "transparent",
                    borderBottom: `1px solid ${secondary}`,
                    padding: "5px",
                    "& .MuiTypography-root": {
                      fontSize: { xs: "0.7rem", sm: "1.0rem" },
                    },
                  }}
                >
                  <Grid item xs={3}>
                    <Typography fontWeight="bold">{weapon.category}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color={primary} />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography textAlign="center">
                      {weapon.hands === 1 && t("One-handed")}
                      {weapon.hands === 2 && t("Two-handed")}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Diamond color="{primary}" />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography textAlign="center">
                      {weapon.melee && t("Melee")}
                      {weapon.ranged && t("Ranged")}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Typography
              sx={{
                background: "transparent",
                borderBottom: `1px solid ${secondary}`,
                px: 1,
                py: 1,
              }}
            >
              {!weapon.quality && t("No Qualities")}{" "}
              <StyledMarkdown
                allowedElements={["strong", "em"]}
                unwrapDisallowed={true}
                sx={{ fontSize: { xs: "0.9rem", sm: "1.1rem"} }}
              >
                {weapon.quality}
              </StyledMarkdown>
            </Typography>
          </Stack>
        </div>
      </Card>
    </>
  );
}
