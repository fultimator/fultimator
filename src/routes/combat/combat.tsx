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
  Stack,
} from "@mui/material";
import { Download, AddCircle } from "@mui/icons-material";
import { useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { User } from "firebase/auth";

import { SignIn } from "../../components/auth";
import { auth, firestore } from "../../firebase";
import Layout from "../../components/Layout";
import NpcPretty from "../../components/npc/Pretty";
import PointBar from "../../components/PointBar";
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

  if (loading) {
    return null;
  }

  const addNpc = (e: any, newValue: any) => {
    if (newValue) {
      setNpcs((prevState) => [...prevState, newValue as TypeNpc]);
    }
  };

  const addDuplicateNpc = (npc: any) => {
    setNpcs((prevState) => [...prevState, npc]);
  };

  const getNpcCounts = () => {
    const counts: { [key: string]: number } = {};
    npcs.forEach((npc) => {
      counts[npc.id] = (counts[npc.id] || 0) + 1;
    });
    return counts;
  };

  const npcCounts = getNpcCounts();

  // Add label
  personalList?.forEach((npc) => {
    npc.label = npc.name;
  });

  console.debug(npcs);

  return (
    <Grid container direction="column" sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <Autocomplete
          size="small"
          disablePortal
          id="combo-box-demo"
          options={personalList || []}
          sx={{ width: 300, mb: 2 }}
          onChange={addNpc}
          renderInput={(params) => (
            <TextField {...params} label={t("Adversary")} />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" spacing={1} mb={2}>
          {personalList?.map((npc) => {
            // Only show buttons for NPCs that have been selected at least once
            if (npcCounts[npc.id]) {
              return (
                <Button
                  key={npc.id}
                  variant="contained"
                  onClick={() => addDuplicateNpc(npc)}
                  startIcon={<AddCircle />}
                >
                  {npc.name} ({npcCounts[npc.id]})
                </Button>
              );
            }
            return null;
          })}
        </Stack>
      </Grid>

      <Grid item xs={12}>
        {npcs.map((npc, index) => (
          <Grid
            container
            item
            xs={12}
            key={index} // Use index as key for duplicate handling
            sx={{
              mb: 1,
              p: 1,
              border: "1px solid #ccc",
              borderRadius: "4px",
              alignItems: "center",
            }}
          >
            <Grid item xs={9}>
              <Typography variant="h3">{index + 1}</Typography>
            </Grid>
            <Grid item xs={12}>
              <NpcCombatant npc={npc} />
            </Grid>
          </Grid>
        ))}
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

  const crisis = hp <= calcHP(npc) / 2;

  const [selectedStudy, setSelectedStudy] = useState(0);

  const handleStudyChange = (event) => {
    setSelectedStudy(event.target.value);
  };

  const ref = useRef();
  const [downloadImage] = useDownloadImage(npc.name, ref);

  /************ ATTACK ROLL ************/
  // Initialize states for dice, hit throw, damage results, critical success and critical failure
  const [diceResults, setDiceResults] = useState({
    attribute1: 0,
    attribute2: 0,
  });
  const [hitThrowResult, setHitThrowResult] = useState({ totalHitScore: 0 });
  const [damageResult, setDamageResult] = useState({ damage: 0 });
  const [isCriticalSuccess, setIsCriticalSuccess] = useState(false);
  const [isCriticalFailure, setIsCriticalFailure] = useState(false);

  // Handle Attack Roll
  const rollAttackDice = (attack, attackType) => {
    let attribute1, attribute2, extraDamage, extraPrecision, type;

    // Get +1 accuracy every 10 levels
    let accuracyLevelBonus = Math.floor(npc.lvl / 10);

    if (attackType === "weapon") {
      // For weapon attacks
      const { att1, att2 } = attack.weapon;
      attribute1 = attributes[att1];
      attribute2 = attributes[att2];
      extraDamage =
        attack.weapon.damage +
        (attack.flatdmg ? parseInt(attack.flatdmg) : 0) +
        (attack.extraDamage ? 5 : 0);
      extraPrecision =
        (npc.extra?.precision ? 3 : 0) +
        attack.weapon.prec +
        (attack.flathit ? parseInt(attack.flathit) : 0) +
        accuracyLevelBonus;
      type = attack.weapon.type;
    } else if (attackType === "spell") {
      // For spells
      const { attr1, attr2 } = attack;
      attribute1 = attributes[attr1];
      attribute2 = attributes[attr2];
      extraDamage = 0;
      extraPrecision = (npc.extra?.magic ? 3 : 0) + accuracyLevelBonus;
      type = "spell";
    } else {
      // For base attacks
      const { attr1, attr2 } = attack;
      attribute1 = attributes[attr1];
      attribute2 = attributes[attr2];
      extraDamage = attack.extraDamage ? 10 : 5;
      extraPrecision = (npc.extra?.precision ? 3 : 0) + accuracyLevelBonus;
      type = attack.type;
    }

    // Get +5 damage after lvl 20 and another +5 after lvl 40 and another +5 after lvl 60
    if (npc.lvl >= 20) {
      if (npc.lvl >= 40) {
        if (npc.lvl >= 60) {
          extraDamage += 10;
        } else {
          extraDamage += 5;
        }
      } else {
        extraDamage += 5;
      }
    }

    if (attribute1 === undefined || attribute2 === undefined) {
      // Handle the case where attributes are not defined
      console.error("Attributes not defined");
      return;
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

    let damage = 0;
    if (type !== "nodmg") {
      damage = baseDamage + extraDamage;
    }

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

      translatedAttribute1 = `${t(attributeMap[att1])} d${attributes[att1]}`;
      translatedAttribute2 = `${t(attributeMap[att2])} d${attributes[att2]}`;

      return `${name} [${translatedAttribute1} + ${translatedAttribute2}]`;
    } else if (attack.spell) {
      // For spells
      const { name, spell } = attack;
      const { attr1, attr2 } = spell;
      const attributeMap = {
        dexterity: "DEX",
        insight: "INS",
        might: "MIG",
        will: "WLP",
      };

      translatedAttribute1 = `${t(attributeMap[attr1])} d${attributes[attr1]}`;
      translatedAttribute2 = `${t(attributeMap[attr2])} d${attributes[attr2]}`;

      return `${name} [${translatedAttribute1} + ${translatedAttribute2}]`;
    }
    {
      // For base attacks
      const { name, attr1, attr2 } = attack;
      const attributeMap = {
        dexterity: "DEX",
        insight: "INS",
        might: "MIG",
        will: "WLP",
      };

      translatedAttribute1 = `${t(attributeMap[attr1])} d${attributes[attr1]}`;
      translatedAttribute2 = `${t(attributeMap[attr2])} d${attributes[attr2]}`;

      return `${name} [${translatedAttribute1} + ${translatedAttribute2}]`;
    }
  };

  return (
    <Grid container spacing={1} sx={{ my: 1 }}>
      <Grid item xs={6}>
        <NpcPretty
          npc={npc}
          study={selectedStudy}
          npcImage={npc.imgurl}
          ref={ref}
          collapse={true}
        />
        <Grid item container xs={12} mt={5}>
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
      </Grid>
      <Grid xs={6} item>
        <Grid container spacing={1} rowSpacing={2} sx={{ px: 2 }}>
          <Grid item xs={10} container alignItems="center">
            <Grid item xs={2}>
              <Typography variant="h5" color="red">
                {t("HP:")} {hp}
              </Typography>
              {crisis && <Typography variant="h5">{t("Crisis!")}</Typography>}
            </Grid>
            <Grid item xs={10}>
              <PointBar
                pt={hp}
                maxPt={calcHP(npc)}
                color1={"#17b924"}
                color2={"#d1232a"}
              />
            </Grid>
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
          <Grid item xs={10} container alignItems="center">
            <Grid item xs={2}>
              <Typography variant="h5" color="red">
                {t("MP:")} {mp}
              </Typography>
            </Grid>
            <Grid item xs={10}>
              <PointBar
                pt={mp}
                maxPt={calcMP(npc)}
                color1={"#16aad6"}
                color2={"#0e8aae"}
              />
            </Grid>
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
            {npc.spells
              ?.filter((spell) => spell.type === "offensive")
              .map((spell, index) => (
                <Grid item key={index}>
                  <Button
                    variant="contained"
                    color="info"
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
            <Grid item container pb={1} mt={2} border={1} borderRadius={1}>
              <Grid item xs={4} pt={1} pl={1}>
                <Typography variant="h6">{t("Dice Results")}</Typography>
                <Typography variant="body1">
                  {t("Die 1")}: <b>{diceResults.attribute1}</b>
                </Typography>
                <Typography variant="body1">
                  {t("Die 2")}: <b>{diceResults.attribute2}</b>
                </Typography>
              </Grid>
              <Grid item xs={4} pt={1} pl={1}>
                <Typography variant="h6">{t("Hit Throw Result")}</Typography>
                <Typography variant="body1">
                  {t("Hit Score")}: <b>{hitThrowResult.totalHitScore}</b>
                </Typography>
              </Grid>
              <Grid item xs={4} pt={1} pl={1}>
                <Typography variant="h6">{t("Damage Result")}</Typography>
                <Typography variant="body1">
                  {t("Damage")}: <b>{damageResult.damage}</b>
                </Typography>
              </Grid>
              {isCriticalSuccess && (
                <Grid item xs={12}>
                  <Typography
                    variant="h4"
                    color="green"
                    sx={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {t("Critical Success!")}
                  </Typography>
                </Grid>
              )}
              {isCriticalFailure && (
                <Grid item xs={12}>
                  <Typography
                    variant="h4"
                    color="error"
                    sx={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {t("Critical Failure!")}
                  </Typography>
                </Grid>
              )}
            </Grid>
            {/*********************/}
            {/*<Button variant="outlined" onClick={() => console.log(npc)}>LOG NPC OBJECT</Button>*/}
          </Grid>
        </Grid>
      </Grid>
      <Divider flexItem sx={{ p: 1, my: 2, width: "100%" }} />
    </Grid>
  );
}
