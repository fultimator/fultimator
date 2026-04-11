import React, { useState } from "react";
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

// ── NPC Attack form ──────────────────────────────────────────────────────────

function NpcAttackForm({ packId, onClose }) {
  const { t } = useTranslate();
  const { addItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name,    setName]    = useState("");
  const [range,   setRange]   = useState("melee");
  const [attr1,   setAttr1]   = useState("dexterity");
  const [attr2,   setAttr2]   = useState("dexterity");
  const [dmgType, setDmgType] = useState("physical");
  const [special, setSpecial] = useState("");
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addItem(packId, "npc-attack", {
      itemType: "basic",
      name: name.trim(),
      range,
      attr1,
      attr2,
      type: dmgType,
      special: special.trim() ? [special.trim()] : [],
    });
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
          <Grid item xs={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Range")}</InputLabel>
              <Select value={range} label={t("Range")} onChange={(e) => setRange(e.target.value)}>
                <MenuItem value="melee">{t("Melee")}</MenuItem>
                <MenuItem value="distance">{t("Distance")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 1")}</InputLabel>
              <Select value={attr1} label={t("Attr 1")} onChange={(e) => setAttr1(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 2")}</InputLabel>
              <Select value={attr2} label={t("Attr 2")} onChange={(e) => setAttr2(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12}>
            <TextField
              label={t("Special")}
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder={t("Optional special effect description")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t("Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// ── NPC Spell form ───────────────────────────────────────────────────────────

function NpcSpellForm({ packId, onClose }) {
  const { t } = useTranslate();
  const { addItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name,       setName]       = useState("");
  const [isOffensive, setIsOffensive] = useState(false);
  const [mp,         setMp]         = useState("");
  const [maxTargets, setMaxTargets] = useState("");
  const [duration,   setDuration]   = useState("");
  const [target,     setTarget]     = useState("");
  const [range,      setRange]      = useState("melee");
  const [attr1,      setAttr1]      = useState("dexterity");
  const [attr2,      setAttr2]      = useState("dexterity");
  const [dmgType,    setDmgType]    = useState("physical");
  const [special,    setSpecial]    = useState("");
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addItem(packId, "npc-spell", {
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
    });
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
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10} sm={11}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={2} sm={1}>
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
          <Grid item xs={6} sm={3}>
            <TextField
              label={t("MP x Target")}
              value={mp}
              onChange={(e) => setMp(e.target.value)}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label={t("Max Targets")}
              value={maxTargets}
              onChange={(e) => setMaxTargets(e.target.value)}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Range")}</InputLabel>
              <Select value={range} label={t("Range")} onChange={(e) => setRange(e.target.value)}>
                <MenuItem value="melee">{t("Melee")}</MenuItem>
                <MenuItem value="distance">{t("Distance")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {isOffensive && (
            <Grid item xs={12} sm={6}>
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
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 1")}</InputLabel>
              <Select value={attr1} label={t("Attr 1")} onChange={(e) => setAttr1(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 2")}</InputLabel>
              <Select value={attr2} label={t("Attr 2")} onChange={(e) => setAttr2(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("Special")}
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder={t("Spell effect description")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t("Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// ── Player Spell form ────────────────────────────────────────────────────────

const spellClasses = classList
  .filter((c) => c.benefits?.spellClasses?.length > 0)
  .map((c) => c.name);

function PlayerSpellForm({ packId, onClose }) {
  const { t } = useTranslate();
  const { addItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [spellClass,  setSpellClass]  = useState(spellClasses[0] ?? "");
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [isOffensive, setIsOffensive] = useState(false);
  const [mp,          setMp]          = useState("");
  const [maxTargets,  setMaxTargets]  = useState("1");
  const [targetDesc,  setTargetDesc]  = useState("");
  const [duration,    setDuration]    = useState("");
  const [attr1,       setAttr1]       = useState("insight");
  const [attr2,       setAttr2]       = useState("will");
  const [saving,      setSaving]      = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addItem(packId, "player-spell", {
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
    });
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
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
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
          <Grid item xs={10} sm={6}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid item xs={2} sm={1}>
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
          <Grid item xs={6} sm={3}>
            <TextField
              label={t("MP")}
              value={mp}
              onChange={(e) => setMp(e.target.value)}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label={t("Max Targets")}
              value={maxTargets}
              onChange={(e) => setMaxTargets(e.target.value)}
              fullWidth
              size="small"
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 1")}</InputLabel>
              <Select value={attr1} label={t("Attr 1")} onChange={(e) => setAttr1(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 2")}</InputLabel>
              <Select value={attr2} label={t("Attr 2")} onChange={(e) => setAttr2(e.target.value)}>
                {ATTRS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("Description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t("Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// ── Quality form ─────────────────────────────────────────────────────────────

const QUALITY_CATEGORIES = ["Offensive", "Defensive", "Enhancement"];
const FILTER_OPTIONS = [
  { label: "Weapons", value: "weapon" },
  { label: "Custom Weapons", value: "customWeapon" },
  { label: "Armor", value: "armor" },
  { label: "Shields", value: "shield" },
  { label: "Accessories", value: "accessory" },
];

function QualityForm({ packId, onClose }) {
  const { t } = useTranslate();
  const { addItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(QUALITY_CATEGORIES[0]);
  const [quality, setQuality] = useState("");
  const [cost, setCost] = useState(0);
  const [filter, setFilter] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addItem(packId, "quality", {
      name: name.trim(),
      category,
      quality: quality.trim(),
      cost: Number(cost),
      filter,
    });
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
          <Grid item xs={12} sm={6}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12}>
            <TextField
              label={t("Quality Effect")}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={t("Cost")}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              fullWidth
              size="small"
              type="number"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          {t("Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// ── Heroic form ──────────────────────────────────────────────────────────────

const CLASS_NAME_OPTIONS = classList.map((c) => c.name);
const HEROIC_BOOK_OPTIONS = ["core", "rework", "bonus", "high", "techno", "natural"];

function HeroicForm({ packId, onClose }) {
  const { t } = useTranslate();
  const { addItem } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [name, setName] = useState("");
  const [book, setBook] = useState("");
  const [quote, setQuote] = useState("");
  const [description, setDescription] = useState("");
  const [applicableTo, setApplicableTo] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addItem(packId, "heroic", {
      name: name.trim(),
      book,
      quote: quote.trim(),
      description: description.trim(),
      applicableTo,
    });
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
          <Grid item xs={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              inputProps={{ maxLength: 50 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={CLASS_NAME_OPTIONS}
              value={applicableTo}
              onChange={(_, newValue) => setApplicableTo(newValue)}
              freeSolo
              renderTags={(value, getTagProps) =>
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
          <Grid item xs={12}>
            <TextField
              label={t("Quote")}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              fullWidth
              size="small"
              inputProps={{ maxLength: 200 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("Description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={4}
              inputProps={{ maxLength: 1500 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim() || saving}>
          {t("Add")}
        </Button>
      </DialogActions>
    </>
  );
}

// ── Class form ───────────────────────────────────────────────────────────────

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
  const [spellClasses, setSpellClasses] = useState(initBenefits.spellClasses ?? []);
  const BLANK_SKILL = { skillName: "", maxLvl: 1, description: "", specialSkill: "", currentLvl: 0 };
  const initSkills = Array.from({ length: 5 }, (_, i) => editData?.skills?.[i] ?? { ...BLANK_SKILL });
  const [skills, setSkills] = useState(initSkills);
  const [saving,  setSaving]  = useState(false);

  const updateSkillField = (idx, field, value) =>
    setSkills((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

  // ── Save ──────────────────────────────────────────────────────────────────
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

          {/* ── Identity ─────────────────────────────────────────────────── */}
          <Grid item xs={8} sm={9}>
            <TextField label={t("Class Name")} value={name} onChange={(e) => setName(e.target.value)}
              fullWidth size="small" autoFocus inputProps={{ maxLength: 50 }} />
          </Grid>
          <Grid item xs={4} sm={3}>
            <TextField label={t("Book")} value={book} onChange={(e) => setBook(e.target.value)}
              fullWidth size="small" placeholder="homebrew" />
          </Grid>

          {/* ── Free Benefits ────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", mb: 0.5 }}>
              {t("Free Benefits")}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField label={t("HP+")} type="number" value={hpplus}
              onChange={(e) => setHpplus(Number(e.target.value))} fullWidth size="small"
              inputProps={{ min: 0, step: 5 }} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={t("MP+")} type="number" value={mpplus}
              onChange={(e) => setMpplus(Number(e.target.value))} fullWidth size="small"
              inputProps={{ min: 0, step: 5 }} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={t("IP+")} type="number" value={ipplus}
              onChange={(e) => setIpplus(Number(e.target.value))} fullWidth size="small"
              inputProps={{ min: 0, step: 2 }} />
          </Grid>

          {/* Martials + Ritualism */}
          <Grid item xs={12}>
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
            <Grid item xs={12} key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                label={`${t("Custom Benefit")} ${i + 1}`}
                value={cb}
                onChange={(e) => setCustomBenefits((arr) => arr.map((v, j) => j === i ? e.target.value : v))}
                fullWidth size="small" inputProps={{ maxLength: 500 }}
              />
              <IconButton size="small" color="error" onClick={() => setCustomBenefits((arr) => arr.filter((_, j) => j !== i))}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button size="small" variant="outlined" onClick={() => setCustomBenefits((arr) => [...arr, ""])}>
              + {t("Add Custom Benefit")}
            </Button>
          </Grid>

          {/* ── Spell Types ──────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", mb: 0.5 }}>
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

          {/* ── Skills ───────────────────────────────────────────────────── */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              {t("Skills")}
            </Typography>
          </Grid>

          {skills.map((skill, i) => (
            <Grid item xs={12} key={i}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                <Grid container spacing={1}>
                  <Grid item xs={9} sm={10}>
                    <TextField
                      label={`${t("Skill Name")} ${i + 1}`}
                      value={skill.skillName}
                      onChange={(e) => updateSkillField(i, "skillName", e.target.value)}
                      fullWidth size="small"
                      inputProps={{ maxLength: 50 }}
                    />
                  </Grid>
                  <Grid item xs={3} sm={2}>
                    <TextField
                      label={t("Max Lvl")}
                      type="number"
                      value={skill.maxLvl}
                      onChange={(e) => updateSkillField(i, "maxLvl", Math.max(1, Math.min(10, Number(e.target.value))))}
                      fullWidth size="small"
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={t("Description")}
                      value={skill.description}
                      onChange={(e) => updateSkillField(i, "description", e.target.value)}
                      fullWidth size="small" multiline rows={3}
                      inputProps={{ maxLength: 1500 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
    </Dialog>
  );
}

// Inline skill editor sub-component
// ── Main dispatcher ──────────────────────────────────────────────────────────

/**
 * Renders the appropriate creation form for the given CompendiumItemType.
 * For weapon/armor/shield, delegates to the existing player equipment modals.
 * For npc-attack, npc-spell, player-spell, renders a lightweight inline dialog.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.itemType  — VIEWER_TO_PACK_TYPE value, e.g. "weapon"
 * @param {string} props.packId   — the target pack's id
 * @param {object} [props.editData]   — existing item data (for editing)
 * @param {string} [props.editItemId] — existing item id in the pack (for editing)
 */
const OPTIONAL_SUBTYPES = [
  { value: "quirk",        label: "Quirk"        },
  { value: "camp-activities", label: "Camp Activities" },
  { value: "zero-trigger", label: "Zero Trigger" },
  { value: "zero-effect",  label: "Zero Effect"  },
  { value: "zero-power",   label: "Zero Power"   },
  { value: "other",        label: "Other"        },
];

function OptionalForm({ packId, onClose }) {
  const { t } = useTranslate();
  const { addItem, packs } = useCompendiumPacks();
  const customTheme = useCustomTheme();

  const [subtype,       setSubtype]       = useState("quirk");
  const [name,          setName]          = useState("");
  const [description,   setDescription]   = useState("");
  const [effect,        setEffect]        = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [clockSections, setClockSections] = useState(6);
  const [showClock,     setShowClock]     = useState(false);
  const [zeroTrigger,   setZeroTrigger]   = useState(null);
  const [zeroEffect,    setZeroEffect]    = useState(null);
  const [saving,        setSaving]        = useState(false);

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
    await addItem(packId, "optional", buildData());
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
          <Grid item xs={12} sm={6}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus inputProps={{ maxLength: 80 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Subtype")}</InputLabel>
              <Select value={subtype} label={t("Subtype")} onChange={(e) => setSubtype(e.target.value)}>
                {OPTIONAL_SUBTYPES.map((s) => <MenuItem key={s.value} value={s.value}>{t(s.label)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {(subtype === "quirk" || subtype === "other") && <>
            <Grid item xs={12}>
              <TextField label={t("Description")} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth size="small" multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t("Effect")} value={effect} onChange={(e) => setEffect(e.target.value)} fullWidth size="small" multiline rows={3} />
            </Grid>
          </>}

          {subtype === "camp-activities" && <>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <TextField label={t("Effect")} value={effect} onChange={(e) => setEffect(e.target.value)} fullWidth size="small" multiline rows={3} />
            </Grid>
          </>}

          {(subtype === "zero-trigger" || subtype === "zero-effect") && (
            <Grid item xs={12}>
              <TextField label={t("Description")} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth size="small" multiline rows={4} />
            </Grid>
          )}

          {subtype === "zero-power" && <>
            <Grid item xs={12} sm={6}>
              <TextField label={t("Clock Sections")} value={clockSections} onChange={(e) => setClockSections(e.target.value)} fullWidth size="small" type="number" inputProps={{ min: 2, max: 12 }} />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Clock")}</InputLabel>
                  <Select value={showClock ? "yes" : "no"} label={t("Clock")} onChange={(e) => setShowClock(e.target.value === "yes")}>
                    <MenuItem value="no">{t("No Clock")}</MenuItem>
                    <MenuItem value="yes">{t("With Clock")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {showClock && (
                <Grid item xs={12} sm={6}>
                  <TextField label={t("Clock Sections")} value={clockSections} onChange={(e) => setClockSections(e.target.value)} fullWidth size="small" type="number" inputProps={{ min: 2, max: 12 }} />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={handleSave} variant="contained" disabled={!name.trim() || saving}>{t("Save")}</Button>
      </DialogActions>
    </>
  );
}

export default function CompendiumItemCreateDialog({ open, onClose, itemType, packId, editData, editItemId }) {
  const { addItem } = useCompendiumPacks();

  if (itemType === "weapon") {
    return (
      <PlayerWeaponModal
        open={open}
        onClose={onClose}
        editWeaponIndex={null}
        weapon={null}
        onAddWeapon={async (data) => { await addItem(packId, "weapon", data); onClose(); }}
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
        armorPlayer={null}
        onAddArmor={async (data) => { await addItem(packId, "armor", data); onClose(); }}
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
        shield={null}
        onAddShield={async (data) => { await addItem(packId, "shield", data); onClose(); }}
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
        customWeapon={null}
        onAddCustomWeapon={async (data) => { await addItem(packId, "custom-weapon", data); onClose(); }}
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
        accessory={null}
        onAddAccessory={async (data) => { await addItem(packId, "accessory", data); onClose(); }}
        onDeleteAccessory={() => {}}
      />
    );
  }

  // Class has its own full Dialog internally — only render when open to avoid state leaking
  if (itemType === "class") {
    if (!open) return null;
    return <ClassForm open={open} packId={packId} onClose={onClose} editData={editData} editItemId={editItemId} />;
  }

  // Remaining types use a simple Dialog
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {itemType === "npc-attack" && <NpcAttackForm packId={packId} onClose={onClose} />}
      {itemType === "npc-spell"  && <NpcSpellForm  packId={packId} onClose={onClose} />}
      {itemType === "player-spell" && <PlayerSpellForm packId={packId} onClose={onClose} />}
      {itemType === "quality" && <QualityForm packId={packId} onClose={onClose} />}
      {itemType === "heroic" && <HeroicForm packId={packId} onClose={onClose} />}
      {itemType === "optional" && <OptionalForm packId={packId} onClose={onClose} />}
    </Dialog>
  );
}
