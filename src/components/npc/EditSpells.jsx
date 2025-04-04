import { useState } from "react";
import types from "../../libs/types";
import { RemoveCircleOutline } from "@mui/icons-material";
import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Divider,
  ToggleButton,
  Autocomplete,
  Box,
  ListItemText,
} from "@mui/material";
import { OffensiveSpellIcon } from "../icons";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { Add } from "@mui/icons-material";
import CompendiumHandler from "./CompendiumHandler";
import { TypeIcon } from "../types";

export default function EditSpells({ npc, setNpc }) {
  const { t } = useTranslate();

  const [modalOpen, setModalOpen] = useState(false);

  const openCompendiumModal = () => {
    setModalOpen(true);
  };

  const closeCompendiumModal = () => {
    setModalOpen(false);
  };

  const onChangeSpells = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.spells[i][key] = value;
        return newState;
      });
    };
  };

  const addSpell = () => {
    setNpc((prevState) => {
      const newState = Object.assign({}, prevState);
      if (!newState.spells) {
        newState.spells = [];
      }
      newState.spells.push({
        itemType: "spell",
        name: "",
        range: "melee",
        attr1: "dexterity",
        attr2: "dexterity",
        type: "",
        damagetype: "physical",
        special: [],
      });
      return newState;
    });
  };

  const removeSpell = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.spells.splice(i, 1);
        return newState;
      });
    };
  };

  return (
    <>
      <CustomHeader
        type="top"
        openCompendium={openCompendiumModal}
        addItem={addSpell}
        headerText={t("Spells")}
        icon={Add}
      />
      {npc.spells?.map((spell, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid item xs={12}>
              <EditSpell
                spell={spell}
                setSpell={onChangeSpells(i)}
                removeSpell={removeSpell(i)}
              />
            </Grid>
            {i !== npc.spells.length - 1 && (
              <Grid item xs={12} sx={{ py: 1 }}>
                <Divider />
              </Grid>
            )}
          </Grid>
        );
      })}
      <CompendiumHandler
        npc={npc}
        setNpc={setNpc}
        typeName="spell"
        open={modalOpen}
        onClose={closeCompendiumModal}
      />
    </>
  );
}

function EditSpell({ spell, setSpell, removeSpell, i }) {
  const { t } = useTranslate();
  const [inputDuration, setInputDuration] = useState(spell.duration || "");
  const [inputTarget, setInputTarget] = useState(spell.target || "");

  const duration = [t("Scene"), t("Instantaneous"), t("Special")];

  const target = [
    t("Self"),
    t("One creature"),
    t("Up to two creatures"),
    t("Up to three creatures"),
    t("Up to four creatures"),
    t("Up to five creatures"),
    t("One equipped weapon"),
    t("Special"),
  ];

  // const handleChange = (field, value) => {
  //   setSpell((prevSpell) => ({
  //     ...prevSpell,
  //     [field]: value,
  //   }));
  // };

  const handleChange = (field, value) => {
    setSpell(field, value);
  };

  const handleDurationChange = (event, newValue) => {
    setInputDuration(newValue);
    handleChange("duration", newValue);
  };

  const handleTargetChange = (event, newValue) => {
    setInputTarget(newValue);
    handleChange("target", newValue);
  };

  return (
    <Grid container spacing={1} sx={{ py: 1 }} alignItems="center">
      <Grid item sx={{ p: 0, m: 0 }}>
        <IconButton onClick={removeSpell}>
          <RemoveCircleOutline />
        </IconButton>
      </Grid>
      <Grid item xs={12} sm={6} md={6}>
        <TextField
          label={t("Spell Name:")}
          variant="outlined"
          fullWidth
          value={spell.name}
          onChange={(e) => setSpell("name", e.target.value)}
          inputProps={{ maxLength: 50 }}
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={1} md={1}>
        <FormControl variant="standard" fullWidth style={{ height: "100%" }}>
          <ToggleButton
            selected={spell.type === "offensive"}
            onChange={() => {
              const newValue = spell.type === "offensive" ? "" : "offensive";
              setSpell("type", newValue);
            }}
            aria-label="offensive-toggle"
            style={{
              height: "100%",
            }}
          >
            <OffensiveSpellIcon />
          </ToggleButton>
        </FormControl>
      </Grid>
      <Grid item xs={6} sm={3} md={2}>
        <TextField
          id="mp"
          label={t("MP x Target")}
          variant="outlined"
          fullWidth
          placeholder="10"
          value={
            spell.mp === null || spell.mp === undefined
              ? ""
              : spell.mp.toString()
          }
          onChange={(e) => {
            return setSpell("mp", e.target.value);
          }}
          size="small"
        />
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <TextField
          type="number"
          label={t("Max Targets")}
          variant="outlined"
          fullWidth
          size="small"
          placeholder="1"
          value={
            spell.maxTargets === null || spell.maxTargets === undefined
              ? "0"
              : spell.maxTargets.toString()
          }
          onChange={(e) => {
            const value = e.target.value;
            if (
              value === "" ||
              (/^\d+$/.test(value) && +value >= 0 && +value <= 999)
            ) {
              handleChange(
                "maxTargets",
                value === "" ? 0 : parseInt(value, 10)
              );
            }
          }}
          onBlur={(e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value) || value < 0) {
              value = 0;
            } else if (value > 999) {
              value = 999;
            }
            handleChange("maxTargets", value);
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl variant="outlined" fullWidth>
          {/* <TextField
            id="target"
            label={t("Target:")}
            value={spell.target}
            onChange={(e) => {
              return setSpell("target", e.target.value);
            }}
            size="small"
          ></TextField> */}
          <Autocomplete
            id="target-autocomplete"
            options={target}
            value={inputTarget}
            onChange={handleTargetChange}
            onInputChange={handleTargetChange}
            size="small"
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Target Description")}
                fullWidth
                inputProps={{ ...params.inputProps, maxLength: 100 }}
              />
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl variant="outlined" fullWidth>
          {/* <TextField
            id="duration"
            label={t("Duration:")}
            value={spell.duration}
            onChange={(e) => {
              return setSpell("duration", e.target.value);
            }}
            size="small"
          ></TextField> */}
          <Autocomplete
            id="duration-autocomplete"
            options={duration}
            value={inputDuration}
            onChange={handleDurationChange}
            onInputChange={handleDurationChange}
            size="small"
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Duration")}
                fullWidth
                inputProps={{ ...params.inputProps, maxLength: 50 }}
              />
            )}
          />
        </FormControl>
      </Grid>
      {spell.type === "offensive" && (
        <Grid item xs={6} sm={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr1label"}>
              {t("Attr 1:")}
            </InputLabel>
            <Select
              value={spell.attr1}
              labelId={"spell-" + i + "-attr1label"}
              id={"spell-" + i + "-attr1"}
              label={t("Attr 1")}
              size="small"
              onChange={(e) => {
                return setSpell("attr1", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>{t("DEX")}</MenuItem>
              <MenuItem value={"insight"}>{t("INS")}</MenuItem>
              <MenuItem value={"might"}>{t("MIG")}</MenuItem>
              <MenuItem value={"will"}>{t("WLP")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      {spell.type === "offensive" && (
        <Grid item xs={6} sm={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"spell-" + i + "-attr2label"}>
              {t("Attr 2:")}
            </InputLabel>
            <Select
              value={spell.attr2}
              labelId={"spell-" + i + "-attr2label"}
              id={"spell-" + i + "-attr2"}
              label={t("Attr 2:")}
              size="small"
              onChange={(e) => {
                return setSpell("attr2", e.target.value);
              }}
            >
              <MenuItem value={"dexterity"}>{t("DEX")}</MenuItem>
              <MenuItem value={"insight"}>{t("INS")}</MenuItem>
              <MenuItem value={"might"}>{t("MIG")}</MenuItem>
              <MenuItem value={"will"}>{t("WLP")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      {spell.type === "offensive" && (
        <Grid item xs={12} sm={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id={"attack-" + i + "-type"}>{t("Type:")}</InputLabel>
            <Select
              value={spell.damagetype}
              labelId={"attack-" + i + "-type"}
              id={"attack-" + i + "-type"}
              label={t("Type:")}
              size="small"
              onChange={(e) => {
                return setSpell("damagetype", e.target.value);
              }}
            >
              {Object.keys(types).map((damagetype) => {
                return (
                  <MenuItem
                    key={damagetype}
                    value={damagetype}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      paddingY: "6px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 70,
                      }}
                    >
                      <TypeIcon type={damagetype} />
                      <ListItemText
                        sx={{
                          ml: 1,
                          marginBottom: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        {types[damagetype].long}
                      </ListItemText>
                    </Box>
                  </MenuItem>
                );
              })}
              <MenuItem
                value={"nodmg"}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 70,
                  }}
                >
                  <ListItemText
                    sx={{
                      marginBottom: 0,
                      textTransform: "capitalize",
                    }}
                  >
                    {t("no damage")}
                  </ListItemText>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth>
          {/* <TextField id="effect" label={t("Effect:")} value={spell.effect}
            onChange={(e) => {
              return setSpell("effect", e.target.value);
            }}
            size="small"
          ></TextField> */}

          <CustomTextarea
            id="special"
            label={t("Special:")}
            value={spell.effect}
            onChange={(e) => {
              return setSpell("effect", e.target.value);
            }}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
