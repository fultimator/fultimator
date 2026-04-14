import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  Autocomplete,
  IconButton,
  Box,
  Typography,
  ListSubheader,
} from "@mui/material";
import { Close, Delete as DeleteIcon } from "@mui/icons-material";
import { OffensiveSpellIcon } from "../icons";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import types from "../../libs/types";
import classList from "../../libs/classes";
import spellClassesList from "../../libs/spellClasses";
import specialSkillsList from "../../libs/skills";
import { availableFrames } from "../../libs/pilotVehicleData";
import {
  Chip,
  Box as MuiBox,
  OutlinedInput,
} from "@mui/material";

import PlayerWeaponModal from "../player/equipment/weapons/PlayerWeaponModal";
import PlayerArmorModal from "../player/equipment/armor/PlayerArmorModal";
import PlayerShieldModal from "../player/equipment/shields/PlayerShieldModal";
import PlayerCustomWeaponModal from "../player/equipment/customWeapons/PlayerCustomWeaponModal";
import PlayerAccessoryModal from "../player/equipment/accessories/PlayerAccessoryModal";
import CustomTextarea from "../common/CustomTextarea";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";

// Shared attribute options
const ATTRS = [
  { value: "dexterity", label: "DEX" },
  { value: "insight",   label: "INS" },
  { value: "might",     label: "MIG" },
  { value: "will",      label: "WLP" },
];

const DURATION_OPTIONS = ["Scene", "Instantaneous", "Special"];
const TARGET_OPTIONS   = [
  "Self",
  "One creature",
  "Up to two creatures",
  "Up to three creatures",
  "Up to four creatures",
  "Up to five creatures",
  "One equipped weapon",
  "Special",
];
const NON_STATIC_TYPES = [
  { value: "default",          label: "Standard Spell" },
  { value: "gift",             label: "Gift" },
  { value: "dance",            label: "Dance" },
  { value: "therioform",       label: "Therioform" },
  { value: "magichant-key",    label: "Key (Chanter)" },
  { value: "magichant",        label: "Tone (Chanter)" },
  { value: "symbol",           label: "Symbol" },
  { value: "invocation",       label: "Invocation" },
  { value: "arcanist",         label: "Arcanum" },
  { value: "arcanist-rework",  label: "Arcanum (Rework)" },
  { value: "tinkerer-alchemy", label: "Alchemy" },
  { value: "tinkerer-infusion",label: "Infusion" },
  { value: "cooking",          label: "Delicacy" },
  { value: "magiseed",         label: "Magiseed" },
  { value: "pilot-vehicle",    label: "Pilot Vehicle" },
];
const WELLSPRINGS = ["Air", "Earth", "Fire", "Lightning", "Water"];
const INV_TYPES   = ["Blast", "Hex", "Utility"];
const PILOT_SUBTYPES = [
  { value: "frame",   label: "Vehicle Frame" },
  { value: "armor",   label: "Armor Module" },
  { value: "weapon",  label: "Weapon Module" },
  { value: "support", label: "Support Module" },
];
const PILOT_WEAPON_CATEGORIES = ["Arcane", "Brawling", "Bow", "Dagger", "Firearm", "Flail", "Heavy", "Spear", "Sword"];
const PILOT_DAMAGE_TYPES = ["Physical", "Air", "Bolt", "Dark", "Earth", "Fire", "Ice", "Light", "Poison"];
const PILOT_ATTRS = ["dexterity", "insight", "might", "willpower"];
const PILOT_RANGES = ["Melee", "Ranged"];
const STANDARD_SPELL_CLASSES = ["Chimerist", "Tinkerer", "Elementalist", "Entropist", "Spiritist"];

// NPC Attack form

function NpcAttackForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name,    setName]    = useState(editData?.name ?? "");
  const [range,   setRange]   = useState(editData?.range ?? "melee");
  const [attr1,   setAttr1]   = useState(editData?.attr1 ?? "dexterity");
  const [attr2,   setAttr2]   = useState(editData?.attr2 ?? "dexterity");
  const [dmgType, setDmgType] = useState(editData?.type ?? "physical");
  const [special, setSpecial] = useState(Array.isArray(editData?.special) ? (editData.special[0] ?? "") : (editData?.special ?? ""));
  const [saving,  setSaving]  = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setName(editData?.name ?? "");
    setRange(editData?.range ?? "melee");
    setAttr1(editData?.attr1 ?? "dexterity");
    setAttr2(editData?.attr2 ?? "dexterity");
    setDmgType(editData?.type ?? "physical");
    setSpecial(Array.isArray(editData?.special) ? (editData.special[0] ?? "") : (editData?.special ?? ""));
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      itemType: "basic",
      name: name.trim(),
      range,
      attr1,
      attr2,
      type: dmgType,
      special: special.trim() ? [special.trim()] : [],
    };
    if (isEditing) {
      await updateItem(packId, editItemId, payload);
    } else {
      await addItem(packId, "npc-attack", payload);
    }
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New NPC Attack")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid  size={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Range")}</InputLabel>
              <Select value={range} label={t("Range")} onChange={(e) => setRange(e.target.value)}>
                <MenuItem value="melee">{t("Melee")}</MenuItem>
                <MenuItem value="distance">{t("Distance")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 1")}</InputLabel>
              <Select value={attr1} label={t("Attr 1")} onChange={(e) => setAttr1(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 2")}</InputLabel>
              <Select value={attr2} label={t("Attr 2")} onChange={(e) => setAttr2(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Damage Type")}</InputLabel>
              <Select value={dmgType} label={t("Damage Type")} onChange={(e) => setDmgType(e.target.value)}>
                {Object.keys(types).map((type) => (
                  <MenuItem key={type} value={type}>{types[type].long}</MenuItem>
                ))}
                <MenuItem value="nodmg">{t("No Damage")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid  size={12}>
            <CustomTextarea
              label={t("Special")}
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              helperText=""
              placeholder={t("Optional special effect description")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// NPC Spell form

function NpcSpellForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name,       setName]       = useState(editData?.name ?? "");
  const [isOffensive, setIsOffensive] = useState(editData?.type === "offensive");
  const [mp,         setMp]         = useState(editData?.mp != null ? String(editData.mp) : "");
  const [maxTargets, setMaxTargets] = useState(editData?.maxTargets != null ? String(editData.maxTargets) : "");
  const [duration,   setDuration]   = useState(editData?.duration ?? "");
  const [target,     setTarget]     = useState(editData?.target ?? "");
  const [range,      setRange]      = useState(editData?.range ?? "melee");
  const [attr1,      setAttr1]      = useState(editData?.attr1 ?? "dexterity");
  const [attr2,      setAttr2]      = useState(editData?.attr2 ?? "dexterity");
  const [dmgType,    setDmgType]    = useState(editData?.damagetype ?? "physical");
  const [special,    setSpecial]    = useState(Array.isArray(editData?.special) ? (editData.special[0] ?? "") : (editData?.special ?? ""));
  const [saving,     setSaving]     = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setName(editData?.name ?? "");
    setIsOffensive(editData?.type === "offensive");
    setMp(editData?.mp != null ? String(editData.mp) : "");
    setMaxTargets(editData?.maxTargets != null ? String(editData.maxTargets) : "");
    setDuration(editData?.duration ?? "");
    setTarget(editData?.target ?? "");
    setRange(editData?.range ?? "melee");
    setAttr1(editData?.attr1 ?? "dexterity");
    setAttr2(editData?.attr2 ?? "dexterity");
    setDmgType(editData?.damagetype ?? "physical");
    setSpecial(Array.isArray(editData?.special) ? (editData.special[0] ?? "") : (editData?.special ?? ""));
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      itemType: "spell",
      name: name.trim(),
      type: isOffensive ? "offensive" : "",
      damagetype: dmgType,
      mp: mp === "" ? undefined : Number(mp),
      maxTargets: maxTargets === "" ? undefined : Number(maxTargets),
      duration: duration || undefined,
      target: target || undefined,
      range,
      attr1,
      attr2,
      special: special.trim() ? [special.trim()] : [],
    };
    if (isEditing) {
      await updateItem(packId, editItemId, payload);
    } else {
      await addItem(packId, "npc-spell", payload);
    }
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New NPC Spell")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid
            size={{
              xs: 10,
              sm: 11
            }}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              slotProps={{
                htmlInput: { maxLength: 50 }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 2,
              sm: 1
            }}>
            <ToggleButton
              value="offensive"
              selected={isOffensive}
              onChange={() => setIsOffensive((v) => !v)}
              size="small"
              sx={{ width: "100%" }}
            >
              <OffensiveSpellIcon />
            </ToggleButton>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3
            }}>
            <TextField
              label={t("MP x Target")}
              value={mp}
              onChange={(e) => setMp(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3
            }}>
            <TextField
              label={t("Max Targets")}
              value={maxTargets}
              onChange={(e) => setMaxTargets(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Autocomplete
              freeSolo
              options={DURATION_OPTIONS.map(t)}
              value={duration}
              onInputChange={(_, v) => setDuration(v)}
              renderInput={(params) => (
                <TextField {...params} label={t("Duration")} size="small" />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Autocomplete
              freeSolo
              options={TARGET_OPTIONS.map(t)}
              value={target}
              onInputChange={(_, v) => setTarget(v)}
              renderInput={(params) => (
                <TextField {...params} label={t("Target")} size="small" />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Range")}</InputLabel>
              <Select value={range} label={t("Range")} onChange={(e) => setRange(e.target.value)}>
                <MenuItem value="melee">{t("Melee")}</MenuItem>
                <MenuItem value="distance">{t("Distance")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {isOffensive && (
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Damage Type")}</InputLabel>
                <Select value={dmgType} label={t("Damage Type")} onChange={(e) => setDmgType(e.target.value)}>
                  {Object.keys(types).map((type) => (
                    <MenuItem key={type} value={type}>{types[type].long}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid
            size={{
              xs: 6,
              sm: 3
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 1")}</InputLabel>
              <Select value={attr1} label={t("Attr 1")} onChange={(e) => setAttr1(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 2")}</InputLabel>
              <Select value={attr2} label={t("Attr 2")} onChange={(e) => setAttr2(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid  size={12}>
            <CustomTextarea
              label={t("Special")}
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              helperText=""
              placeholder={t("Spell effect description")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

function NpcSpecialForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name, setName] = useState(editData?.name ?? "");
  const [effect, setEffect] = useState(editData?.effect ?? "");
  const [spCost, setSpCost] = useState(editData?.spCost != null ? String(editData.spCost) : "");
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setName(editData?.name ?? "");
    setEffect(editData?.effect ?? "");
    setSpCost(editData?.spCost != null ? String(editData.spCost) : "");
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      effect: effect.trim(),
      spCost: spCost === "" ? undefined : Number(spCost),
    };
    if (isEditing) await updateItem(packId, editItemId, payload);
    else await addItem(packId, "npc-special", payload);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New Special Rule")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid  size={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <TextField
              label={t("SP Cost")}
              value={spCost}
              onChange={(e) => setSpCost(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 }
              }}
            />
          </Grid>
          <Grid  size={12}>
            <CustomTextarea
              label={t("Effect")}
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              helperText=""
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

function NpcActionForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name, setName] = useState(editData?.name ?? "");
  const [effect, setEffect] = useState(editData?.effect ?? "");
  const [spCost, setSpCost] = useState(editData?.spCost != null ? String(editData.spCost) : "");
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setName(editData?.name ?? "");
    setEffect(editData?.effect ?? "");
    setSpCost(editData?.spCost != null ? String(editData.spCost) : "");
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      effect: effect.trim(),
      spCost: spCost === "" ? undefined : Number(spCost),
    };
    if (isEditing) await updateItem(packId, editItemId, payload);
    else await addItem(packId, "npc-action", payload);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New Other Action")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid  size={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4
            }}>
            <TextField
              label={t("SP Cost")}
              value={spCost}
              onChange={(e) => setSpCost(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 }
              }}
            />
          </Grid>
          <Grid  size={12}>
            <CustomTextarea
              label={t("Effect")}
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              helperText=""
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// Player Spell form

const spellClasses = STANDARD_SPELL_CLASSES;

function PlayerSpellForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [spellType,   setSpellType]   = useState(
    editData?.spellType === "magichant" && editData?.magichantSubtype === "key"
      ? "magichant-key"
      : (editData?.spellType ?? "default")
  );
  const [spellClass,  setSpellClass]  = useState(editData?.class ?? spellClasses[0] ?? "");
  const [name,        setName]        = useState(editData?.name ?? "");
  const [description, setDescription] = useState(editData?.description ?? "");
  const [isOffensive, setIsOffensive] = useState(Boolean(editData?.isOffensive));
  const [mp,          setMp]          = useState(editData?.mp != null ? String(editData.mp) : "");
  const [maxTargets,  setMaxTargets]  = useState(editData?.maxTargets != null ? String(editData.maxTargets) : "1");
  const [targetDesc,  setTargetDesc]  = useState(editData?.targetDesc ?? "");
  const [duration,    setDuration]    = useState(editData?.duration ?? "");
  const [attr1,       setAttr1]       = useState(editData?.attr1 ?? "insight");
  const [attr2,       setAttr2]       = useState(editData?.attr2 ?? "will");
  const [effect,      setEffect]      = useState(editData?.effect ?? "");
  const [event,       setEvent]       = useState(editData?.event ?? "");
  const [genoclepsis, setGenoclepsis] = useState(editData?.genoclepsis ?? "");
  const [keyType,     setKeyType]     = useState(editData?.type ?? "");
  const [keyStatus,   setKeyStatus]   = useState(editData?.status ?? "");
  const [keyAttribute,setKeyAttribute]= useState(editData?.attribute ?? "");
  const [keyRecovery, setKeyRecovery] = useState(editData?.recovery ?? "");
  const [wellspring,  setWellspring]  = useState(editData?.wellspring ?? "");
  const [invType,     setInvType]     = useState(editData?.type ?? "");
  const [domain,      setDomain]      = useState(editData?.domain ?? "");
  const [domainDesc,  setDomainDesc]  = useState(editData?.domainDesc ?? "");
  const [merge,       setMerge]       = useState(editData?.merge ?? "");
  const [mergeDesc,   setMergeDesc]   = useState(editData?.mergeDesc ?? "");
  const [dismiss,     setDismiss]     = useState(editData?.dismiss ?? "");
  const [dismissDesc, setDismissDesc] = useState(editData?.dismissDesc ?? "");
  const [pulse,       setPulse]       = useState(editData?.pulse ?? "");
  const [pulseDesc,   setPulseDesc]   = useState(editData?.pulseDesc ?? "");
  const [itemCategory,setItemCategory]= useState(editData?.category ?? "");
  const [infusionRank,setInfusionRank]= useState(editData?.infusionRank != null ? String(editData.infusionRank) : "");
  const [seedRangeStart, setSeedRangeStart] = useState(editData?.rangeStart ?? 1);
  const [seedRangeEnd, setSeedRangeEnd] = useState(editData?.rangeEnd ?? 4);
  const [seedDescription, setSeedDescription] = useState(editData?.description ?? "");
  const [seedEffects, setSeedEffects] = useState(editData?.effects ?? {});
  const [cookingEffects, setCookingEffects] = useState(
    Array.from({ length: 12 }, (_, i) => editData?.cookbookEffects?.[i]?.effect ?? "")
  );
  const [pilotSubtype, setPilotSubtype] = useState(editData?.pilotSubtype ?? "frame");
  const [vehicleFrame, setVehicleFrame] = useState(editData?.frame ?? availableFrames[0]?.name ?? "");
  const [moduleDef, setModuleDef] = useState(editData?.def != null ? String(editData.def) : "");
  const [moduleMdef, setModuleMdef] = useState(editData?.mdef != null ? String(editData.mdef) : "");
  const [moduleMartial, setModuleMartial] = useState(Boolean(editData?.martial));
  const [moduleDamage, setModuleDamage] = useState(editData?.damage != null ? String(editData.damage) : "");
  const [moduleRange, setModuleRange] = useState(editData?.range ?? "Melee");
  const [modulePrec, setModulePrec] = useState(editData?.prec != null ? String(editData.prec) : "0");
  const [moduleCost, setModuleCost] = useState(editData?.cost != null ? String(editData.cost) : "0");
  const [moduleDescription, setModuleDescription] = useState(editData?.description ?? "");
  const [weaponCategory, setWeaponCategory] = useState(editData?.category ?? "Heavy");
  const [damageType, setDamageType] = useState(editData?.damageType ?? "Physical");
  const [pilotAtt1, setPilotAtt1] = useState(editData?.att1 ?? "might");
  const [pilotAtt2, setPilotAtt2] = useState(editData?.att2 ?? "dexterity");
  const [pilotQuality, setPilotQuality] = useState(editData?.quality ?? "");
  const [pilotQualityCost, setPilotQualityCost] = useState(editData?.qualityCost != null ? String(editData.qualityCost) : "0");
  const [isShield, setIsShield] = useState(Boolean(editData?.isShield));
  const [moduleCumbersome, setModuleCumbersome] = useState(Boolean(editData?.cumbersome));
  const [saving,      setSaving]      = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setSpellType(
      editData?.spellType === "magichant" && editData?.magichantSubtype === "key"
        ? "magichant-key"
        : (editData?.spellType ?? "default")
    );
    setSpellClass(editData?.class ?? spellClasses[0] ?? "");
    setName(editData?.name ?? "");
    setDescription(editData?.description ?? "");
    setIsOffensive(Boolean(editData?.isOffensive));
    setMp(editData?.mp != null ? String(editData.mp) : "");
    setMaxTargets(editData?.maxTargets != null ? String(editData.maxTargets) : "1");
    setTargetDesc(editData?.targetDesc ?? "");
    setDuration(editData?.duration ?? "");
    setAttr1(editData?.attr1 ?? "insight");
    setAttr2(editData?.attr2 ?? "will");
    setEffect(editData?.effect ?? "");
    setEvent(editData?.event ?? "");
    setGenoclepsis(editData?.genoclepsis ?? "");
    setKeyType(editData?.type ?? "");
    setKeyStatus(editData?.status ?? "");
    setKeyAttribute(editData?.attribute ?? "");
    setKeyRecovery(editData?.recovery ?? "");
    setWellspring(editData?.wellspring ?? "");
    setInvType(editData?.type ?? "");
    setDomain(editData?.domain ?? "");
    setDomainDesc(editData?.domainDesc ?? "");
    setMerge(editData?.merge ?? "");
    setMergeDesc(editData?.mergeDesc ?? "");
    setDismiss(editData?.dismiss ?? "");
    setDismissDesc(editData?.dismissDesc ?? "");
    setPulse(editData?.pulse ?? "");
    setPulseDesc(editData?.pulseDesc ?? "");
    setItemCategory(editData?.category ?? "");
    setInfusionRank(editData?.infusionRank != null ? String(editData.infusionRank) : "");
    setSeedRangeStart(editData?.rangeStart ?? 1);
    setSeedRangeEnd(editData?.rangeEnd ?? 4);
    setSeedDescription(editData?.description ?? "");
    setSeedEffects(editData?.effects ?? {});
    setCookingEffects(Array.from({ length: 12 }, (_, i) => editData?.cookbookEffects?.[i]?.effect ?? ""));
    setPilotSubtype(editData?.pilotSubtype ?? "frame");
    setVehicleFrame(editData?.frame ?? availableFrames[0]?.name ?? "");
    setModuleDef(editData?.def != null ? String(editData.def) : "");
    setModuleMdef(editData?.mdef != null ? String(editData.mdef) : "");
    setModuleMartial(Boolean(editData?.martial));
    setModuleDamage(editData?.damage != null ? String(editData.damage) : "");
    setModuleRange(editData?.range ?? "Melee");
    setModulePrec(editData?.prec != null ? String(editData.prec) : "0");
    setModuleCost(editData?.cost != null ? String(editData.cost) : "0");
    setModuleDescription(editData?.description ?? "");
    setWeaponCategory(editData?.category ?? "Heavy");
    setDamageType(editData?.damageType ?? "Physical");
    setPilotAtt1(editData?.att1 ?? "might");
    setPilotAtt2(editData?.att2 ?? "dexterity");
    setPilotQuality(editData?.quality ?? "");
    setPilotQualityCost(editData?.qualityCost != null ? String(editData.qualityCost) : "0");
    setIsShield(Boolean(editData?.isShield));
    setModuleCumbersome(Boolean(editData?.cumbersome));
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    let payload;
    if (spellType === "default") {
      payload = {
        class: spellClass,
        name: name.trim(),
        description: description.trim(),
        isOffensive,
        mp: mp === "" ? 0 : Number(mp),
        maxTargets: maxTargets === "" ? 1 : Number(maxTargets),
        targetDesc: targetDesc.trim() || "One creature",
        duration: duration.trim() || "Instantaneous",
        attr1,
        attr2,
        spellType: "default",
      };
    } else {
      payload = {
        name: name.trim(),
        spellType: spellType === "magichant-key" ? "magichant" : spellType,
        magichantSubtype: spellType === "magichant-key" ? "key" : spellType === "magichant" ? "tone" : undefined,
        effect: effect.trim(),
        description: spellType === "magiseed" ? seedDescription.trim() : effect.trim(),
        event: event.trim() || undefined,
        genoclepsis: genoclepsis.trim() || undefined,
        duration: duration.trim() || undefined,
        wellspring: wellspring.trim() || undefined,
        type: spellType === "magichant-key"
          ? keyType.trim() || undefined
          : invType.trim() || undefined,
        status: spellType === "magichant-key" ? keyStatus.trim() || undefined : undefined,
        attribute: spellType === "magichant-key" ? keyAttribute.trim() || undefined : undefined,
        recovery: spellType === "magichant-key" ? keyRecovery.trim() || undefined : undefined,
        domain: domain.trim() || undefined,
        domainDesc: domainDesc.trim() || undefined,
        merge: merge.trim() || undefined,
        mergeDesc: mergeDesc.trim() || undefined,
        dismiss: dismiss.trim() || undefined,
        dismissDesc: dismissDesc.trim() || undefined,
        pulse: pulse.trim() || undefined,
        pulseDesc: pulseDesc.trim() || undefined,
        category: itemCategory.trim() || undefined,
        infusionRank: infusionRank === "" ? undefined : Number(infusionRank),
        rangeStart: spellType === "magiseed" ? Number(seedRangeStart) : undefined,
        rangeEnd: spellType === "magiseed" ? Number(seedRangeEnd) : undefined,
        effects: spellType === "magiseed" ? seedEffects : undefined,
        cookbookEffects: spellType === "cooking"
          ? cookingEffects.map((fx, i) => ({ id: i + 1, effect: fx.trim(), customChoices: {} }))
          : undefined,
        ...(spellType === "pilot-vehicle" && (() => {
          const frameData = availableFrames.find((f) => f.name === vehicleFrame);
          const base = { pilotSubtype, customName: name.trim(), enabled: false, equipped: false, equippedSlot: null };
          if (pilotSubtype === "frame") {
            return {
              ...base,
              frame: vehicleFrame,
              passengers: frameData?.passengers ?? 0,
              distance: frameData?.distance ?? 1,
              description: effect.trim(),
            };
          }
          if (pilotSubtype === "armor") {
            return {
              ...base,
              name: "pilot_custom_armor",
              type: "pilot_module_armor",
              category: "Armor",
              cost: Number(moduleCost) || 0,
              def: Number(moduleDef) || 0,
              mdef: Number(moduleMdef) || 0,
              martial: moduleMartial,
              description: moduleDescription.trim() || undefined,
            };
          }
          if (pilotSubtype === "weapon") {
            return {
              ...base,
              name: "pilot_custom_weapon",
              type: "pilot_module_weapon",
              category: weaponCategory,
              cost: Number(moduleCost) || 0,
              damage: Number(moduleDamage) || 0,
              range: moduleRange || "Melee",
              damageType,
              prec: Number(modulePrec) || 0,
              cumbersome: moduleCumbersome,
              att1: pilotAtt1,
              att2: pilotAtt2,
              quality: pilotQuality.trim(),
              qualityCost: Number(pilotQualityCost) || 0,
              isShield,
              equippedSlot: "main",
            };
          }
          return {
            ...base,
            name: "pilot_custom_support",
            type: "pilot_module_support",
            description: effect.trim(),
            isComplex: true,
            cost: Number(moduleCost) || 0,
          };
        })()),
      };
    }
    if (isEditing) await updateItem(packId, editItemId, payload);
    else await addItem(packId, "player-spell", payload);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New Player Spell")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid
            size={{
              xs: 12,
              sm: 5
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Spell Type")}</InputLabel>
              <Select value={spellType} label={t("Spell Type")} onChange={(e) => setSpellType(e.target.value)}>
                {NON_STATIC_TYPES.map((st) => <MenuItem key={st.value} value={st.value}>{t(st.label)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {spellType === "default" && (
            <Grid
              size={{
                xs: 12,
                sm: 7
              }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Class")}</InputLabel>
                <Select value={spellClass} label={t("Class")} onChange={(e) => setSpellClass(e.target.value)}>
                  {spellClasses.map((c) => (
                    <MenuItem key={c} value={c}>{t(c)}</MenuItem>
                  ))}
                  <MenuItem value="">{t("Custom")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid  size={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          {spellType === "default" ? (
            <>
              <Grid
                size={{
                  xs: 2,
                  sm: 1
                }}>
                <ToggleButton
                  value="offensive"
                  selected={isOffensive}
                  onChange={() => setIsOffensive((v) => !v)}
                  size="small"
                  sx={{ width: "100%" }}
                >
                  <OffensiveSpellIcon />
                </ToggleButton>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3
                }}>
                <TextField
                  label={t("MP")}
                  value={mp}
                  onChange={(e) => setMp(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0 }
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3
                }}>
                <TextField
                  label={t("Max Targets")}
                  value={maxTargets}
                  onChange={(e) => setMaxTargets(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0 }
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Autocomplete
                  freeSolo
                  options={TARGET_OPTIONS.map(t)}
                  value={targetDesc}
                  onInputChange={(_, v) => setTargetDesc(v)}
                  renderInput={(params) => (
                    <TextField {...params} label={t("Target")} size="small" />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Autocomplete
                  freeSolo
                  options={DURATION_OPTIONS.map(t)}
                  value={duration}
                  onInputChange={(_, v) => setDuration(v)}
                  renderInput={(params) => (
                    <TextField {...params} label={t("Duration")} size="small" />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3
                }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Attr 1")}</InputLabel>
                  <Select value={attr1} label={t("Attr 1")} onChange={(e) => setAttr1(e.target.value)}>
                    {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3
                }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Attr 2")}</InputLabel>
                  <Select value={attr2} label={t("Attr 2")} onChange={(e) => setAttr2(e.target.value)}>
                    {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid  size={12}>
                <CustomTextarea
                  label={t("Description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText=""
                />
              </Grid>
            </>
          ) : (
            <>
              {spellType === "gift" && (
                <Grid  size={12}>
                  <TextField label={t("Event / Trigger")} value={event} onChange={(e) => setEvent(e.target.value)} fullWidth size="small" />
                </Grid>
              )}
              {spellType === "therioform" && (
                <Grid  size={12}>
                  <TextField label={t("Genoclepsis (optional)")} value={genoclepsis} onChange={(e) => setGenoclepsis(e.target.value)} fullWidth size="small" />
                </Grid>
              )}
              {spellType === "magichant-key" && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("magichant_type")} value={keyType} onChange={(e) => setKeyType(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("magichant_status_effect")} value={keyStatus} onChange={(e) => setKeyStatus(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("magichant_attribute")} value={keyAttribute} onChange={(e) => setKeyAttribute(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("magichant_recovery")} value={keyRecovery} onChange={(e) => setKeyRecovery(e.target.value)} fullWidth size="small" />
                  </Grid>
                </>
              )}
              {spellType === "dance" && (
                <Grid  size={12}>
                  <Autocomplete
                    freeSolo
                    options={DURATION_OPTIONS.map(t)}
                    value={duration}
                    onInputChange={(_, v) => setDuration(v)}
                    renderInput={(params) => <TextField {...params} label={t("Duration")} size="small" />}
                  />
                </Grid>
              )}
              {spellType === "invocation" && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Autocomplete
                      options={WELLSPRINGS}
                      value={wellspring || null}
                      onChange={(_, v) => setWellspring(v ?? "")}
                      renderInput={(params) => <TextField {...params} label={t("Wellspring")} size="small" />}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <Autocomplete
                      options={INV_TYPES}
                      value={invType || null}
                      onChange={(_, v) => setInvType(v ?? "")}
                      renderInput={(params) => <TextField {...params} label={t("Type")} size="small" />}
                    />
                  </Grid>
                </>
              )}
              {(spellType === "arcanist" || spellType === "arcanist-rework") && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("Domain name")} value={domain} onChange={(e) => setDomain(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid  size={12}>
                    <CustomTextarea label={t("Domain effect")} value={domainDesc} onChange={(e) => setDomainDesc(e.target.value)} helperText="" />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("Merge name")} value={merge} onChange={(e) => setMerge(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid  size={12}>
                    <CustomTextarea label={t("Merge effect")} value={mergeDesc} onChange={(e) => setMergeDesc(e.target.value)} helperText="" />
                  </Grid>
                  {spellType === "arcanist-rework" && (
                    <>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <TextField label={t("Pulse name")} value={pulse} onChange={(e) => setPulse(e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid  size={12}>
                        <CustomTextarea label={t("Pulse effect")} value={pulseDesc} onChange={(e) => setPulseDesc(e.target.value)} helperText="" />
                      </Grid>
                    </>
                  )}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6
                    }}>
                    <TextField label={t("Dismiss name")} value={dismiss} onChange={(e) => setDismiss(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid  size={12}>
                    <CustomTextarea label={t("Dismiss effect")} value={dismissDesc} onChange={(e) => setDismissDesc(e.target.value)} helperText="" />
                  </Grid>
                </>
              )}
              {spellType === "tinkerer-alchemy" && (
                <Grid  size={12}>
                  <TextField label={t("Category")} value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} fullWidth size="small" />
                </Grid>
              )}
              {spellType === "tinkerer-infusion" && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <TextField label={t("Rank")} value={infusionRank} onChange={(e) => setInfusionRank(e.target.value)} fullWidth size="small" type="number" slotProps={{
                    htmlInput: { min: 1, max: 3 }
                  }} />
                </Grid>
              )}
              {spellType === "cooking" && (
                <>
                  {cookingEffects.map((fx, i) => (
                    <Grid  key={i} size={12}>
                      <CustomTextarea
                        label={`${t("Roll")} ${i + 1}`}
                        value={fx}
                        onChange={(e) => {
                          const next = [...cookingEffects];
                          next[i] = e.target.value;
                          setCookingEffects(next);
                        }}
                        helperText=""
                      />
                    </Grid>
                  ))}
                </>
              )}
              {spellType === "magiseed" && (
                <>
                  <Grid  size={6}>
                    <TextField label={t("Range Start")} value={seedRangeStart} onChange={(e) => setSeedRangeStart(Number(e.target.value))} fullWidth size="small" type="number" slotProps={{
                      htmlInput: { min: 0, max: 4 }
                    }} />
                  </Grid>
                  <Grid  size={6}>
                    <TextField label={t("Range End")} value={seedRangeEnd} onChange={(e) => setSeedRangeEnd(Number(e.target.value))} fullWidth size="small" type="number" slotProps={{
                      htmlInput: { min: 1, max: 6 }
                    }} />
                  </Grid>
                  <Grid  size={12}>
                    <CustomTextarea label={t("Description")} value={seedDescription} onChange={(e) => setSeedDescription(e.target.value)} helperText="" />
                  </Grid>
                  {Array.from({ length: Math.max(0, Number(seedRangeEnd) - Number(seedRangeStart) + 1) }, (_, i) => {
                    const tick = Number(seedRangeStart) + i;
                    return (
                      <Grid  key={tick} size={12}>
                        <CustomTextarea
                          label={`${t("Tick")} ${tick}`}
                          value={seedEffects[tick] ?? ""}
                          onChange={(e) => setSeedEffects((prev) => ({ ...prev, [tick]: e.target.value }))}
                          helperText=""
                        />
                      </Grid>
                    );
                  })}
                </>
              )}
              {spellType === "pilot-vehicle" && (
                <>
                  <Grid  size={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("Component Type")}</InputLabel>
                      <Select value={pilotSubtype} label={t("Component Type")} onChange={(e) => setPilotSubtype(e.target.value)}>
                        {PILOT_SUBTYPES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{t(s.label)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {pilotSubtype === "frame" && (
                    <Grid  size={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Frame")}</InputLabel>
                        <Select value={vehicleFrame} label={t("Frame")} onChange={(e) => setVehicleFrame(e.target.value)}>
                          {availableFrames.map((f) => (
                            <MenuItem key={f.name} value={f.name}>
                              {t(f.name)}  -  {t("Passengers")}: {f.passengers} · {t("Distance")}: {f.distance}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {pilotSubtype !== "frame" && (
                    <Grid
                      size={{
                        xs: 6,
                        sm: 4
                      }}>
                      <TextField label={t("Cost")} value={moduleCost} type="number" fullWidth size="small"
                        onChange={(e) => setModuleCost(e.target.value)} slotProps={{
                        htmlInput: { min: 0 }
                      }} />
                    </Grid>
                  )}
                  {pilotSubtype === "armor" && (
                    <>
                      <Grid  size={4}>
                        <TextField label="DEF" value={moduleDef} type="number" fullWidth size="small"
                          onChange={(e) => setModuleDef(e.target.value)} />
                      </Grid>
                      <Grid  size={4}>
                        <TextField label="MDEF" value={moduleMdef} type="number" fullWidth size="small"
                          onChange={(e) => setModuleMdef(e.target.value)} />
                      </Grid>
                      <Grid  sx={{ display: "flex", alignItems: "center" }} size={4}>
                        <ToggleButton value="martial" selected={moduleMartial} onChange={() => setModuleMartial((v) => !v)} size="small" sx={{ width: "100%" }}>
                          {t("Martial")}
                        </ToggleButton>
                      </Grid>
                      <Grid  size={12}>
                        <CustomTextarea label={t("Description (optional)")} value={moduleDescription} onChange={(e) => setModuleDescription(e.target.value)} helperText="" />
                      </Grid>
                    </>
                  )}
                  {pilotSubtype === "weapon" && (
                    <>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 4
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Category")}</InputLabel>
                          <Select value={weaponCategory} label={t("Category")} onChange={(e) => setWeaponCategory(e.target.value)}>
                            {PILOT_WEAPON_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 4
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Damage Type")}</InputLabel>
                          <Select value={damageType} label={t("Damage Type")} onChange={(e) => setDamageType(e.target.value)}>
                            {PILOT_DAMAGE_TYPES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 4
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Range")}</InputLabel>
                          <Select value={moduleRange || "Melee"} label={t("Range")} onChange={(e) => setModuleRange(e.target.value)}>
                            {PILOT_RANGES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 3
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Att 1")}</InputLabel>
                          <Select value={pilotAtt1} label={t("Att 1")} onChange={(e) => setPilotAtt1(e.target.value)}>
                            {PILOT_ATTRS.map((a) => <MenuItem key={a} value={a}>{t(a)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 3
                        }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Att 2")}</InputLabel>
                          <Select value={pilotAtt2} label={t("Att 2")} onChange={(e) => setPilotAtt2(e.target.value)}>
                            {PILOT_ATTRS.map((a) => <MenuItem key={a} value={a}>{t(a)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 2
                        }}>
                        <TextField label="HR+" value={moduleDamage} type="number" fullWidth size="small" onChange={(e) => setModuleDamage(e.target.value)} />
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 2
                        }}>
                        <TextField label={t("+Acc")} value={modulePrec} type="number" fullWidth size="small" onChange={(e) => setModulePrec(e.target.value)} />
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 2
                        }}>
                        <TextField label={t("Quality Cost")} value={pilotQualityCost} type="number" fullWidth size="small" onChange={(e) => setPilotQualityCost(e.target.value)} />
                      </Grid>
                      <Grid  size={12}>
                        <CustomTextarea label={t("Quality")} value={pilotQuality} onChange={(e) => setPilotQuality(e.target.value)} helperText="" />
                      </Grid>
                      <Grid  sx={{ display: "flex", alignItems: "center" }} size={6}>
                        <ToggleButton value="cumbersome" selected={moduleCumbersome} onChange={() => setModuleCumbersome((v) => !v)} size="small" sx={{ width: "100%" }}>
                          {t("Cumbersome")}
                        </ToggleButton>
                      </Grid>
                      <Grid  sx={{ display: "flex", alignItems: "center" }} size={6}>
                        <ToggleButton value="isShield" selected={isShield} onChange={() => setIsShield((v) => !v)} size="small" sx={{ width: "100%" }}>
                          {t("Shield")}
                        </ToggleButton>
                      </Grid>
                    </>
                  )}
                </>
              )}
              {spellType !== "default" &&
               spellType !== "arcanist" &&
               spellType !== "arcanist-rework" &&
               spellType !== "cooking" &&
               spellType !== "magichant-key" &&
               !(spellType === "pilot-vehicle" && (pilotSubtype === "armor" || pilotSubtype === "weapon")) && (
                <Grid  size={12}>
                  <CustomTextarea
                    label={spellType === "therioform" || spellType === "pilot-vehicle" ? t("Description") : t("Effect")}
                    value={effect}
                    onChange={(e) => setEffect(e.target.value)}
                    helperText=""
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// Quality form

const QUALITY_CATEGORIES = ["Offensive", "Defensive", "Enhancement"];
const FILTER_OPTIONS = [
  { label: "Weapons", value: "weapon" },
  { label: "Custom Weapons", value: "customWeapon" },
  { label: "Armor", value: "armor" },
  { label: "Shields", value: "shield" },
  { label: "Accessories", value: "accessory" },
];

function QualityForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name, setName] = useState(editData?.name ?? "");
  const [category, setCategory] = useState(editData?.category ?? QUALITY_CATEGORIES[0]);
  const [quality, setQuality] = useState(editData?.quality ?? "");
  const [cost, setCost] = useState(editData?.cost ?? 0);
  const [filter, setFilter] = useState(editData?.filter ?? []);
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setName(editData?.name ?? "");
    setCategory(editData?.category ?? QUALITY_CATEGORIES[0]);
    setQuality(editData?.quality ?? "");
    setCost(editData?.cost ?? 0);
    setFilter(editData?.filter ?? []);
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      category,
      quality: quality.trim(),
      cost: Number(cost),
      filter,
    };
    if (isEditing) await updateItem(packId, editItemId, payload);
    else await addItem(packId, "quality", payload);
    setSaving(false);
    onClose();
  };

  const handleFilterChange = (event) => {
    const {
      target: { value },
    } = event;
    setFilter(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New Quality")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Category")}</InputLabel>
              <Select
                value={category}
                label={t("Category")}
                onChange={(e) => setCategory(e.target.value)}
              >
                {QUALITY_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(cat)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid  size={12}>
            <CustomTextarea
              label={t("Quality Effect")}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              helperText=""
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label={t("Cost")}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              fullWidth
              size="small"
              type="number"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-label">{t("Applicable to")}</InputLabel>
              <Select
                labelId="filter-label"
                id="filter-select"
                multiple
                value={filter}
                onChange={handleFilterChange}
                input={<OutlinedInput label={t("Applicable to")} />}
                renderValue={(selected) => (
                  <MuiBox sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={t(FILTER_OPTIONS.find((o) => o.value === value)?.label || value)}
                        size="small"
                      />
                    ))}
                  </MuiBox>
                )}
              >
                {FILTER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// Heroic form

const CLASS_NAME_OPTIONS = classList.map((c) => c.name);
const HEROIC_BOOK_OPTIONS = ["core", "rework", "bonus", "high", "techno", "natural"];

function HeroicForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name, setName] = useState(editData?.name ?? "");
  const [book, setBook] = useState(editData?.book ?? "");
  const [quote, setQuote] = useState(editData?.quote ?? "");
  const [description, setDescription] = useState(editData?.description ?? "");
  const [applicableTo, setApplicableTo] = useState(editData?.applicableTo ?? []);
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(editItemId);

  useEffect(() => {
    setName(editData?.name ?? "");
    setBook(editData?.book ?? "");
    setQuote(editData?.quote ?? "");
    setDescription(editData?.description ?? "");
    setApplicableTo(editData?.applicableTo ?? []);
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      book,
      quote: quote.trim(),
      description: description.trim(),
      applicableTo,
    };
    if (isEditing) await updateItem(packId, editItemId, payload);
    else await addItem(packId, "heroic", payload);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {t("New Heroic Skill")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid  size={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              slotProps={{
                htmlInput: { maxLength: 50 }
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Book")}</InputLabel>
              <Select
                value={book}
                label={t("Book")}
                onChange={(e) => setBook(e.target.value)}
              >
                <MenuItem value="">{t("None")}</MenuItem>
                {HEROIC_BOOK_OPTIONS.map((b) => (
                  <MenuItem key={b} value={b} sx={{ textTransform: "capitalize" }}>
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid  size={12}>
            <Autocomplete
              multiple
              options={CLASS_NAME_OPTIONS}
              value={applicableTo}
              onChange={(_, newValue) => setApplicableTo(newValue)}
              freeSolo
              renderValue={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip key={option} label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Applicable To")}
                  size="small"
                  placeholder={t("Select classes...")}
                />
              )}
            />
          </Grid>
          <Grid  size={12}>
            <TextField
              label={t("Quote")}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              fullWidth
              size="small"
              slotProps={{
                htmlInput: { maxLength: 200 }
              }}
            />
          </Grid>
          <Grid  size={12}>
            <CustomTextarea
              label={t("Description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText=""
              maxLength={1500}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t(isEditing ? "Save" : "Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// Class form

const BLANK_BENEFITS = {
  hpplus: 0,
  mpplus: 0,
  ipplus: 0,
  isCustomBenefit: false,
  martials: { armor: false, shields: false, melee: false, ranged: false },
  rituals: { ritualism: false },
  custom: [],
  spellClasses: [],
};

const GROUPED_SPECIAL_SKILLS = specialSkillsList.reduce((acc, skill) => {
  if (!acc[skill.class]) acc[skill.class] = [];
  acc[skill.class].push(skill);
  return acc;
}, {});

export function ClassForm({ open, packId, onClose, editData, editItemId, onItemCreated }) {
  const { t } = useTranslate();
  const { addItem, updateItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const initBenefits = editData?.benefits ?? BLANK_BENEFITS;

  const [name,    setName]    = useState(editData?.name ?? "");
  const [book,    setBook]    = useState(editData?.book ?? "homebrew");
  const [hpplus,  setHpplus]  = useState(initBenefits.hpplus ?? 0);
  const [mpplus,  setMpplus]  = useState(initBenefits.mpplus ?? 0);
  const [ipplus,  setIpplus]  = useState(initBenefits.ipplus ?? 0);
  const [martials, setMartials] = useState({
    armor: initBenefits.martials?.armor ?? false,
    shields: initBenefits.martials?.shields ?? false,
    melee: initBenefits.martials?.melee ?? false,
    ranged: initBenefits.martials?.ranged ?? false,
  });
  const [ritualism, setRitualism] = useState(initBenefits.rituals?.ritualism ?? false);
  const [customBenefits, setCustomBenefits] = useState(initBenefits.custom ?? []);
  const [customBenefitToDelete, setCustomBenefitToDelete] = useState(null);
  const [spellClasses, setSpellClasses] = useState(initBenefits.spellClasses ?? []);
  const BLANK_SKILL = { skillName: "", maxLvl: 1, description: "", specialSkill: "", currentLvl: 0 };
  const initSkills = Array.from({ length: 5 }, (_, i) => editData?.skills?.[i] ?? { ...BLANK_SKILL });
  const [skills, setSkills] = useState(initSkills);
  const [saving,  setSaving]  = useState(false);

  const updateSkillField = (idx, field, value) =>
    setSkills((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

  // Save
  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const classData = {
      name: name.trim(),
      book: book.trim() || "homebrew",
      benefits: {
        hpplus: Number(hpplus) || 0,
        mpplus: Number(mpplus) || 0,
        ipplus: Number(ipplus) || 0,
        isCustomBenefit: customBenefits.length > 0,
        martials,
        rituals: { ritualism },
        custom: customBenefits,
        spellClasses,
      },
      skills,
    };
    if (onItemCreated) {
      onItemCreated(classData);
    } else if (editItemId) {
      await updateItem(packId, editItemId, classData);
    } else {
      await addItem(packId, "class", classData);
    }
    setSaving(false);
    onClose();
  };

  const isEditing = Boolean(editItemId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: customTheme.primary,
          color: "#fff",
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: "0.95rem",
          py: 1.25,
        }}
      >
        {isEditing ? t("Edit Class") : t("New Class")}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>

          {/* Identity */}
          <Grid
            size={{
              xs: 8,
              sm: 9
            }}>
            <TextField label={t("Class Name")} value={name} onChange={(e) => setName(e.target.value)}
              fullWidth size="small" autoFocus slotProps={{
              htmlInput: { maxLength: 50 }
            }} />
          </Grid>
          <Grid
            size={{
              xs: 4,
              sm: 3
            }}>
            <TextField label={t("Book")} value={book} onChange={(e) => setBook(e.target.value)}
              fullWidth size="small" placeholder="homebrew" />
          </Grid>

          {/* Free Benefits */}
          <Grid  size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", mb: 0.5 }}>
              {t("Free Benefits")}
            </Typography>
          </Grid>
          <Grid  size={4}>
            <TextField label={t("HP+")} type="number" value={hpplus}
              onChange={(e) => setHpplus(Number(e.target.value))} fullWidth size="small"
              slotProps={{
                htmlInput: { min: 0, step: 5 }
              }} />
          </Grid>
          <Grid  size={4}>
            <TextField label={t("MP+")} type="number" value={mpplus}
              onChange={(e) => setMpplus(Number(e.target.value))} fullWidth size="small"
              slotProps={{
                htmlInput: { min: 0, step: 5 }
              }} />
          </Grid>
          <Grid  size={4}>
            <TextField label={t("IP+")} type="number" value={ipplus}
              onChange={(e) => setIpplus(Number(e.target.value))} fullWidth size="small"
              slotProps={{
                htmlInput: { min: 0, step: 2 }
              }} />
          </Grid>

          {/* Martials + Ritualism */}
          <Grid  size={12}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {[
                { key: "melee",   label: t("Martial Melee") },
                { key: "ranged",  label: t("Martial Ranged") },
                { key: "shields", label: t("Martial Shields") },
                { key: "armor",   label: t("Martial Armor") },
              ].map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  size="small"
                  clickable
                  color={martials[key] ? "primary" : "default"}
                  variant={martials[key] ? "filled" : "outlined"}
                  onClick={() => setMartials((m) => ({ ...m, [key]: !m[key] }))}
                />
              ))}
              <Chip
                label={t("Ritualism")}
                size="small"
                clickable
                color={ritualism ? "primary" : "default"}
                variant={ritualism ? "filled" : "outlined"}
                onClick={() => setRitualism((v) => !v)}
              />
            </Box>
          </Grid>

          {/* Custom benefits */}
          {customBenefits.map((cb, i) => (
            <Grid  key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }} size={12}>
              <TextField
                label={`${t("Custom Benefit")} ${i + 1}`}
                value={cb}
                onChange={(e) => setCustomBenefits((arr) => arr.map((v, j) => j === i ? e.target.value : v))}
                fullWidth size="small" slotProps={{
                htmlInput: { maxLength: 500 }
              }}
              />
              <IconButton size="small" color="error" onClick={() => setCustomBenefitToDelete(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          ))}
          <Grid  size={12}>
            <Button size="small" variant="outlined" onClick={() => setCustomBenefits((arr) => [...arr, ""])}>
              + {t("Add Custom Benefit")}
            </Button>
          </Grid>

          {/* Spell Types */}
          <Grid  size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", mb: 0.5 }}>
              {t("Spell Types")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {spellClassesList.map((sc) => (
                <Chip
                  key={sc}
                  label={t(sc)}
                  size="small"
                  clickable
                  color={spellClasses.includes(sc) ? "secondary" : "default"}
                  variant={spellClasses.includes(sc) ? "filled" : "outlined"}
                  onClick={() =>
                    setSpellClasses((prev) =>
                      prev.includes(sc) ? prev.filter((s) => s !== sc) : [...prev, sc]
                    )
                  }
                />
              ))}
            </Box>
          </Grid>

          {/* Skills */}
          <Grid  size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              {t("Skills")}
            </Typography>
          </Grid>

          {skills.map((skill, i) => (
            <Grid  key={i} size={12}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1}>
                  <Grid
                    size={{
                      xs: 9,
                      sm: 10
                    }}>
                    <TextField
                      label={`${t("Skill Name")} ${i + 1}`}
                      value={skill.skillName}
                      onChange={(e) => updateSkillField(i, "skillName", e.target.value)}
                      fullWidth size="small"
                      slotProps={{
                        htmlInput: { maxLength: 50 }
                      }}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 3,
                      sm: 2
                    }}>
                    <TextField
                      label={t("Max Lvl")}
                      type="number"
                      value={skill.maxLvl}
                      onChange={(e) => updateSkillField(i, "maxLvl", Math.max(1, Math.min(10, Number(e.target.value))))}
                      fullWidth size="small"
                      slotProps={{
                        htmlInput: { min: 1, max: 10 }
                      }}
                    />
                  </Grid>
                  <Grid  size={12}>
                    <CustomTextarea
                      label={t("Description")}
                      value={skill.description}
                      onChange={(e) => updateSkillField(i, "description", e.target.value)}
                      helperText=""
                      maxLength={1500}
                    />
                  </Grid>
                  <Grid  size={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("Special Skill Effect")}</InputLabel>
                      <Select
                        value={skill.specialSkill ?? ""}
                        onChange={(e) => updateSkillField(i, "specialSkill", e.target.value)}
                        label={t("Special Skill Effect")}
                      >
                        <MenuItem value=""><em>{t("None")}</em></MenuItem>
                        {Object.keys(GROUPED_SPECIAL_SKILLS)
                          .sort((a, b) => t(a).localeCompare(t(b)))
                          .flatMap((cls) => [
                            <ListSubheader key={cls}>{t(cls)}</ListSubheader>,
                            ...GROUPED_SPECIAL_SKILLS[cls].map((s) => (
                              <MenuItem key={s.name} value={s.name}>{t(s.name)}</MenuItem>
                            )),
                          ])}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {isEditing ? t("Save Changes") : t("Add")}
        </Button>
      </DialogActions>
      <DeleteConfirmationDialog
        open={customBenefitToDelete !== null}
        onClose={() => setCustomBenefitToDelete(null)}
        onConfirm={() => {
          if (customBenefitToDelete !== null) {
            setCustomBenefits((arr) => arr.filter((_, j) => j !== customBenefitToDelete));
          }
        }}
        title={t("Delete")}
        message={t("Are you sure you want to delete this custom benefit?")}
        itemPreview={
          customBenefitToDelete !== null ? (
            <Typography variant="h4">
              {customBenefits[customBenefitToDelete] || t("Custom Benefit")}
            </Typography>
          ) : null
        }
      />
    </Dialog>
  );
}

// Inline skill editor sub-component
// Main dispatcher

/**
 * Renders the appropriate creation form for the given CompendiumItemType.
 * For weapon/armor/shield, delegates to the existing player equipment modals.
 * For npc-attack, npc-spell, player-spell, renders a lightweight inline dialog.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.itemType   -  VIEWER_TO_PACK_TYPE value, e.g. "weapon"
 * @param {string} props.packId    -  the target pack's id
 * @param {object} [props.editData]    -  existing item data (for editing)
 * @param {string} [props.editItemId]  -  existing item id in the pack (for editing)
 */
const OPTIONAL_SUBTYPES = [
  { value: "quirk",        label: "Quirk"        },
  { value: "camp-activities", label: "Camp Activities" },
  { value: "zero-trigger", label: "Zero Trigger" },
  { value: "zero-effect",  label: "Zero Effect"  },
  { value: "zero-power",   label: "Zero Power"   },
  { value: "other",        label: "Other"        },
];

function OptionalForm({ packId, onClose, editData, editItemId }) {
  const { t } = useTranslate();
  const { addItem, updateItem, packs } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [subtype,       setSubtype]       = useState(editData?.subtype ?? "quirk");
  const [name,          setName]          = useState(editData?.name ?? "");
  const [description,   setDescription]   = useState(editData?.description ?? "");
  const [effect,        setEffect]        = useState(editData?.effect ?? "");
  const [targetDescription, setTargetDescription] = useState(editData?.targetDescription ?? "");
  const [clockSections, setClockSections] = useState(editData?.clock?.sections ?? 6);
  const [showClock,     setShowClock]     = useState(Boolean(editData?.clock));
  const [zeroTrigger,   setZeroTrigger]   = useState(null);
  const [zeroEffect,    setZeroEffect]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const isEditing = Boolean(editItemId);

  const allOptionals = packs.flatMap((p) =>
    (p.active !== false ? p.items : []).filter((i) => i.type === "optional").map((i) => i.data)
  );
  const zeroTriggerOptions = allOptionals.filter((i) => i.subtype === "zero-trigger");
  const zeroEffectOptions  = allOptionals.filter((i) => i.subtype === "zero-effect");
  const campTargetOptions = [
    t("Yourself"),
    t("One ally"),
    t("Yourself or one ally"),
  ];

  useEffect(() => {
    setSubtype(editData?.subtype ?? "quirk");
    setName(editData?.name ?? "");
    setDescription(editData?.description ?? "");
    setEffect(editData?.effect ?? "");
    setTargetDescription(editData?.targetDescription ?? "");
    setClockSections(editData?.clock?.sections ?? 6);
    setShowClock(Boolean(editData?.clock));

    const triggerMatch = zeroTriggerOptions.find((o) => o.name === (editData?.zeroTrigger ?? ""));
    const effectMatch = zeroEffectOptions.find((o) => o.name === (editData?.zeroEffect ?? ""));
    setZeroTrigger(triggerMatch ?? null);
    setZeroEffect(effectMatch ?? null);
  }, [editData, packs]);

  const buildData = () => {
    if (subtype === "quirk") return { subtype, name: name.trim(), description: description.trim(), effect: effect.trim() };
    if (subtype === "camp-activities") return { subtype, name: name.trim(), targetDescription: targetDescription.trim(), effect: effect.trim() };
    if (subtype === "zero-trigger" || subtype === "zero-effect") return { subtype, name: name.trim(), description: description.trim() };
    if (subtype === "zero-power") return { subtype, name: name.trim(), zeroTrigger: zeroTrigger?.name ?? "", zeroEffect: zeroEffect?.name ?? "", clock: { sections: Number(clockSections) } };
    return { subtype, name: name.trim(), description: description.trim(), effect: effect.trim(), ...(showClock ? { clock: { sections: Number(clockSections) } } : {}) };
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = buildData();
    if (isEditing) await updateItem(packId, editItemId, payload);
    else await addItem(packId, "optional", payload);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <DialogTitle sx={{ background: customTheme.primary, color: "#fff", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.95rem", py: 1.25 }}>
        {t("New Optional Item")}
        <IconButton size="small" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, color: "rgba(255,255,255,0.8)" }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus slotProps={{
              htmlInput: { maxLength: 80 }
            }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Subtype")}</InputLabel>
              <Select value={subtype} label={t("Subtype")} onChange={(e) => setSubtype(e.target.value)}>
                {OPTIONAL_SUBTYPES.map((s) => <MenuItem key={s.value} value={s.value}>{t(s.label)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {(subtype === "quirk" || subtype === "other") && <>
            <Grid  size={12}>
              <CustomTextarea label={t("Description")} value={description} onChange={(e) => setDescription(e.target.value)} helperText="" />
            </Grid>
            <Grid  size={12}>
              <CustomTextarea label={t("Effect")} value={effect} onChange={(e) => setEffect(e.target.value)} helperText="" />
            </Grid>
          </>}

          {subtype === "camp-activities" && <>
            <Grid  size={12}>
              <Autocomplete
                freeSolo
                options={campTargetOptions}
                value={targetDescription}
                onInputChange={(_, value) => setTargetDescription(value)}
                onChange={(_, value) => setTargetDescription(typeof value === "string" ? value : "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Target")}
                    size="small"
                    helperText={t("Suggested: Yourself, One ally, Yourself or one ally")}
                  />
                )}
                size="small"
              />
            </Grid>
            <Grid  size={12}>
              <CustomTextarea label={t("Effect")} value={effect} onChange={(e) => setEffect(e.target.value)} helperText="" />
            </Grid>
          </>}

          {(subtype === "zero-trigger" || subtype === "zero-effect") && (
            <Grid  size={12}>
              <CustomTextarea label={t("Description")} value={description} onChange={(e) => setDescription(e.target.value)} helperText="" />
            </Grid>
          )}

          {subtype === "zero-power" && <>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <TextField label={t("Clock Sections")} value={clockSections} onChange={(e) => setClockSections(e.target.value)} fullWidth size="small" type="number" slotProps={{
                htmlInput: { min: 2, max: 12 }
              }} />
            </Grid>
            <Grid  size={12}>
              <Autocomplete
                options={zeroTriggerOptions}
                getOptionLabel={(o) => o.name ?? ""}
                value={zeroTrigger}
                onChange={(_, v) => setZeroTrigger(v)}
                renderInput={(params) => <TextField {...params} label={t("Zero Trigger")} size="small" helperText={zeroTriggerOptions.length === 0 ? t("No zero-trigger items in active packs") : ""} />}
                size="small"
                isOptionEqualToValue={(a, b) => a.name === b.name}
              />
            </Grid>
            <Grid  size={12}>
              <Autocomplete
                options={zeroEffectOptions}
                getOptionLabel={(o) => o.name ?? ""}
                value={zeroEffect}
                onChange={(_, v) => setZeroEffect(v)}
                renderInput={(params) => <TextField {...params} label={t("Zero Effect")} size="small" helperText={zeroEffectOptions.length === 0 ? t("No zero-effect items in active packs") : ""} />}
                size="small"
                isOptionEqualToValue={(a, b) => a.name === b.name}
              />
            </Grid>
          </>}

          {subtype === "other" && (
            <>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Clock")}</InputLabel>
                  <Select value={showClock ? "yes" : "no"} label={t("Clock")} onChange={(e) => setShowClock(e.target.value === "yes")}>
                    <MenuItem value="no">{t("No Clock")}</MenuItem>
                    <MenuItem value="yes">{t("With Clock")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {showClock && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <TextField label={t("Clock Sections")} value={clockSections} onChange={(e) => setClockSections(e.target.value)} fullWidth size="small" type="number" slotProps={{
                    htmlInput: { min: 2, max: 12 }
                  }} />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name.trim() || saving}>{t(isEditing ? "Save" : "Add")}</Button>
      </DialogActions>
    </>
  );
}

export default function CompendiumItemCreateDialog({ open, onClose, itemType, packId, editData, editItemId }) {
  const { addItem, updateItem } = useCompendiumPacks();

  if (itemType === "weapon") {
    return (
      <PlayerWeaponModal
        open={open}
        onClose={onClose}
        editWeaponIndex={null}
        weapon={editData ?? null}
        onAddWeapon={async (data) => {
          if (editItemId) await updateItem(packId, editItemId, data);
          else await addItem(packId, "weapon", data);
          onClose();
        }}
        onDeleteWeapon={() => {}}
      />
    );
  }

  if (itemType === "armor") {
    return (
      <PlayerArmorModal
        open={open}
        onClose={onClose}
        editArmorIndex={null}
        armorPlayer={editData ?? null}
        onAddArmor={async (data) => {
          if (editItemId) await updateItem(packId, editItemId, data);
          else await addItem(packId, "armor", data);
          onClose();
        }}
        onDeleteArmor={() => {}}
      />
    );
  }

  if (itemType === "shield") {
    return (
      <PlayerShieldModal
        open={open}
        onClose={onClose}
        editShieldIndex={null}
        shield={editData ?? null}
        onAddShield={async (data) => {
          if (editItemId) await updateItem(packId, editItemId, data);
          else await addItem(packId, "shield", data);
          onClose();
        }}
        onDeleteShield={() => {}}
      />
    );
  }

  if (itemType === "custom-weapon") {
    return (
      <PlayerCustomWeaponModal
        open={open}
        onClose={onClose}
        editCustomWeaponIndex={null}
        customWeapon={editData ?? null}
        onAddCustomWeapon={async (data) => {
          if (editItemId) await updateItem(packId, editItemId, data);
          else await addItem(packId, "custom-weapon", data);
          onClose();
        }}
        onDeleteCustomWeapon={() => {}}
      />
    );
  }

  if (itemType === "accessory") {
    return (
      <PlayerAccessoryModal
        open={open}
        onClose={onClose}
        editAccIndex={null}
        accessory={editData ?? null}
        onAddAccessory={async (data) => {
          if (editItemId) await updateItem(packId, editItemId, data);
          else await addItem(packId, "accessory", data);
          onClose();
        }}
        onDeleteAccessory={() => {}}
      />
    );
  }

  // Class has its own full Dialog internally : only render when open to avoid state leaking
  if (itemType === "class") {
    if (!open) return null;
    return <ClassForm open={open} packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />;
  }

  // Remaining types use a simple Dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {itemType === "npc-attack" && <NpcAttackForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "npc-spell"  && <NpcSpellForm  packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "player-spell" && <PlayerSpellForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "npc-special" && <NpcSpecialForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "npc-action" && <NpcActionForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "quality" && <QualityForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "heroic" && <HeroicForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
      {itemType === "optional" && <OptionalForm packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />}
    </Dialog>
  );
}
