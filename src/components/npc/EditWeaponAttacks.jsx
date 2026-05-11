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
import weapons from "../../libs/weapons";
import { CloseBracket, OpenBracket } from "../Bracket";
import { useTranslate } from "../../translation/translate";
import CustomTextarea from "../common/CustomTextarea";
import CustomHeader from "../common/CustomHeader";
import { Add } from "@mui/icons-material";
import { TypeIcon } from "../types";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

function weaponToAttackFields(weapon, name = "") {
  return {
    name,
    range: weapon.range ?? "melee",
    accuracy: {
      attr1: weapon.accuracy?.attr1 ?? "dexterity",
      attr2: weapon.accuracy?.attr2 ?? "might",
      value: weapon.accuracy?.value ?? 0,
      defense: "def",
    },
    damage: {
      value: weapon.damage?.value ?? 0,
      type: weapon.damage?.type ?? "physical",
      hrZero: weapon.damage?.hrZero === true,
    },
  };
}

export default function EditWeaponAttacks({ npc, setNpc }) {
  const { t } = useTranslate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAttackIndex, setPendingAttackIndex] = useState(null);

  const onChangeAttacks = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.weaponattacks = [...(prevState.weaponattacks || [])];
        if (typeof key === "object") {
          const {
            weapon: _weapon,
            type: _type,
            ...current
          } = newState.weaponattacks[i];
          newState.weaponattacks[i] = { ...current, ...key };
        } else {
          newState.weaponattacks[i] = {
            ...newState.weaponattacks[i],
            [key]: value,
          };
        }
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
          ...weaponToAttackFields(weapons[0]),
          special: [],
        },
      ],
    }));
  };

  const removeAttack = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      weaponattacks: (prevState.weaponattacks || []).filter(
        (_, index) => index !== i,
      ),
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
                md: 6,
              }}
            >
              <EditAttack
                attack={attack}
                setAttack={onChangeAttacks(i)}
                removeAttack={() => openDeleteDialog(i)}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <EditAttackSpecial
                attack={attack}
                setAttack={onChangeAttacks(i)}
              />
            </Grid>
            {i !== npc.weaponattacks.length - 1 && (
              <Grid size={12}>
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
  const selectedWeapon =
    attack.weapon ??
    weapons.find(
      (weapon) =>
        weapon.name === attack.name ||
        (weapon.accuracy?.attr1 === attack.accuracy?.attr1 &&
          weapon.accuracy?.attr2 === attack.accuracy?.attr2 &&
          weapon.damage?.value === attack.damage?.value),
    ) ??
    weapons[0];

  return (
    <Grid container spacing={1} sx={{ py: 1, alignItems: "center" }}>
      <Grid sx={{ p: 0, m: 0 }}>
        <IconButton onClick={removeAttack}>
          <RemoveCircleOutlined />
        </IconButton>
      </Grid>
      <Grid size={5}>
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
      <Grid size={5}>
        <SelectWeapon
          weapon={selectedWeapon}
          setWeapon={(value) => {
            return setAttack(weaponToAttackFields(value, attack.name));
          }}
          size="small"
        />
      </Grid>
      <Grid size={3}>
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
              htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
            }}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid size={3}>
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
              htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
            }}
          ></TextField>
        </FormControl>
      </Grid>
      <Grid size={3}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-type"}>{t("Type:")}</InputLabel>
          <Select
            value={
              attack.damage?.type || attack.type || selectedWeapon.damage?.type
            }
            labelId={"attack-" + i + "-type"}
            id={"attack-" + i + "-type"}
            label={t("Type:")}
            size="small"
            onChange={(e) => {
              return setAttack("damage", {
                ...(attack.damage ?? {}),
                value:
                  attack.damage?.value ?? selectedWeapon.damage?.value ?? 0,
                type: e.target.value,
                hrZero: (attack.damage?.hrZero ?? false) === true,
              });
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
      <Grid size="grow">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                size="medium"
                checked={attack.damage?.hrZero === true}
                onChange={(e) =>
                  setAttack("damage", {
                    ...(attack.damage ?? {
                      value: selectedWeapon.damage?.value ?? 0,
                      type: selectedWeapon.damage?.type ?? "physical",
                    }),
                    hrZero: e.target.checked,
                  })
                }
              />
            }
            label="HR0"
          />
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
      <Grid size={12}>
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
    const weapon = weapons.find((weapon) => weapon.name === e.target.value);

    setWeapon(weapon);
  };

  const options = [<MenuItem key={1} value="" disabled />];

  for (const weapon of weapons) {
    options.push(
      <MenuItem key={weapon.name} value={weapon.name}>
        {weapon.name} {weapon.martial && <Martial />} <OpenBracket />
        {attributes[weapon.accuracy?.attr1].shortcaps}+
        {attributes[weapon.accuracy?.attr2].shortcaps}
        {weapon.accuracy?.value > 0 && `+${weapon.accuracy?.value}`}
        <CloseBracket /> <OpenBracket />
        {t("HR +")} {weapon.damage?.value}
        <CloseBracket />
      </MenuItem>,
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
