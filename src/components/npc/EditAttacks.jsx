import {
  Grid,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
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
import { useState } from "react";
import types from "../../libs/types";
import { DistanceIcon, MeleeIcon } from "../icons";
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
import CompendiumViewerModal from "../compendium/CompendiumViewerModal";
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

function AttackContextMenu({ attack, npc, onDelete }) {
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
      primary: npc.attributes?.[attack.accuracy?.attr1]?.base ?? 6,
      secondary: npc.attributes?.[attack.accuracy?.attr2]?.base ?? 6,
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

export default function EditAttacks({ npc, setNpc }) {
  const { t } = useTranslate();

  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAttackIndex, setPendingAttackIndex] = useState(null);

  const openCompendiumModal = () => {
    setModalOpen(true);
  };

  const closeCompendiumModal = () => {
    setModalOpen(false);
  };

  const onChangeAttacks = (i) => {
    return (key, value) => {
      setNpc((prevState) => {
        const newState = Object.assign({}, prevState);
        newState.attacks[i][key] = value;
        return newState;
      });
    };
  };

  const addAttack = () => {
    setNpc((prevState) => ({
      ...prevState,
      attacks: [
        ...(prevState.attacks || []),
        {
          itemType: "basic",
          name: "",
          range: "melee",
          accuracy: {
            attr1: "dexterity",
            attr2: "dexterity",
            value: 0,
            defense: "def",
          },
          damage: { value: 0, type: "physical", hrZero: false },
          special: [],
        },
      ],
    }));
  };

  const removeAttack = (i) => {
    setNpc((prevState) => ({
      ...prevState,
      attacks: (prevState.attacks || []).filter((_, index) => index !== i),
    }));
  };

  const openDeleteDialog = (index) => {
    setPendingAttackIndex(index);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <CustomHeader
        type="top"
        openCompendium={openCompendiumModal}
        addItem={addAttack}
        headerText={t("Basic Attacks")}
        icon={Add}
      />
      {npc.attacks?.map((attack, i) => {
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
            {i !== npc.attacks.length - 1 && (
              <Grid size={12}>
                <Divider />
              </Grid>
            )}
          </Grid>
        );
      })}
      <CompendiumViewerModal
        open={modalOpen}
        onClose={closeCompendiumModal}
        context="npc"
        initialType="attacks"
        onAddItem={(item) => {
          setNpc((prev) => ({
            ...prev,
            attacks: [
              ...(prev.attacks || []),
              {
                itemType: "basic",
                name: item.name,
                range: item.ranged === true ? "ranged" : "melee",
                accuracy: {
                  attr1: item.accuracy?.attr1 ?? "dexterity",
                  attr2: item.accuracy?.attr2 ?? "dexterity",
                  value: item.accuracy?.value ?? 0,
                  defense: item.accuracy?.defense ?? "def",
                },
                damage: {
                  value: item.damage?.value ?? 0,
                  type: item.damage?.type ?? "physical",
                  hrZero: item.damage?.hrZero === true,
                },
                special: [],
              },
            ],
          }));
        }}
      />
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
            ? npc.attacks?.[pendingAttackIndex]?.name || ""
            : ""
        }
      />
    </>
  );
}

function EditAttack({ attack, setAttack, removeAttack, npc, i }) {
  const { t } = useTranslate();
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
        <AttackContextMenu attack={attack} npc={npc} onDelete={removeAttack} />
      </Grid>
      <Grid size={10}>
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
      <Grid
        size={{
          xs: 6,
          md: 4,
          lg: 3,
        }}
      >
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-attr1label"}>
            {t("Attr 1:")}
          </InputLabel>
          <Select
            value={attack.accuracy?.attr1 ?? "dexterity"}
            labelId={"attack-" + i + "-attr1label"}
            id={"attack-" + i + "-attr1"}
            label={t("Attr 1:")}
            size="small"
            onChange={(e) => {
              return setAttack("accuracy", {
                ...(attack.accuracy ?? {
                  attr2: "dexterity",
                  value: 0,
                  defense: "def",
                }),
                attr1: e.target.value,
              });
            }}
          >
            <MenuItem value={"dexterity"}>{t("DEX")}</MenuItem>
            <MenuItem value={"insight"}>{t("INS")}</MenuItem>
            <MenuItem value={"might"}>{t("MIG")}</MenuItem>
            <MenuItem value={"will"}>{t("WLP")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 6,
          md: 4,
          lg: 3,
        }}
      >
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-attr2label"}>
            {t("Attr 2:")}
          </InputLabel>
          <Select
            value={attack.accuracy?.attr2 ?? "dexterity"}
            labelId={"attack-" + i + "-attr2label"}
            id={"attack-" + i + "-attr2"}
            label={t("Attr 2:")}
            size="small"
            onChange={(e) => {
              return setAttack("accuracy", {
                ...(attack.accuracy ?? {
                  attr1: "dexterity",
                  value: 0,
                  defense: "def",
                }),
                attr2: e.target.value,
              });
            }}
          >
            <MenuItem value={"dexterity"}>{t("DEX")}</MenuItem>
            <MenuItem value={"insight"}>{t("INS")}</MenuItem>
            <MenuItem value={"might"}>{t("MIG")}</MenuItem>
            <MenuItem value={"will"}>{t("WLP")}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid
        size={{
          xs: 8,
          lg: 3,
        }}
      >
        <FormControl variant="outlined" fullWidth>
          <InputLabel id={"attack-" + i + "-type"}>{t("Type:")}</InputLabel>
          <Select
            value={attack.damage?.type ?? "physical"}
            labelId={"attack-" + i + "-type"}
            id={"attack-" + i + "-type"}
            label={t("Type:")}
            size="small"
            renderValue={(selected) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TypeIcon type={selected} />
                <span style={{ textTransform: "capitalize" }}>
                  {types[selected]?.long ?? selected}
                </span>
              </Box>
            )}
            onChange={(e) => {
              return setAttack("damage", {
                ...(attack.damage ?? { value: 0, hrZero: false }),
                type: e.target.value,
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
      <Grid size={2}>
        <FormControl variant="standard" fullWidth>
          <ToggleButtonGroup
            size="medium"
            value={attack.range}
            exclusive
            onChange={(e, value) => {
              return setAttack("range", value);
            }}
            aria-label="text alignment"
          >
            <ToggleButton value="melee" aria-label="left aligned">
              <MeleeIcon />
            </ToggleButton>
            <ToggleButton value="ranged" aria-label="right">
              <DistanceIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
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
                  attr1: "dexterity",
                  attr2: "dexterity",
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
                ...(attack.damage ?? { type: "physical", hrZero: false }),
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
                      value: 0,
                      type: "physical",
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
    setSpecials(e.target.value);

    if (e.target.value === "") {
      setAttack("special", []);
      return;
    }

    setAttack("special", [e.target.value]);
  };

  return (
    <Grid container spacing={1} sx={{ py: 1, alignItems: "center" }}>
      <Grid size={12}>
        <FormControl variant="standard" fullWidth>
          <CustomTextarea
            id="special"
            label={t("Special:")}
            value={specials}
            onChange={onChange}
            helperText={t("Adding a special effect cost 1 skill point")}
          />
        </FormControl>
      </Grid>
    </Grid>
  );
}
