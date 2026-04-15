import { RemoveCircleOutlined } from "@mui/icons-material";
import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  ListItemText,
} from "@mui/material";
import { Martial } from "../icons";
import { useState } from "react";
import types from "../../libs/types";
import attributes from "../../libs/attributes";
import { baseWeapons } from "../../libs/equip";
import { CloseBracket, OpenBracket } from "../Bracket";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { Add } from "@mui/icons-material";
import { TypeIcon } from "../types";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

export default function EditWeaponAttacks({ npc, setNpc }) {
  const { t } = useTranslate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAttackIndex, setPendingAttackIndex] = useState(null);

  const onChangeAttacks = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.weaponattacks[i][key] = value;
        return newState;
      });
    };
  };

  const addAttack = () => {
    setNpc((prevState) => ({
      ...prevState,
      weaponattacks: [
        ...(prevState.weaponattacks || []),
        {
        name: "",
        weapon: baseWeapons[0],
        type: "physical",
        special: [],
        },
      ],
    }));
  };

  const removeAttack = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      weaponattacks: (prevState.weaponattacks || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingAttackIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="middle"
        addItem={addAttack}
        headerText={t("Attacks with Weapons")}
        icon={Add}
      />
      {npc.weaponattacks?.map((attack, i) => {
        return (
          <Grid container key={i} spacing={1}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <EditAttack
                attack={attack}
                setAttack={onChangeAttacks(i)}
                removeAttack={() => openDeleteDialog(i)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <EditAttackSpecial
                attack={attack}
                setAttack={onChangeAttacks(i)}
              />
            </Grid>
            {i !== npc.weaponattacks.length - 1 && (
              <Grid  size={12}>
                <Divider />
              </Grid>
            )}
          </Grid>
        );
      })}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPendingAttackIndex(null);
        }}
        onConfirm={() => {
          if (pendingAttackIndex === null) return;
          removeAttack(pendingAttackIndex);
          setIsDeleteDialogOpen(false);
          setPendingAttackIndex(null);
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete?")}
        itemPreview={
          pendingAttackIndex !== null
            ? npc.weaponattacks?.[pendingAttackIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}

function EditAttack({ attack, setAttack, removeAttack, i }) {
  const { t } = useTranslate();
  return (
    <Grid container spacing={1} sx={{ py: 1, alignItems: "center" }}>
      <Grid  sx={{ p: 0, m: 0 }}>
        <IconButton onClick={removeAttack}>
          <RemoveCircleOutlined />
        </IconButton>
      </Grid>
      <Grid  size={5}>
        <FormControl variant="standard" fullWidth>
          <TextField
            id="name"
            label={t("Name:")}
            value={attack.name}
            onChange={(e) => {
              return setAttack("name", e.target.value);
            }}
            size="small"
          ></TextField>
        </FormControl>
      </Grid>
      <Grid  size={5}>
        <SelectWeapon
          weapon={attack.weapon}
          setWeapon={(value) => {
            return setAttack("weapon", value);
          }}
          size="small"
        />
      </Grid>
      <Grid  size={3}>
        <FormControl variant="standard">
          <TextField
            id="flathit"
            type="number"
            label={t("Acc.")}
            value={attack.flathit || 0}
            onChange={(e) => {
              return setAttack("flathit", e.target.value);
            }}
            size="small"
            slotProps={{
              htmlInput: { inputMode: "numeric", pattern: "[0-9]*" }
            }}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid  size={3}>
        <FormControl variant="standard">
          <TextField
            id="flatdmg"
            type="number"
            label={t("Dmg.")}
            value={attack.flatdmg || 0}
            onChange={(e) => {
              return setAttack("flatdmg", e.target.value);
            }}
            size="small"
            slotProps={{
              htmlInput: { inputMode: "numeric", pattern: "[0-9]*" }
            }}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid  size={3}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-type"}>{t("Type:")}</InputLabel>
          <Select
            value={attack.type || attack.weapon.type}
            labelId={"attack-" + i + "-type"}
            id={"attack-" + i + "-type"}
            label={t("Type:")}
            size="small"
            onChange={(e) => {
              return setAttack("type", e.target.value);
            }}
          >
            {Object.keys(types).map((type) => {
              return (
                <MenuItem
                  key={type}
                  value={type}
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
                    <TypeIcon type={type} />
                    <ListItemText
                      sx={{
                        ml: 1,
                        marginBottom: 0,
                        textTransform: "capitalize",
                      }}
                    >
                      {types[type].long}
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
      {/* <Grid size={8} lg={3}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-type"}>{t("Type:")}</InputLabel>
          <Select
            value={attack.type}
            labelId={"attack-" + i + "-type"}
            id={"attack-" + i + "-type"}
            label={t("Type:")}
            size="small"
            onChange={(e, value) => {
              return setAttack("type", e.target.value);
            }}
          >
            {Object.keys(types).map((type) => {
              return (
                <MenuItem key={type} value={type}>
                  {types[type].long}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid> */}
      <Grid  size="grow">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="medium"
                checked={attack.extraDamage}
                value={attack.extraDamage}
                onChange={(e) => {
                  return setAttack("extraDamage", e.target.checked);
                }}
              />
            }
            label={t("Extra Damage")}
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
}

function EditAttackSpecial({ attack, setAttack }) {
  const { t } = useTranslate();
  const [specials, setSpecials] = useState(attack.special[0]);

  const onChange = (e) => {
    const value = e.target.value;
    setSpecials(value);

    if (value === "") {
      setAttack("special", []);
    } else {
      setAttack("special", [value]);
    }
  };

  return (
    <Grid container spacing={1} sx={{ py: 1, alignItems: "center" }}>
      <Grid  size={12}>
        <FormControl variant="standard" fullWidth>
          {/* <TextField
            id="special"
            label={t("Special:")}
            value={specials}
            onChange={onChange}
            size="small"
            helperText={t("Adding a special effect cost 1 skill point")}
          ></TextField> */}

          <CustomTextarea
            id="special"
            label={t("Special:")}
            value={specials}
            onChange={(e) => onChange(e)}
            helperText={t("Adding a special effect cost 1 skill point")}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}

function SelectWeapon({ weapon, setWeapon }) {
  const { t } = useTranslate();
  const onChange = function (e) {
    const weapon = baseWeapons.find((weapon) => weapon.name === e.target.value);

    setWeapon(weapon);
  };

  const options = [<MenuItem key={1} value="" disabled />];

  for (const weapon of baseWeapons) {
    options.push(
      <MenuItem key={weapon.name} value={weapon.name}>
        {weapon.name} {weapon.martial && <Martial />} <OpenBracket />
        {attributes[weapon.att1].shortcaps}+{attributes[weapon.att2].shortcaps}
        {weapon.prec > 0 && `+${weapon.prec}`}
        <CloseBracket /> <OpenBracket />
        {t("HR +")} {weapon.damage}
        <CloseBracket />
      </MenuItem>
    );
  }

  return (
    <FormControl fullWidth>
      <InputLabel id="type">{t("Weapon:")}</InputLabel>
      <Select
        labelId="type"
        id="select-type"
        value={weapon.name}
        label={t("Weapon:")}
        onChange={onChange}
        size="small"
      >
        {options}
      </Select>
    </FormControl>
  );
}
