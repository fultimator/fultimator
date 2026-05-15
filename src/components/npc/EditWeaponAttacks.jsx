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
  Menu,
  ListItemIcon,
  Snackbar,
  Alert,
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
import {
  Add,
  Menu as MenuIcon,
  Casino,
  Delete,
  LibraryAdd,
} from "@mui/icons-material";
import { TypeIcon } from "../types";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useChatMessagesStore } from "../../store/chatMessagesStore";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../app-drawer/panels/chat/domain/accuracy-checks";

const ATTR_SHORT = {
  dexterity: "dex",
  insight: "ins",
  might: "mig",
  will: "wlp",
};

function WeaponAttackContextMenu({ attack, npc, onDelete }) {
  const { t } = useTranslate();
  const { packs, ensurePersonalPack, addItem } = useCompendiumPacks();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const [anchorEl, setAnchorEl] = useState(null);
  const [packMenuAnchor, setPackMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const personalPack = packs.find((p) => p.isPersonal) ?? null;
  const unlockedNonPersonal = packs.filter((p) => !p.isPersonal && !p.locked);

  const open = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const close = () => setAnchorEl(null);

  const doAdd = async (packId) => {
    try {
      await addItem(packId, "npc-attack", attack);
      setSnackbar({
        open: true,
        message: t("Added to compendium"),
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message ?? t("Failed to add"),
        severity: "error",
      });
    }
  };

  const handleAddToCompendium = async (e) => {
    close();
    if (unlockedNonPersonal.length > 0) {
      setPackMenuAnchor(e.currentTarget);
    } else if (personalPack && !personalPack.locked) {
      await doAdd(personalPack.id);
    } else {
      const personal = await ensurePersonalPack();
      await doAdd(personal.id);
    }
  };

  const handleRoll = () => {
    const attr1Short = ATTR_SHORT[attack.accuracy?.attr1] ?? "dex";
    const attr2Short = ATTR_SHORT[attack.accuracy?.attr2] ?? "dex";
    const dieSizes = {
      primary: npc.attributes?.[attack.accuracy?.attr1] ?? 6,
      secondary: npc.attributes?.[attack.accuracy?.attr2] ?? 6,
    };
    const intent = prepareAccuracyCheck({
      attr1: attr1Short,
      attr2: attr2Short,
      accuracyBonus: attack.accuracy?.value ?? 0,
      name: attack.name,
      baseDamage: attack.damage?.value ?? 0,
      damageType: attack.damage?.type ?? "physical",
      accuracyDefense: "def",
      range: attack.range,
      hrZero: attack.damage?.hrZero === true,
    });
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(
      intent,
      rolls,
      dieSizes,
      npc.name || "NPC",
    );
    addMessage(buildAccuracyCheckMessage(result));
    close();
  };

  return (
    <>
      <IconButton size="small" onClick={open}>
        <MenuIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={handleRoll}>
          <ListItemIcon>
            <Casino fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Roll")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAddToCompendium}>
          <ListItemIcon>
            <LibraryAdd fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("Add to Compendium")}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            close();
            onDelete();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t("Delete")}</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={packMenuAnchor}
        open={Boolean(packMenuAnchor)}
        onClose={() => setPackMenuAnchor(null)}
      >
        {personalPack && !personalPack.locked && (
          <MenuItem
            onClick={async () => {
              setPackMenuAnchor(null);
              await doAdd(personalPack.id);
            }}
          >
            <ListItemText>{t("Personal")}</ListItemText>
          </MenuItem>
        )}
        {unlockedNonPersonal.map((pack) => (
          <MenuItem
            key={pack.id}
            onClick={async () => {
              setPackMenuAnchor(null);
              await doAdd(pack.id);
            }}
          >
            <ListItemText>{pack.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

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
          const { weapon: _weapon, ...current } = newState.weaponattacks[i];
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
                npc={npc}
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

function EditAttack({ attack, setAttack, removeAttack, npc, i }) {
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
      <Grid
        sx={{
          p: 0,
          m: 0,
          display: "flex",
          alignItems: "center",
          alignSelf: "flex-start",
          pt: "4px",
        }}
      >
        <WeaponAttackContextMenu
          attack={attack}
          npc={npc}
          onDelete={removeAttack}
        />
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
            id="accuracy-value"
            type="number"
            label={t("Acc.")}
            value={attack.accuracy?.value ?? 0}
            onChange={(e) => {
              return setAttack("accuracy", {
                ...(attack.accuracy ?? {
                  attr1: selectedWeapon.accuracy?.attr1 ?? "dexterity",
                  attr2: selectedWeapon.accuracy?.attr2 ?? "might",
                  defense: "def",
                }),
                value: parseInt(e.target.value, 10) || 0,
              });
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
            id="damage-value"
            type="number"
            label={t("Dmg.")}
            value={attack.damage?.value ?? 0}
            onChange={(e) => {
              return setAttack("damage", {
                ...(attack.damage ?? {
                  type: selectedWeapon.damage?.type ?? "physical",
                  hrZero: false,
                }),
                value: parseInt(e.target.value, 10) || 0,
              });
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
            value={attack.damage?.type || selectedWeapon.damage?.type}
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
