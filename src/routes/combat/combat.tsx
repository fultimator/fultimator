import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Skeleton,
  TextField,
  Typography,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { User } from "firebase/auth";

import { SignIn } from "../../components/auth";
import { auth, firestore } from "../../firebase";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import { calcHP, calcMP } from "../../libs/npcs";
import { useEffect } from "react";
import React from "react";
import { TypeNpc } from "../../types/Npcs";
import useDownloadImage from "../../hooks/useDownloadImage";
import { useTranslate } from "../../translation/translate";

export default function Combat() {
  const { t } = useTranslate();
  const [user, loading, error] = useAuthState(auth);
  console.debug("user, loading, error", user, loading, error);

  return (
    <Layout>
      <Typography variant="h4">{t("Combat")}</Typography>
      {loading && <Skeleton />}

      {!loading && !user && (
        <>
          <Typography sx={{ my: 1 }}>
            {t("You must be logged in to use this feature")}
          </Typography>
          <SignIn />
        </>
      )}

      {user && <AuthCombat user={user} />}
    </Layout>
  );
}

interface AuthCombatProps {
  user: User;
}

function AuthCombat({ user }: AuthCombatProps) {
  const { t } = useTranslate();
  const personalRef = collection(firestore, "npc-personal");
  const personalQuery = query(
    personalRef,
    where("uid", "==", user.uid),
    orderBy("lvl", "asc"),
    orderBy("name", "asc")
  );
  const [personalList, loading] = useCollectionData(personalQuery, {
    idField: "id",
  });

  const [npcs, setNpcs] = useState<TypeNpc[]>([]);

  const addNpc = (e: any, newValue: any) => {
    setNpcs((prevState) => {
      return newValue ? [...prevState, newValue as TypeNpc] : prevState;
    });
  };

  if (loading) {
    return null;
  }

  // Add label
  personalList?.forEach((npc) => {
    npc.label = npc.name;
  });

  console.debug(npcs);

  return (
    <Grid container sx={{ mt: 2 }}>
      {npcs?.map((npc) => {
        if (!npc) {
          return null;
        }
        return (
          <Grid item xs={12} key={npc.id}>
            <NpcCombatant npc={npc}></NpcCombatant>
          </Grid>
        );
      })}
      <Grid item xs={12}>
        <Autocomplete
          size="small"
          disablePortal
          id="combo-box-demo"
          options={personalList || []}
          sx={{ width: 300, mb: 10 }}
          onChange={addNpc}
          renderInput={(params) => (
            <TextField {...params} label={t("Adversary")} />
          )}
        />
      </Grid>
    </Grid>
  );
}

interface NpcProps {
  npc: TypeNpc;
}

function NpcCombatant({ npc }: NpcProps) {
  const { t } = useTranslate();
  const [hp, setHp] = useState(calcHP(npc));
  const [mp, setMp] = useState(calcMP(npc));
  const [attributes, setAttributes] = useState(npc.attributes);
  const [statusEffects, setStatusEffects] = useState({
    slow: false,
    dazed: false,
    weak: false,
    shaken: false,
    enraged: false,
    poisoned: false,
  });

  const originalAttributes = npc.attributes;

  const changeHp = (value: number) => {
    return () => {
      setHp(hp + value);
    };
  };
  const changeMp = (value: number) => {
    return () => {
      setMp(mp + value);
    };
  };

  const adjustAttribute = (attribute = 0, amount = 0, min = 6) => {
    return attribute + amount <= min ? min : attribute + amount;
  };

  useEffect(() => {
    let { slow, dazed, weak, shaken, enraged, poisoned } = statusEffects;

    setAttributes({
      dexterity:
        enraged && slow
          ? adjustAttribute(originalAttributes.dexterity, -4)
          : enraged || slow
          ? adjustAttribute(originalAttributes.dexterity, -2)
          : originalAttributes.dexterity,
      insight:
        enraged && dazed
          ? adjustAttribute(originalAttributes.insight, -4)
          : enraged || dazed
          ? adjustAttribute(originalAttributes.insight, -2)
          : originalAttributes.insight,
      might:
        poisoned && weak
          ? adjustAttribute(originalAttributes.might, -4)
          : poisoned || weak
          ? adjustAttribute(originalAttributes.might, -2)
          : originalAttributes.might,
      will:
        poisoned && shaken
          ? adjustAttribute(originalAttributes.will, -4)
          : poisoned || shaken
          ? adjustAttribute(originalAttributes.will, -2)
          : originalAttributes.will,
    });
  }, [
    statusEffects,
    originalAttributes.dexterity,
    originalAttributes.insight,
    originalAttributes.might,
    originalAttributes.will,
  ]);

  const toggleStatus = (status = "", hasStatus = false) => {
    switch (status) {
      case "slow":
        setStatusEffects((s) => ({
          ...s,
          slow: hasStatus,
        }));
        break;
      case "dazed":
        setStatusEffects((s) => ({
          ...s,
          dazed: hasStatus,
        }));
        break;
      case "weak":
        setStatusEffects((s) => ({
          ...s,
          weak: hasStatus,
        }));
        break;
      case "shaken":
        setStatusEffects((s) => ({
          ...s,
          shaken: hasStatus,
        }));
        break;
      case "enraged":
        setStatusEffects((s) => ({
          ...s,
          enraged: hasStatus,
        }));
        break;
      case "poisoned":
        setStatusEffects((s) => ({
          ...s,
          poisoned: hasStatus,
        }));
        break;
      default:
        break;
    }
  };

  const crisis = hp < calcHP(npc) / 2;

  const [selectedStudy, setSelectedStudy] = useState(0);

  const handleStudyChange = (event) => {
    setSelectedStudy(event.target.value);
  };

  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);


  /************ ATTACK ROLL ************/
  // Initialize states for dice, hit throw, damage results, critical success and critical failure
  const [diceResults, setDiceResults] = useState({ attribute1: 0, attribute2: 0 });
  const [hitThrowResult, setHitThrowResult] = useState({ totalHitScore: 0 });
  const [damageResult, setDamageResult] = useState({ damage: 0 }); 
  const [isCriticalSuccess, setIsCriticalSuccess] = useState(false);
  const [isCriticalFailure, setIsCriticalFailure] = useState(false);

// Handle Attack Roll
const rollAttackDice = (attack, attackType) => {
  let attribute1, attribute2, extraDamage, extraPrecision;

  if (attackType == "weapon") {
    // For weapon attacks
    const { att1, att2 } = attack.weapon;
    attribute1 = attributes[att1]; 
    attribute2 = attributes[att2]; 
    extraDamage = attack.weapon.damage;
    extraPrecision = (npc.extra?.precision ? 3 : 0) + attack.weapon.prec;
  } else if (attackType == "spell") {
    // For spells
    const { attr1, attr2 } = attack.spell;
    attribute1 = attributes[attr1];
    attribute2 = attributes[attr2];
    extraDamage = 0;
    extraPrecision = npc.extra?.magic ? 3 : 0;
  } else {
    // For base attacks
    const { attr1, attr2 } = attack;
    attribute1 = attributes[attr1];
    attribute2 = attributes[attr2];
    extraDamage = attack.extraDamage ? 10 : 5;
    extraPrecision = npc.extra?.precision ? 3 : 0;
  }

  // Simulate rolling the dice for each attribute
  const rollDice = (attribute) => Math.floor(Math.random() * attribute) + 1;
  const roll1 = rollDice(attribute1);
  const roll2 = rollDice(attribute2);

  // Check for critical success / failure
  const isCriticalSuccess = roll1 === roll2 && roll1 >= 6 && roll2 >= 6;
  const isCriticalFailure = roll1 === 1 && roll2 === 1;
  setIsCriticalSuccess(isCriticalSuccess);
  setIsCriticalFailure(isCriticalFailure);

  // Update dice results state
  setDiceResults({ attribute1: roll1, attribute2: roll2 });

  // Calculate results
  const totalHitScore = roll1 + roll2 + extraPrecision;
  let baseDamage = Math.max(roll1, roll2);
  const damage = baseDamage + extraDamage;

  // Update results
  setHitThrowResult({ totalHitScore });
  setDamageResult({ damage });

  return { totalHitScore, damage };
};


// Handle the Attack Button Label
const generateButtonLabel = (attack) => {
  let translatedAttribute1, translatedAttribute2;

  if (attack.weapon) {
    // For weapon attacks
    const { name, weapon } = attack;
    const { att1, att2 } = weapon;
    const attributeMap = {
      dexterity: "DEX",
      insight: "INS",
      might: "MIG",
      will: "WLP",
    };

    translatedAttribute1 = `${attributeMap[att1]} d${attributes[att1]}`;
    translatedAttribute2 = `${attributeMap[att2]} d${attributes[att2]}`;

    return `${name} [${translatedAttribute1} + ${translatedAttribute2}]`;
  } else if (attack.spell){
    // For spells
    const { name, spell } = attack;
    const { attr1, attr2 } = spell;
    const attributeMap = {
      dexterity: "DEX",
      insight: "INS",
      might: "MIG",
      will: "WLP",
    };

    translatedAttribute1 = `${attributeMap[attr1]} d${attributes[attr1]}`; // Use attributes state here
    translatedAttribute2 = `${attributeMap[attr2]} d${attributes[attr2]}`; // Use attributes state here

    return `${name} [${translatedAttribute1} + ${translatedAttribute2}]`;
  } {
    // For base attacks
    const { name, attr1, attr2 } = attack;
    const attributeMap = {
      dexterity: "DEX",
      insight: "INS",
      might: "MIG",
      will: "WLP",
    };

    translatedAttribute1 = `${attributeMap[attr1]} d${attributes[attr1]}`; // Use attributes state here
    translatedAttribute2 = `${attributeMap[attr2]} d${attributes[attr2]}`; // Use attributes state here

    return `${name} [${translatedAttribute1} + ${translatedAttribute2}]`;
  }
};

  return (
    <Grid container spacing={1} sx={{ my: 1 }}>
      <Grid item xs={6}>
        <NpcPretty npc={npc} study={selectedStudy} ref={ref} collapse={true} includeImage={false} />
      </Grid>
      <Grid xs={6} item>
        <Grid container spacing={1} rowSpacing={2} sx={{ px: 2 }}>
          <Grid item xs={2}>
            <Typography variant="h5" color="red">
              {t("HP:")} {hp}
            </Typography>
            {crisis && t("Crisis!")}
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="error">
              <Button onClick={changeHp(-1)}>-1</Button>
              <Button onClick={changeHp(-2)}>-2</Button>
              <Button onClick={changeHp(-5)}>-5</Button>
              <Button onClick={changeHp(-10)}>-10</Button>
              <Button onClick={changeHp(-20)}>-20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="error">
              <Button onClick={changeHp(+1)}>+1</Button>
              <Button onClick={changeHp(+2)}>+2</Button>
              <Button onClick={changeHp(+5)}>+5</Button>
              <Button onClick={changeHp(+10)}>+10</Button>
              <Button onClick={changeHp(+20)}>+20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="h5" color="cyan">
              {t("MP:")} {mp}
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="info">
              <Button onClick={changeMp(-1)}>-1</Button>
              <Button onClick={changeMp(-2)}>-2</Button>
              <Button onClick={changeMp(-5)}>-5</Button>
              <Button onClick={changeMp(-10)}>-10</Button>
              <Button onClick={changeMp(-20)}>-20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={5}>
            <ButtonGroup variant="outlined" size="small" color="info">
              <Button onClick={changeMp(+1)}>+1</Button>
              <Button onClick={changeMp(+2)}>+2</Button>
              <Button onClick={changeMp(+5)}>+5</Button>
              <Button onClick={changeMp(+10)}>+10</Button>
              <Button onClick={changeMp(+20)}>+20</Button>
            </ButtonGroup>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs>
              <Typography variant="h5">
                {t("DEX:")} d{attributes.dexterity}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                {t("INS:")} d{attributes.insight}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                {t("MIG:")} d{attributes.might}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                {t("WIL:")} d{attributes.will}
              </Typography>
            </Grid>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs={2}>
              <Typography variant="h5">{t("Study Roll:")}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Select
                labelId="study"
                id="study"
                value={selectedStudy}
                onChange={handleStudyChange}
                fullWidth
              >
                <MenuItem value={0}>-</MenuItem>
                <MenuItem value={1}>7+</MenuItem>
                <MenuItem value={2}>10+</MenuItem>
                <MenuItem value={3}>13+</MenuItem>
              </Select>
            </Grid>
            {/* Download Button */}
            <Button
              color="primary"
              aria-label="download"
              onClick={downloadImage}
              style={{ cursor: "pointer" }}
            >
              <Tooltip title="Download Sheet" placement="bottom">
                <Download />
              </Tooltip>
            </Button>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs>
              <FormControlLabel
                value="slow"
                control={
                  <Checkbox
                    onChange={({ target: { value, checked } }) => {
                      if (typeof checked === "boolean") {
                        toggleStatus(value, checked);
                      }
                    }}
                  />
                }
                label={t("Slow")}
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs>
              <FormControlLabel
                value="dazed"
                control={
                  <Checkbox
                    onChange={({ target: { value, checked } }) => {
                      if (typeof checked === "boolean") {
                        toggleStatus(value, checked);
                      }
                    }}
                  />
                }
                label={t("Dazed")}
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs>
              <FormControlLabel
                value="weak"
                control={
                  <Checkbox
                    onChange={({ target: { value, checked } }) => {
                      if (typeof checked === "boolean") {
                        toggleStatus(value, checked);
                      }
                    }}
                  />
                }
                label={t("Weak")}
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs>
              <FormControlLabel
                value="shaken"
                control={
                  <Checkbox
                    onChange={({ target: { value, checked } }) => {
                      if (typeof checked === "boolean") {
                        toggleStatus(value, checked);
                      }
                    }}
                  />
                }
                label={t("Shaken")}
                labelPlacement="top"
              />
            </Grid>
          </Grid>
          <Grid item container xs={12}>
            <Grid item xs display="flex" justifyContent="center">
              <FormControlLabel
                value="enraged"
                control={
                  <Checkbox
                    onChange={({ target: { value, checked } }) => {
                      if (typeof checked === "boolean") {
                        toggleStatus(value, checked);
                      }
                    }}
                  />
                }
                label={t("Enraged")}
                labelPlacement="top"
              />
            </Grid>
            <Grid item xs display="flex" justifyContent="center">
              <FormControlLabel
                value="poisoned"
                control={
                  <Checkbox
                    onChange={({ target: { value, checked } }) => {
                      if (typeof checked === "boolean") {
                        toggleStatus(value, checked);
                      }
                    }}
                  />
                }
                label={t("Poisoned")}
                labelPlacement="top"
              />
            </Grid>
          </Grid>
          {/**ATTACK ROLL SIMULATOR**/}
          <Grid item flex="1">
            {npc.attacks.map((attack, index) => (
              <Grid item key={index}>
                <Button
                  variant="contained"
                  onClick={() => rollAttackDice(attack, "baseattack")}
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    padding: "8px",
                    margin: "4px 0",
                  }}
                >
                  {generateButtonLabel(attack)}
                </Button>
              </Grid>
            ))}
            {npc.weaponattacks?.map((wattack, index) => (
            <Grid item key={index}>
              <Button
                variant="outlined"
                onClick={() => rollAttackDice(wattack, "weapon")}
                sx={{
                  width: "100%",
                  textAlign: "center",
                  padding: "8px",
                  margin: "4px 0",
                }}
              >
                {generateButtonLabel(wattack)}
              </Button>
            </Grid>
          ))}
          {npc.spells?.map((spell, index) => (
            <Grid item key={index}>
              <Button
                variant="contained"
                color = "info"
                onClick={() => rollAttackDice(spell, "spell")}
                sx={{
                  width: "100%",
                  textAlign: "center",
                  padding: "8px",
                  margin: "4px 0",
                }}
              >
                {generateButtonLabel(spell)}
              </Button>
            </Grid>
          ))}
            <Grid item container pb={1} mt={2} xs={12} spacing={1} border={1} borderRadius={1}>
              <Grid item xs={4}>
                <Typography variant="h6">Dice Results</Typography>
                <Typography variant="body1">First Die 1: <b>{diceResults.attribute1}</b></Typography>
                <Typography variant="body1">Second Die 2: <b>{diceResults.attribute2}</b></Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6">Hit Throw Result</Typography>
                <Typography variant="body1">Hit Score: <b>{hitThrowResult.totalHitScore}</b></Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6">Damage Result</Typography>
                <Typography variant="body1">Damage: <b>{damageResult.damage}</b></Typography>
              </Grid>
              {isCriticalSuccess && (
                <Grid item xs={12}>
                  <Typography variant="h4" color="green" 
                    sx={{
                      width: "100%",
                      textAlign: "center"
                    }}>
                    {t("Critical Success!")}
                  </Typography>
                </Grid>
              )}
              {isCriticalFailure && (
                <Grid item xs={12}>
                  <Typography variant="h4" color="error"
                    sx={{
                      width: "100%",
                      textAlign: "center"
                    }}>
                    {t("Critical Failure!")}
                  </Typography>
                </Grid>
              )}
            </Grid>
            {/*********************/}     
            <Button variant="outlined" onClick={() => console.log(npc)}>LOG NPC OBJECT</Button>
          </Grid> 
        </Grid>
      </Grid>
      <Divider flexItem sx={{ p: 1, my: 2, width: "100%" }} />
    </Grid>
  );
}
