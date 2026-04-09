import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  Autocomplete,
  Chip,
  OutlinedInput,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Menu,
  ListSubheader,
} from "@mui/material";
import { Close, AutoFixHigh, Delete as DeleteIcon } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import IosShareIcon from "@mui/icons-material/IosShare";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { OffensiveSpellIcon } from "../icons";
import AddToCompendiumButton from "./AddToCompendiumButton";
import { useTranslate } from "../../translation/translate";
import { useCustomTheme } from "../../hooks/useCustomTheme";
import { useEquipmentForm } from "../player/common/hooks/useEquipmentForm";
import types from "../../libs/types";
import classList from "../../libs/classes";
import spellClassesList from "../../libs/spellClasses";
import specialSkillsList from "../../libs/skills";
import weapons from "../../libs/weapons";
import weaponCategories from "../../libs/weaponCategories";
import armor from "../../libs/armor";
import shields from "../../libs/shields";
import weaponQualities from "../../routes/equip/weapons/qualities";
import armorShieldQualities from "../../routes/equip/ArmorShield/qualities";
import { WeaponCard, ArmorCard, SpellCard, PlayerSpellCard, AttackCard, QualityCard, HeroicCard, ClassCard, NonStaticSpellCard, CustomWeaponCard, AccessoryCard } from "./ItemCards";
import useDownloadImage from "../../hooks/useDownloadImage";
import QualitiesGenerator from "../../routes/equip/Qualities/QualitiesGenerator";
import qualities from "../../libs/qualities";
import CustomTextarea from "../common/CustomTextarea";
import { availableFrames } from "../../libs/pilotVehicleData";

// ── Change* sub-components (reuse from equip routes) ─────────────────────────
import ChangeWeaponBase from "../../routes/equip/weapons/ChangeBase";
import ChangeArmorBase from "../player/equipment/armor/ChangeBase";
import ChangeShieldBase from "../player/equipment/shields/ChangeBase";
import ChangeMartial from "../../routes/equip/common/ChangeMartial";
import ChangeName from "../../routes/equip/common/ChangeName";
import ChangeType from "../../routes/equip/weapons/ChangeType";
import ChangeHands from "../../routes/equip/weapons/ChangeHands";
import ChangeAttr from "../../routes/equip/weapons/ChangeAttr";
import SelectWeaponQuality from "../../routes/equip/weapons/SelectQuality";
import SelectArmorQuality from "../../routes/equip/ArmorShield/SelectQuality";
import ChangeQuality from "../../routes/equip/common/ChangeQuality";
import ChangeBonus from "../../routes/equip/weapons/ChangeBonus";
import ApplyRework from "../../routes/equip/common/ApplyRework";
import ChangeCategory from "../player/equipment/weapons/ChangeCategory";
import ChangeModifiers from "../player/equipment/ChangeModifiers";

// ── Custom weapon / accessory sub-components ──────────────────────────────────
import ChangeCWCategory from "../../routes/equip/customWeapons/ChangeCategory";
import ChangeRange from "../../routes/equip/customWeapons/ChangeRange";
import ChangeAccuracyCheck from "../../routes/equip/customWeapons/ChangeAccuracyCheck";
import ChangeCWType from "../../routes/equip/customWeapons/ChangeType";
import ChangeCustomizations from "../../routes/equip/customWeapons/ChangeCustomizations";
import SelectAccessoryQuality from "../../routes/equip/Accessories/SelectQuality";
import accessoryQualities from "../../routes/equip/Accessories/qualities";
import { categories as cwCategories, range as cwRange, accuracyChecks as cwAccuracyChecks, types as cwTypes } from "../../routes/equip/customWeapons/libs.jsx";

// ── Shared constants ──────────────────────────────────────────────────────────

const ATTRS = [
  { value: "dexterity", label: "DEX" },
  { value: "insight",   label: "INS" },
  { value: "might",     label: "MIG" },
  { value: "will",      label: "WLP" },
];

const DURATION_OPTIONS = ["Scene", "Instantaneous", "Special"];
const TARGET_OPTIONS = [
  "Self", "One creature", "Up to two creatures", "Up to three creatures",
  "Up to four creatures", "Up to five creatures", "One equipped weapon", "Special",
];

const QUALITY_CATEGORIES = ["Offensive", "Defensive", "Enhancement"];
const FILTER_OPTIONS = [
  { label: "Weapons",        value: "weapon" },
  { label: "Custom Weapons", value: "customWeapon" },
  { label: "Armor",          value: "armor" },
  { label: "Shields",        value: "shield" },
  { label: "Accessories",    value: "accessory" },
];

const HEROIC_BOOK_OPTIONS = ["core", "rework", "bonus", "high", "techno", "natural"];

const GROUPED_SPECIAL_SKILLS = specialSkillsList.reduce((acc, skill) => {
  if (!acc[skill.class]) acc[skill.class] = [];
  acc[skill.class].push(skill);
  return acc;
}, {});
const CLASS_BOOK_SUGGESTIONS = ["core", "rework", "bonus", "high", "techno", "natural", "homebrew"];
const CLASS_NAME_OPTIONS  = classList.map((c) => c.name);

// Only classes that use standard spells (spellType: "default")
const STANDARD_SPELL_CLASSES = ["Chimerist", "Tinkerer", "Elementalist", "Entropist", "Spiritist"];
const spellClasses = STANDARD_SPELL_CLASSES;

// ── Shared panel layout ───────────────────────────────────────────────────────

function PanelLayout({ formContent, previewContent, data, itemName, addButton }) {
  const { t } = useTranslate();
  const previewRef = useRef(null);
  const [downloadImage] = useDownloadImage(itemName || "item", previewRef);
  const [exportAnchor, setExportAnchor] = useState(null);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(itemName || "item").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportAnchor(null);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setExportAnchor(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {formContent}
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box ref={previewRef}>
              {previewContent}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5 }}>
              <Tooltip title={t("Download as Image")}>
                <IconButton size="small" onClick={downloadImage}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Export")}>
                <IconButton size="small" onClick={(e) => setExportAnchor(e.currentTarget)}>
                  <IosShareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
                <MenuItem onClick={handleExportJSON}>{t("Export as JSON file")}</MenuItem>
                <MenuItem onClick={handleCopyJSON}>{t("Copy JSON to Clipboard")}</MenuItem>
              </Menu>
              {addButton}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// ── NPC Attack panel ──────────────────────────────────────────────────────────

function NpcAttackPanel() {
  const { t } = useTranslate();
  const [name,    setName]    = useState("");
  const [range,   setRange]   = useState("melee");
  const [attr1,   setAttr1]   = useState("dexterity");
  const [attr2,   setAttr2]   = useState("dexterity");
  const [dmgType, setDmgType] = useState("physical");
  const [special, setSpecial] = useState("");
  const [flathit, setFlathit] = useState(0);
  const [flatdmg, setFlatdmg] = useState(0);

  const data = {
    itemType: "basic",
    name: name.trim(),
    range, attr1, attr2,
    type: dmgType,
    flathit: Number(flathit),
    flatdmg: Number(flatdmg),
    martial: false,
    category: range === "melee" ? "Melee Attack" : "Ranged Attack",
    special: special.trim() ? [special.trim()] : [],
  };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus />
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
                {Object.keys(types).map((type) => <MenuItem key={type} value={type}>{types[type].long}</MenuItem>)}
                <MenuItem value="nodmg">{t("No Damage")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField label={t("Accuracy Bonus")} value={flathit} onChange={(e) => setFlathit(e.target.value)}
              fullWidth size="small" type="number" inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={6}>
            <TextField label={t("Damage Bonus")} value={flatdmg} onChange={(e) => setFlatdmg(e.target.value)}
              fullWidth size="small" type="number" inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label={t("Special")} value={special} onChange={(e) => setSpecial(e.target.value)}
              fullWidth size="small" multiline rows={2} placeholder={t("Optional special effect description")} />
          </Grid>
        </Grid>
      }
      previewContent={<AttackCard attack={data} />}
      addButton={<AddToCompendiumButton itemType="npc-attack" data={data} />}
    />
  );
}

// ── NPC Spell panel ───────────────────────────────────────────────────────────

function NpcSpellPanel() {
  const { t } = useTranslate();
  const [name,        setName]        = useState("");
  const [isOffensive, setIsOffensive] = useState(false);
  const [mp,          setMp]          = useState("");
  const [maxTargets,  setMaxTargets]  = useState("");
  const [duration,    setDuration]    = useState("");
  const [target,      setTarget]      = useState("");
  const [range,       setRange]       = useState("melee");
  const [attr1,       setAttr1]       = useState("dexterity");
  const [attr2,       setAttr2]       = useState("dexterity");
  const [dmgType,     setDmgType]     = useState("physical");
  const [special,     setSpecial]     = useState("");

  const data = {
    itemType: "spell",
    name: name.trim(),
    type: isOffensive ? "offensive" : "",
    damagetype: dmgType,
    mp:         mp         === "" ? undefined : Number(mp),
    maxTargets: maxTargets === "" ? undefined : Number(maxTargets),
    duration:   duration   || undefined,
    target:     target     || undefined,
    range, attr1, attr2,
    special: special.trim() ? [special.trim()] : [],
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10} sm={11}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)}
              fullWidth size="small" autoFocus inputProps={{ maxLength: 50 }} />
          </Grid>
          <Grid item xs={2} sm={1}>
            <ToggleButton value="offensive" selected={isOffensive} onChange={() => setIsOffensive((v) => !v)}
              size="small" sx={{ width: "100%" }}>
              <OffensiveSpellIcon />
            </ToggleButton>
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label={t("MP x Target")} value={mp} onChange={(e) => setMp(e.target.value)}
              fullWidth size="small" type="number" inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label={t("Max Targets")} value={maxTargets} onChange={(e) => setMaxTargets(e.target.value)}
              fullWidth size="small" type="number" inputProps={{ min: 0 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete freeSolo options={DURATION_OPTIONS.map(t)} inputValue={duration}
              onInputChange={(_, v) => setDuration(v)}
              renderInput={(params) => <TextField {...params} label={t("Duration")} size="small" />} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete freeSolo options={TARGET_OPTIONS.map(t)} inputValue={target}
              onInputChange={(_, v) => setTarget(v)}
              renderInput={(params) => <TextField {...params} label={t("Target")} size="small" />} />
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
                  {Object.keys(types).map((type) => <MenuItem key={type} value={type}>{types[type].long}</MenuItem>)}
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
            <TextField label={t("Special")} value={special} onChange={(e) => setSpecial(e.target.value)}
              fullWidth size="small" multiline rows={3} placeholder={t("Spell effect description")} />
          </Grid>
        </Grid>
      }
      previewContent={<SpellCard spell={{ ...data, effect: data.special?.join("; ") ?? "" }} />}
      addButton={<AddToCompendiumButton itemType="npc-spell" data={data} />}
      data={data}
      itemName={data.name}
    />
  );
}

// ── Player Spell panel ────────────────────────────────────────────────────────

const NON_STATIC_TYPES = [
  { value: "default",          label: "Standard Spell" },
  { value: "gift",             label: "Gift" },
  { value: "dance",            label: "Dance" },
  { value: "therioform",       label: "Therioform" },
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

function PlayerSpellPanel() {
  const { t } = useTranslate();
  const [spellType,   setSpellType]   = useState("default");
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
  // Non-static type fields
  const [effect,      setEffect]      = useState("");
  const [event,       setEvent]       = useState("");
  const [genoclepsis, setGenoclepsis] = useState("");
  const [wellspring,  setWellspring]  = useState("");
  const [invType,     setInvType]     = useState("");
  // arcanist / arcanist-rework
  const [domain,      setDomain]      = useState("");
  const [domainDesc,  setDomainDesc]  = useState("");
  const [merge,       setMerge]       = useState("");
  const [mergeDesc,   setMergeDesc]   = useState("");
  const [dismiss,     setDismiss]     = useState("");
  const [dismissDesc, setDismissDesc] = useState("");
  const [pulse,       setPulse]       = useState("");
  const [pulseDesc,   setPulseDesc]   = useState("");
  // tinkerer-alchemy, pilot-vehicle
  const [itemCategory,setItemCategory]= useState("");
  // tinkerer-infusion
  const [infusionRank,setInfusionRank]= useState("");
  // cooking — 12 roll-result effects (indices 0-11 = results 1-12)
  const [cookingEffects, setCookingEffects] = useState(Array.from({ length: 12 }, () => ""));
  // magiseed
  const [seedDescription, setSeedDescription] = useState("");
  const [seedRangeStart,  setSeedRangeStart]  = useState(1);
  const [seedRangeEnd,    setSeedRangeEnd]    = useState(4);
  const [seedEffects,     setSeedEffects]     = useState({});
  // pilot-vehicle
  const [pilotSubtype,   setPilotSubtype]   = useState("frame");
  const [vehicleFrame,   setVehicleFrame]   = useState(availableFrames[0]?.name ?? "");
  const [moduleDef,      setModuleDef]      = useState("");
  const [moduleMdef,     setModuleMdef]     = useState("");
  const [moduleMartial,  setModuleMartial]  = useState(false);
  const [moduleDamage,   setModuleDamage]   = useState("");
  const [moduleRange,    setModuleRange]    = useState("");
  const [modulePrec,     setModulePrec]     = useState(0);
  const [moduleCumbersome,  setModuleCumbersome]  = useState(false);
  const [moduleCost,        setModuleCost]        = useState(0);
  const [moduleDescription, setModuleDescription] = useState("");
  // weapon-specific
  const [weaponCategory,    setWeaponCategory]    = useState("Heavy");
  const [damageType,        setDamageType]        = useState("Physical");
  const [pilotAtt1,         setPilotAtt1]         = useState("might");
  const [pilotAtt2,         setPilotAtt2]         = useState("dexterity");
  const [quality,           setQuality]           = useState("");
  const [qualityCost,       setQualityCost]       = useState(0);
  const [isShield,          setIsShield]          = useState(false);

  const data = {
    class: spellClass, name: name.trim(), description: description.trim(), isOffensive,
    mp: mp === "" ? 0 : Number(mp),
    maxTargets: maxTargets === "" ? 1 : Number(maxTargets),
    targetDesc: targetDesc.trim() || "One creature",
    duration: duration.trim() || "Instantaneous",
    attr1, attr2, spellType: "default",
  };

  const nonStaticData = spellType === "default" ? null : {
    name: name.trim(),
    spellType,
    // generic effect/description (therioform, magichant, symbol, dance, gift, tinkerer-infusion, etc.)
    effect: effect.trim(),
    description: effect.trim(),
    event: event.trim(),
    genoclepsis: genoclepsis.trim() || undefined,
    duration: duration || undefined,
    // invocation
    wellspring: wellspring.trim() || undefined,
    type: invType.trim() || undefined,
    // arcanist / arcanist-rework
    domain: domain.trim() || undefined,
    domainDesc: domainDesc.trim() || undefined,
    merge: merge.trim() || undefined,
    mergeDesc: mergeDesc.trim() || undefined,
    dismiss: dismiss.trim() || undefined,
    dismissDesc: dismissDesc.trim() || undefined,
    pulse: pulse.trim() || undefined,
    pulseDesc: pulseDesc.trim() || undefined,
    // tinkerer-alchemy / pilot-vehicle category
    category: itemCategory.trim() || undefined,
    // tinkerer-infusion
    infusionRank: infusionRank !== "" ? Number(infusionRank) : undefined,
    // cooking
    ...(spellType === "cooking" && {
      cookbookEffects: cookingEffects.map((fx, i) => ({ id: i + 1, effect: fx.trim(), customChoices: {} })),
    }),
    // magiseed
    ...(spellType === "magiseed" && {
      description: seedDescription.trim(),
      rangeStart: Number(seedRangeStart),
      rangeEnd: Number(seedRangeEnd),
      effects: seedEffects,
    }),
    // pilot-vehicle — flat structure per subtype for later import into player-edit
    ...(spellType === "pilot-vehicle" && (() => {
      const frameData = availableFrames.find((f) => f.name === vehicleFrame);
      const base = { pilotSubtype, customName: name.trim(), enabled: false, equipped: false, equippedSlot: null };
      if (pilotSubtype === "frame") return {
        ...base,
        frame: vehicleFrame,
        passengers: frameData?.passengers ?? 0,
        distance: frameData?.distance ?? 1,
        description: effect.trim(),
      };
      if (pilotSubtype === "armor") return {
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
      if (pilotSubtype === "weapon") return {
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
        quality: quality.trim(),
        qualityCost: Number(qualityCost) || 0,
        isShield,
        equippedSlot: "main",
      };
      // support
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

  return (
    <PanelLayout
      data={spellType === "default" ? data : nonStaticData}
      itemName={name.trim() || ""}
      formContent={
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Spell Type")}</InputLabel>
              <Select value={spellType} label={t("Spell Type")} onChange={(e) => setSpellType(e.target.value)}>
                {NON_STATIC_TYPES.map((st) => <MenuItem key={st.value} value={st.value}>{t(st.label)}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          {spellType === "default" && (
            <Grid item xs={12} sm={7}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Class")}</InputLabel>
                <Select value={spellClass} label={t("Class")} onChange={(e) => setSpellClass(e.target.value)}>
                  {spellClasses.map((c) => <MenuItem key={c} value={c}>{t(c)}</MenuItem>)}
                  <MenuItem value="">{t("Custom")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {spellType !== "default" ? (
            <Grid container spacing={2} alignItems="center" sx={{ mt: 0, ml: 0 }}>
              <Grid item xs={12}>
                <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus />
              </Grid>

              {/* Gift */}
              {spellType === "gift" && (
                <Grid item xs={12}>
                  <TextField label={t("Event / Trigger")} value={event} onChange={(e) => setEvent(e.target.value)} fullWidth size="small" />
                </Grid>
              )}

              {/* Therioform */}
              {spellType === "therioform" && (
                <Grid item xs={12}>
                  <TextField label={t("Genoclepsis (optional)")} value={genoclepsis} onChange={(e) => setGenoclepsis(e.target.value)} fullWidth size="small" />
                </Grid>
              )}

              {/* Dance */}
              {spellType === "dance" && (
                <Grid item xs={12} sm={6}>
                  <Autocomplete freeSolo options={DURATION_OPTIONS.map(t)} inputValue={duration} onInputChange={(_, v) => setDuration(v)}
                    renderInput={(params) => <TextField {...params} label={t("Duration")} size="small" />} />
                </Grid>
              )}

              {/* Invocation */}
              {spellType === "invocation" && (
                <>
                  <Grid item xs={6}>
                    <Autocomplete options={WELLSPRINGS} value={wellspring || null}
                      onChange={(_, v) => setWellspring(v ?? "")}
                      renderInput={(params) => <TextField {...params} label={t("Wellspring")} size="small" />} />
                  </Grid>
                  <Grid item xs={6}>
                    <Autocomplete options={INV_TYPES} value={invType || null}
                      onChange={(_, v) => setInvType(v ?? "")}
                      renderInput={(params) => <TextField {...params} label={t("Type")} size="small" />} />
                  </Grid>
                </>
              )}

              {/* Arcanum / Arcanum Rework */}
              {(spellType === "arcanist" || spellType === "arcanist-rework") && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField label={t("Domain name")} value={domain} onChange={(e) => setDomain(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextarea label={t("Domain effect")} value={domainDesc} onChange={(e) => setDomainDesc(e.target.value)} helperText="" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField label={t("Merge name")} value={merge} onChange={(e) => setMerge(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextarea label={t("Merge effect")} value={mergeDesc} onChange={(e) => setMergeDesc(e.target.value)} helperText="" />
                  </Grid>
                  {spellType === "arcanist-rework" && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <TextField label={t("Pulse name")} value={pulse} onChange={(e) => setPulse(e.target.value)} fullWidth size="small" />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextarea label={t("Pulse effect")} value={pulseDesc} onChange={(e) => setPulseDesc(e.target.value)} helperText="" />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={4}>
                    <TextField label={t("Dismiss name")} value={dismiss} onChange={(e) => setDismiss(e.target.value)} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextarea label={t("Dismiss effect")} value={dismissDesc} onChange={(e) => setDismissDesc(e.target.value)} helperText="" />
                  </Grid>
                </>
              )}

              {/* Tinkerer Alchemy */}
              {spellType === "tinkerer-alchemy" && (
                <Grid item xs={12}>
                  <TextField label={t("Category")} value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} fullWidth size="small" />
                </Grid>
              )}

              {/* Tinkerer Infusion */}
              {spellType === "tinkerer-infusion" && (
                <Grid item xs={12} sm={4}>
                  <TextField label={t("Rank")} value={infusionRank} onChange={(e) => setInfusionRank(e.target.value)}
                    fullWidth size="small" type="number" inputProps={{ min: 1, max: 3 }} />
                </Grid>
              )}

              {/* Cooking — one text field per roll result 1-12 */}
              {spellType === "cooking" && (
                <>
                  {cookingEffects.map((fx, i) => (
                    <Grid item xs={12} key={i}>
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

              {/* Magiseed — description + per-tick effects */}
              {spellType === "magiseed" && (
                <>
                  <Grid item xs={6} sm={3}>
                    <TextField label={t("Range Start")} value={seedRangeStart} type="number"
                      inputProps={{ min: 0, max: 4 }} fullWidth size="small"
                      onChange={(e) => setSeedRangeStart(Number(e.target.value))} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField label={t("Range End")} value={seedRangeEnd} type="number"
                      inputProps={{ min: 1, max: 6 }} fullWidth size="small"
                      onChange={(e) => setSeedRangeEnd(Number(e.target.value))} />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextarea label={t("Description")} value={seedDescription}
                      onChange={(e) => setSeedDescription(e.target.value)} helperText="" />
                  </Grid>
                  {Array.from({ length: seedRangeEnd - seedRangeStart + 1 }, (_, i) => {
                    const tick = seedRangeStart + i;
                    return (
                      <Grid item xs={12} key={tick}>
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

              {/* Pilot Vehicle */}
              {spellType === "pilot-vehicle" && (
                <>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("Component Type")}</InputLabel>
                      <Select value={pilotSubtype} label={t("Component Type")} onChange={(e) => setPilotSubtype(e.target.value)}>
                        {PILOT_SUBTYPES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{t(s.label)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Frame */}
                  {pilotSubtype === "frame" && (
                    <Grid item xs={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Frame")}</InputLabel>
                        <Select value={vehicleFrame} label={t("Frame")} onChange={(e) => setVehicleFrame(e.target.value)}>
                          {availableFrames.map((f) => (
                            <MenuItem key={f.name} value={f.name}>
                              {t(f.name)} — {t("Passengers")}: {f.passengers} · {t("Distance")}: {f.distance}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Cost — shown for all module types */}
                  {pilotSubtype !== "frame" && (
                    <Grid item xs={6} sm={4}>
                      <TextField label={t("Cost")} value={moduleCost} type="number" fullWidth size="small"
                        inputProps={{ min: 0 }} onChange={(e) => setModuleCost(e.target.value)} />
                    </Grid>
                  )}

                  {/* Armor Module */}
                  {pilotSubtype === "armor" && (
                    <>
                      <Grid item xs={4} sm={3}>
                        <TextField label="DEF" value={moduleDef} type="number" fullWidth size="small"
                          onChange={(e) => setModuleDef(e.target.value)} />
                      </Grid>
                      <Grid item xs={4} sm={3}>
                        <TextField label="MDEF" value={moduleMdef} type="number" fullWidth size="small"
                          onChange={(e) => setModuleMdef(e.target.value)} />
                      </Grid>
                      <Grid item xs={4} sm={2} sx={{ display: "flex", alignItems: "center" }}>
                        <ToggleButton value="martial" selected={moduleMartial} onChange={() => setModuleMartial((v) => !v)}
                          size="small" sx={{ width: "100%" }}>
                          {t("Martial")}
                        </ToggleButton>
                      </Grid>
                      <Grid item xs={12}>
                        <CustomTextarea label={t("Description (optional)")} value={moduleDescription}
                          onChange={(e) => setModuleDescription(e.target.value)} helperText="" />
                      </Grid>
                    </>
                  )}

                  {/* Weapon Module */}
                  {pilotSubtype === "weapon" && (
                    <>
                      <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Category")}</InputLabel>
                          <Select value={weaponCategory} label={t("Category")} onChange={(e) => setWeaponCategory(e.target.value)}>
                            {PILOT_WEAPON_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Damage Type")}</InputLabel>
                          <Select value={damageType} label={t("Damage Type")} onChange={(e) => setDamageType(e.target.value)}>
                            {PILOT_DAMAGE_TYPES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Range")}</InputLabel>
                          <Select value={moduleRange || "Melee"} label={t("Range")} onChange={(e) => setModuleRange(e.target.value)}>
                            {PILOT_RANGES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Att 1")}</InputLabel>
                          <Select value={pilotAtt1} label={t("Att 1")} onChange={(e) => setPilotAtt1(e.target.value)}>
                            {PILOT_ATTRS.map((a) => <MenuItem key={a} value={a}>{t(a)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Att 2")}</InputLabel>
                          <Select value={pilotAtt2} label={t("Att 2")} onChange={(e) => setPilotAtt2(e.target.value)}>
                            {PILOT_ATTRS.map((a) => <MenuItem key={a} value={a}>{t(a)}</MenuItem>)}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <TextField label="HR+" value={moduleDamage} type="number" fullWidth size="small"
                          onChange={(e) => setModuleDamage(e.target.value)} />
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <TextField label={t("+Acc")} value={modulePrec} type="number" fullWidth size="small"
                          onChange={(e) => setModulePrec(e.target.value)} />
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <TextField label={t("Quality Cost")} value={qualityCost} type="number" fullWidth size="small"
                          onChange={(e) => setQualityCost(e.target.value)} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField label={t("Quality")} value={quality} fullWidth size="small"
                          onChange={(e) => setQuality(e.target.value)} />
                      </Grid>
                      <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                        <ToggleButton value="cumbersome" selected={moduleCumbersome} onChange={() => setModuleCumbersome((v) => !v)}
                          size="small" sx={{ width: "100%" }}>
                          {t("Cumbersome")}
                        </ToggleButton>
                      </Grid>
                      <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                        <ToggleButton value="isShield" selected={isShield} onChange={() => setIsShield((v) => !v)}
                          size="small" sx={{ width: "100%" }}>
                          {t("Shield")}
                        </ToggleButton>
                      </Grid>
                    </>
                  )}
                </>
              )}

              {/* Generic effect/description for types that use it */}
              {!(spellType === "arcanist" || spellType === "arcanist-rework" || spellType === "cooking" || spellType === "magiseed") &&
               !(spellType === "pilot-vehicle" && (pilotSubtype === "armor" || pilotSubtype === "weapon")) && (
                <Grid item xs={12}>
                  <CustomTextarea
                    label={spellType === "therioform" || spellType === "pilot-vehicle" ? t("Description") : t("Effect")}
                    value={effect}
                    onChange={(e) => setEffect(e.target.value)}
                    helperText=""
                  />
                </Grid>
              )}
            </Grid>
          ) : (
            <>
              <Grid item xs={10} sm={6}>
                <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus />
              </Grid>
              <Grid item xs={2} sm={1}>
                <ToggleButton value="offensive" selected={isOffensive} onChange={() => setIsOffensive((v) => !v)}
                  size="small" sx={{ width: "100%" }}>
                  <OffensiveSpellIcon />
                </ToggleButton>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label={t("MP")} value={mp} onChange={(e) => setMp(e.target.value)}
                  fullWidth size="small" type="number" inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField label={t("Max Targets")} value={maxTargets} onChange={(e) => setMaxTargets(e.target.value)}
                  fullWidth size="small" type="number" inputProps={{ min: 0 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete freeSolo options={TARGET_OPTIONS.map(t)} inputValue={targetDesc}
                  onInputChange={(_, v) => setTargetDesc(v)}
                  renderInput={(params) => <TextField {...params} label={t("Target")} size="small" />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete freeSolo options={DURATION_OPTIONS.map(t)} inputValue={duration}
                  onInputChange={(_, v) => setDuration(v)}
                  renderInput={(params) => <TextField {...params} label={t("Duration")} size="small" />} />
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
                <TextField label={t("Description")} value={description} onChange={(e) => setDescription(e.target.value)}
                  fullWidth size="small" multiline rows={3} />
              </Grid>
            </>
          )}
        </Grid>
      }
      previewContent={spellType === "default"
        ? <PlayerSpellCard spell={data} />
        : <NonStaticSpellCard item={nonStaticData} />
      }
      addButton={<AddToCompendiumButton itemType="player-spell" data={spellType === "default" ? data : nonStaticData} />}
    />
  );
}

// ── Quality panel ─────────────────────────────────────────────────────────────

function QualityPanel() {
  const { t } = useTranslate();
  const [name,       setName]       = useState("");
  const [category,   setCategory]   = useState(QUALITY_CATEGORIES[0]);
  const [quality,    setQuality]    = useState("");
  const [cost,       setCost]       = useState(0);
  const [filter,     setFilter]     = useState([]);
  const [qualityTab, setQualityTab] = useState(0);

  const data = { name: name.trim(), category, quality: quality.trim(), cost: Number(cost), filter };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Box>
          <Tabs value={qualityTab} onChange={(_, v) => setQualityTab(v)} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tab label={t("Custom")} />
            <Tab label={t("Generator")} />
          </Tabs>
          {qualityTab === 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={qualities}
                  getOptionLabel={(q) => q.name}
                  onChange={(_, q) => {
                    if (q) {
                      setName(q.name); setCategory(q.category); setQuality(q.quality);
                      setCost(q.cost); setFilter(q.filter || []);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label={t("Select Existing Quality")} size="small" />}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Category")}</InputLabel>
                  <Select value={category} label={t("Category")} onChange={(e) => setCategory(e.target.value)}>
                    {QUALITY_CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{t(cat)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label={t("Quality Effect")} value={quality} onChange={(e) => setQuality(e.target.value)}
                  fullWidth size="small" multiline rows={3} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label={t("Cost")} value={cost} onChange={(e) => setCost(e.target.value)}
                  fullWidth size="small" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="qc-filter-label">{t("Applicable to")}</InputLabel>
                  <Select labelId="qc-filter-label" multiple value={filter}
                    onChange={(e) => { const v = e.target.value; setFilter(typeof v === "string" ? v.split(",") : v); }}
                    input={<OutlinedInput label={t("Applicable to")} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((v) => <Chip key={v} label={t(FILTER_OPTIONS.find((o) => o.value === v)?.label ?? v)} size="small" />)}
                      </Box>
                    )}
                  >
                    {FILTER_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{t(o.label)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <QualitiesGenerator onGenerate={(text) => setQuality(text)} />
          )}
        </Box>
      }
      previewContent={data.name ? <QualityCard quality={data} /> : <Box sx={{ p: 2 }}><Typography color="text.secondary">Fill in the form to see a preview</Typography></Box>}
      addButton={<AddToCompendiumButton itemType="quality" data={data} />}
    />
  );
}

// ── Heroic panel ──────────────────────────────────────────────────────────────

function HeroicPanel() {
  const { t } = useTranslate();
  const [name,         setName]         = useState("");
  const [book,         setBook]         = useState("");
  const [quote,        setQuote]        = useState("");
  const [description,  setDescription]  = useState("");
  const [applicableTo, setApplicableTo] = useState([]);

  const data = { name: name.trim(), book, quote: quote.trim(), description: description.trim(), applicableTo };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)}
              fullWidth size="small" autoFocus inputProps={{ maxLength: 50 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Book")}</InputLabel>
              <Select value={book} label={t("Book")} onChange={(e) => setBook(e.target.value)}>
                <MenuItem value="">{t("None")}</MenuItem>
                {HEROIC_BOOK_OPTIONS.map((b) => <MenuItem key={b} value={b} sx={{ textTransform: "capitalize" }}>{b}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete multiple options={CLASS_NAME_OPTIONS} value={applicableTo}
              onChange={(_, v) => setApplicableTo(v)} freeSolo
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip key={option} label={option} size="small" {...getTagProps({ index })} />)
              }
              renderInput={(params) => <TextField {...params} label={t("Applicable To")} size="small" placeholder={t("Select classes...")} />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField label={t("Quote")} value={quote} onChange={(e) => setQuote(e.target.value)}
              fullWidth size="small" inputProps={{ maxLength: 200 }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label={t("Description")} value={description} onChange={(e) => setDescription(e.target.value)}
              fullWidth size="small" multiline rows={4} inputProps={{ maxLength: 1500 }} />
          </Grid>
        </Grid>
      }
      previewContent={<HeroicCard heroic={data} />}
      addButton={<AddToCompendiumButton itemType="heroic" data={data} />}
      data={data}
      itemName={data.name || ""}
    />
  );
}

// ── Class panel (inline form) ─────────────────────────────────────────────────

const BLANK_BENEFITS = {
  hpplus: 0, mpplus: 0, ipplus: 0, isCustomBenefit: false,
  martials: { armor: false, shields: false, melee: false, ranged: false },
  rituals: { ritualism: false },
  custom: [], spellClasses: [],
};

const BLANK_SKILL = { skillName: "", maxLvl: 1, description: "", specialSkill: "", currentLvl: 0 };

function ClassPanel() {
  const { t } = useTranslate();
  const [name,           setName]           = useState("");
  const [book,           setBook]           = useState("homebrew");
  const [hpplus,         setHpplus]         = useState(0);
  const [mpplus,         setMpplus]         = useState(0);
  const [ipplus,         setIpplus]         = useState(0);
  const [martials,       setMartials]       = useState({ armor: false, shields: false, melee: false, ranged: false });
  const [ritualism,      setRitualism]      = useState(false);
  const [customBenefits, setCustomBenefits] = useState([]);
  const [spellClassesSelected, setSpellClassesSelected] = useState([]);
  const [skills,         setSkills]         = useState(Array.from({ length: 5 }, () => ({ ...BLANK_SKILL })));

  const updateSkillField = (idx, field, value) =>
    setSkills((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

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
      spellClasses: spellClassesSelected,
    },
    skills,
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <Grid item xs={8} sm={9}>
            <TextField label={t("Class Name")} value={name} onChange={(e) => setName(e.target.value)}
              fullWidth size="small" autoFocus inputProps={{ maxLength: 50 }} />
          </Grid>
          <Grid item xs={4} sm={3}>
            <Autocomplete
              freeSolo
              options={CLASS_BOOK_SUGGESTIONS}
              inputValue={book}
              onInputChange={(_, v) => setBook(v)}
              renderInput={(params) => <TextField {...params} label={t("Book")} size="small" placeholder="homebrew" />}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", mb: 0.5 }}>
              {t("Free Benefits")}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <TextField label={t("HP+")} type="number" value={hpplus}
              onChange={(e) => setHpplus(Number(e.target.value))} fullWidth size="small" inputProps={{ min: 0, step: 5 }} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={t("MP+")} type="number" value={mpplus}
              onChange={(e) => setMpplus(Number(e.target.value))} fullWidth size="small" inputProps={{ min: 0, step: 5 }} />
          </Grid>
          <Grid item xs={4}>
            <TextField label={t("IP+")} type="number" value={ipplus}
              onChange={(e) => setIpplus(Number(e.target.value))} fullWidth size="small" inputProps={{ min: 0, step: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {[
                { key: "melee",   label: t("Martial Melee") },
                { key: "ranged",  label: t("Martial Ranged") },
                { key: "shields", label: t("Martial Shields") },
                { key: "armor",   label: t("Martial Armor") },
              ].map(({ key, label }) => (
                <Chip key={key} label={label} size="small" clickable
                  color={martials[key] ? "primary" : "default"}
                  variant={martials[key] ? "filled" : "outlined"}
                  onClick={() => setMartials((m) => ({ ...m, [key]: !m[key] }))} />
              ))}
              <Chip label={t("Ritualism")} size="small" clickable
                color={ritualism ? "primary" : "default"}
                variant={ritualism ? "filled" : "outlined"}
                onClick={() => setRitualism((v) => !v)} />
            </Box>
          </Grid>

          {customBenefits.map((cb, i) => (
            <Grid item xs={12} key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField label={`${t("Custom Benefit")} ${i + 1}`} value={cb}
                onChange={(e) => setCustomBenefits((arr) => arr.map((v, j) => j === i ? e.target.value : v))}
                fullWidth size="small" inputProps={{ maxLength: 500 }} />
              <IconButton size="small" color="error"
                onClick={() => setCustomBenefits((arr) => arr.filter((_, j) => j !== i))}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button size="small" variant="outlined" onClick={() => setCustomBenefits((arr) => [...arr, ""])}>
              + {t("Add Custom Benefit")}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em", mb: 0.5 }}>
              {t("Spell Types")}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {spellClassesList.map((sc) => (
                <Chip key={sc} label={t(sc)} size="small" clickable
                  color={spellClassesSelected.includes(sc) ? "secondary" : "default"}
                  variant={spellClassesSelected.includes(sc) ? "filled" : "outlined"}
                  onClick={() => setSpellClassesSelected((prev) =>
                    prev.includes(sc) ? prev.filter((s) => s !== sc) : [...prev, sc]
                  )} />
              ))}
            </Box>
          </Grid>

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
                    <TextField label={`${t("Skill Name")} ${i + 1}`} value={skill.skillName}
                      onChange={(e) => updateSkillField(i, "skillName", e.target.value)}
                      fullWidth size="small" inputProps={{ maxLength: 50 }} />
                  </Grid>
                  <Grid item xs={3} sm={2}>
                    <TextField label={t("Max Lvl")} type="number" value={skill.maxLvl}
                      onChange={(e) => updateSkillField(i, "maxLvl", Math.max(1, Math.min(10, Number(e.target.value))))}
                      fullWidth size="small" inputProps={{ min: 1, max: 10 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label={t("Description")} value={skill.description}
                      onChange={(e) => updateSkillField(i, "description", e.target.value)}
                      fullWidth size="small" multiline rows={2} inputProps={{ maxLength: 1500 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("Special Skill Effect")}</InputLabel>
                      <Select
                        value={skill.specialSkill}
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
      }
      previewContent={<ClassCard cls={{ ...classData, skills: classData.skills.filter(s => s.skillName.trim()) }} />}
      addButton={<AddToCompendiumButton itemType="class" data={classData} />}
      data={classData}
      itemName={classData.name || ""}
    />
  );
}

// ── Weapon panel (inline form) ────────────────────────────────────────────────

function WeaponPanel() {
  const { t } = useTranslate();
  const [base,               setBase]               = useState(weapons[0]);
  const [name,               setName]               = useState(weapons[0].name);
  const [category,           setCategory]           = useState(weapons[0].category ?? "");
  const [type,               setType]               = useState(weapons[0].type);
  const [hands,              setHands]              = useState(weapons[0].hands);
  const [att1,               setAtt1]               = useState(weapons[0].att1);
  const [att2,               setAtt2]               = useState(weapons[0].att2);
  const [martial,            setMartial]            = useState(false);
  const [damageBonus,        setDamageBonus]        = useState(false);
  const [damageReworkBonus,  setDamageReworkBonus]  = useState(false);
  const [precBonus,          setPrecBonus]          = useState(false);
  const [rework,             setRework]             = useState(false);
  const [quality,            setQuality]            = useState("");
  const [qualityCost,        setQualityCost]        = useState(0);
  const [totalBonus,         setTotalBonus]         = useState(0);
  const [selectedQuality,    setSelectedQuality]    = useState("");
  const {
    precModifier, setPrecModifier,
    damageModifier, setDamageModifier,
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    modifiersExpanded, setModifiersExpanded,
    modifiers,
  } = useEquipmentForm(null);

  const calcCost = () => {
    let cost = base.cost;
    if (type !== "physical") cost += 100;
    if (base.att1 !== att1 || base.att2 !== att2) {
      if (att1 === att2) cost += 50;
    }
    if (!rework && damageBonus) cost += 200;
    if (!rework && base.prec !== 1 && precBonus) cost += 100;
    else if (rework && base.prec <= 1 && precBonus) cost += 100;
    cost += parseInt(qualityCost);
    return cost;
  };

  const calcDamage = () => {
    let damage = base.damage;
    if (base.hands === 1 && hands === 2) damage += 4;
    if (base.hands === 2 && hands === 1) damage -= 4;
    if (!rework && damageBonus) damage += 4;
    if (rework && damageReworkBonus) damage += Math.floor(calcCost() / 1000) * 2;
    damage += parseInt(damageModifier);
    return damage;
  };

  const calcPrec = () => {
    let prec = base.prec;
    if (!rework && prec !== 1 && precBonus) prec = 1;
    if (rework && prec === 1 && precBonus) prec = 2;
    else if (rework && prec === 0 && precBonus) prec = 1;
    prec += parseInt(precModifier);
    return prec;
  };

  const cost   = calcCost();
  const damage = calcDamage();
  const prec   = calcPrec();

  useEffect(() => {
    setTotalBonus(Math.floor(cost / 1000) * 2);
  }, [damageReworkBonus, cost, qualityCost, rework]);

  const weaponObj = {
    base, name, category,
    melee: base.melee || false, ranged: base.ranged || false,
    type, hands, att1, att2, martial,
    damageBonus, damageReworkBonus, precBonus, rework,
    quality, qualityCost, totalBonus, selectedQuality,
    cost, damage, prec,
    ...modifiers(),
  };

  const handleClear = () => {
    setBase(weapons[0]); setName(weapons[0].name); setCategory(weapons[0].category ?? "");
    setType(weapons[0].type); setHands(weapons[0].hands);
    setAtt1(weapons[0].att1); setAtt2(weapons[0].att2);
    setMartial(false); setDamageBonus(false); setDamageReworkBonus(false);
    setPrecBonus(false); setRework(false); setQuality(""); setQualityCost(0);
    setSelectedQuality(""); setTotalBonus(0);
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={10} md={4}>
            <ChangeWeaponBase value={base.name} onChange={(e) => {
              const b = weapons.find((el) => el.name === e.target.value);
              setBase(b); setName(t(b.name)); setCategory(b.category);
              setType(b.type); setHands(b.hands); setAtt1(b.att1); setAtt2(b.att2);
              setMartial(b.martial); setDamageBonus(false); setDamageReworkBonus(false); setPrecBonus(false);
            }} />
          </Grid>
          <Grid item xs={2}>
            <ChangeMartial martial={martial} setMartial={setMartial} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChangeName value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ChangeCategory value={category} onChange={(e) => {
              const cat = weaponCategories.find((el) => el === e.target.value);
              setCategory(cat);
            }} />
          </Grid>
          <Grid item xs={6} md={4}>
            <ChangeType value={type} onChange={(e) => setType(e.target.value)} />
          </Grid>
          <Grid item xs={6} md={4}>
            <ChangeHands value={hands} onChange={(e) => setHands(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <ChangeAttr att1={att1} att2={att2}
              setAtt1={(e) => setAtt1(e.target.value)} setAtt2={(e) => setAtt2(e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <SelectWeaponQuality quality={selectedQuality} setQuality={(e) => {
              const q = weaponQualities.find((el) => el.name === e.target.value);
              setSelectedQuality(q.name); setQuality(q.quality); setQualityCost(q.cost);
            }} />
          </Grid>
          <Grid item xs={6}>
            <ChangeBonus basePrec={base.prec} precBonus={precBonus} damageBonus={damageBonus}
              damageReworkBonus={damageReworkBonus} setPrecBonus={setPrecBonus}
              setDamageBonus={setDamageBonus} setDamageReworkBonus={setDamageReworkBonus}
              rework={rework} totalBonus={totalBonus} />
          </Grid>
          <Grid item xs={12}>
            <ChangeQuality quality={quality} setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost} setQualityCost={(e) => setQualityCost(e.target.value)} />
          </Grid>
          <Accordion sx={{ width: "100%", marginLeft: "10px" }}
            expanded={modifiersExpanded} onChange={() => setModifiersExpanded(!modifiersExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Modifiers")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { label: "Damage Modifier",   value: damageModifier,   set: setDamageModifier },
                  { label: "Precision Modifier", value: precModifier,     set: setPrecModifier },
                  { label: "DEF Modifier",       value: defModifier,      set: setDefModifier },
                  { label: "MDEF Modifier",      value: mDefModifier,     set: setMDefModifier },
                ].map(({ label, value, set }) => (
                  <Grid item xs={6} key={label}>
                    <ChangeModifiers label={label} value={value} onChange={(e) => set(e.target.value)} />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={handleClear}>{t("Clear All Fields")}</Button>
              <ApplyRework rework={rework} setRework={setRework} />
            </Stack>
          </Grid>
        </Grid>
      }
      previewContent={<WeaponCard weapon={weaponObj} />}
      addButton={<AddToCompendiumButton itemType="weapon" data={weaponObj} />}
      data={weaponObj}
      itemName={weaponObj.name || ""}
    />
  );
}

// ── Armor panel (inline form) ─────────────────────────────────────────────────

function ArmorPanel() {
  const { t } = useTranslate();
  const [base,            setBase]            = useState(armor[0]);
  const [name,            setName]            = useState(armor[0].name);
  const [quality,         setQuality]         = useState("");
  const [qualityCost,     setQualityCost]     = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [init,            setInit]            = useState(armor[0].init ?? 0);
  const [rework,          setRework]          = useState(false);
  const {
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    initModifier, setInitModifier,
    magicModifier, setMagicModifier,
    precModifier, setPrecModifier,
    damageMeleeModifier, setDamageMeleeModifier,
    damageRangedModifier, setDamageRangedModifier,
    modifiersExpanded, setModifiersExpanded,
    modifiers,
    clearModifiers,
  } = useEquipmentForm(null);

  const cost = base.cost + parseInt(qualityCost);

  const armorObj = {
    base, ...base, name, cost, quality, qualityCost, selectedQuality,
    init, rework, category: "Armor",
    defModifier: parseInt(defModifier),
    mDefModifier: parseInt(mDefModifier),
    initModifier: parseInt(initModifier),
    ...modifiers(),
  };

  const handleClear = () => {
    setBase(armor[0]); setName(armor[0].name); setQuality(""); setQualityCost(0);
    setSelectedQuality(""); setInit(armor[0].init ?? 0); setRework(false);
    clearModifiers();
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <ChangeArmorBase value={base.name} onChange={(e) => {
              const b = armor.find((el) => el.name === e.target.value);
              setBase(b); setName(t(b.name)); setInit(b.init ?? 0);
            }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <SelectArmorQuality quality={selectedQuality} setQuality={(e) => {
              const q = armorShieldQualities.find((el) => el.name === e.target.value);
              setSelectedQuality(q.name); setQuality(q.quality); setQualityCost(q.cost);
            }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ChangeName value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <ChangeQuality quality={quality} setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost} setQualityCost={(e) => setQualityCost(e.target.value)} />
          </Grid>
          <Accordion sx={{ width: "100%", marginLeft: "10px" }}
            expanded={modifiersExpanded} onChange={() => setModifiersExpanded(!modifiersExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Modifiers")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { label: "DEF Modifier",             value: defModifier,          set: setDefModifier },
                  { label: "MDEF Modifier",            value: mDefModifier,         set: setMDefModifier },
                  { label: "INIT Modifier",            value: initModifier,         set: setInitModifier },
                  { label: "Magic Modifier",           value: magicModifier,        set: setMagicModifier },
                  { label: "Precision Modifier",       value: precModifier,         set: setPrecModifier },
                  { label: "Damage (Melee) Modifier",  value: damageMeleeModifier,  set: setDamageMeleeModifier },
                  { label: "Damage (Ranged) Modifier", value: damageRangedModifier, set: setDamageRangedModifier },
                ].map(({ label, value, set }) => (
                  <Grid item xs={6} md={4} key={label}>
                    <ChangeModifiers label={label} value={value} onChange={(e) => set(e.target.value)} />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={handleClear}>{t("Clear All Fields")}</Button>
              <ApplyRework rework={rework} setRework={setRework} />
            </Stack>
          </Grid>
        </Grid>
      }
      previewContent={<ArmorCard armor={armorObj} />}
      addButton={<AddToCompendiumButton itemType="armor" data={armorObj} />}
      data={armorObj}
      itemName={armorObj.name || ""}
    />
  );
}

// ── Shield panel (inline form) ────────────────────────────────────────────────

function ShieldPanel() {
  const { t } = useTranslate();
  const [base,            setBase]            = useState(shields[0]);
  const [name,            setName]            = useState(shields[0].name);
  const [quality,         setQuality]         = useState("");
  const [qualityCost,     setQualityCost]     = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [init,            setInit]            = useState(shields[0].init ?? 0);
  const [rework,          setRework]          = useState(false);
  const {
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    initModifier, setInitModifier,
    magicModifier, setMagicModifier,
    precModifier, setPrecModifier,
    damageMeleeModifier, setDamageMeleeModifier,
    damageRangedModifier, setDamageRangedModifier,
    modifiersExpanded, setModifiersExpanded,
    modifiers,
    clearModifiers,
  } = useEquipmentForm(null);

  const cost = base.cost + parseInt(qualityCost);

  const shieldObj = {
    base, ...base, name, cost, quality, qualityCost, selectedQuality,
    init, rework, category: "Shield",
    defModifier: parseInt(defModifier),
    mDefModifier: parseInt(mDefModifier),
    initModifier: parseInt(initModifier),
    ...modifiers(),
  };

  const handleClear = () => {
    setBase(shields[0]); setName(t(shields[0].name)); setQuality(""); setQualityCost(0);
    setSelectedQuality(""); setInit(shields[0].init ?? 0); setRework(false);
    clearModifiers();
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <ChangeShieldBase value={base.name} onChange={(e) => {
              const b = shields.find((el) => el.name === e.target.value);
              setBase(b); setName(t(b.name)); setInit(b.init ?? 0);
            }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <SelectArmorQuality quality={selectedQuality} setQuality={(e) => {
              const q = armorShieldQualities.find((el) => el.name === e.target.value);
              setSelectedQuality(q.name); setQuality(q.quality); setQualityCost(q.cost);
            }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <ChangeName value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <ChangeQuality quality={quality} setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost} setQualityCost={(e) => setQualityCost(e.target.value)} />
          </Grid>
          <Accordion sx={{ width: "100%", marginLeft: "10px" }}
            expanded={modifiersExpanded} onChange={() => setModifiersExpanded(!modifiersExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Modifiers")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { label: "DEF Modifier",             value: defModifier,          set: setDefModifier },
                  { label: "MDEF Modifier",            value: mDefModifier,         set: setMDefModifier },
                  { label: "INIT Modifier",            value: initModifier,         set: setInitModifier },
                  { label: "Magic Modifier",           value: magicModifier,        set: setMagicModifier },
                  { label: "Precision Modifier",       value: precModifier,         set: setPrecModifier },
                  { label: "Damage (Melee) Modifier",  value: damageMeleeModifier,  set: setDamageMeleeModifier },
                  { label: "Damage (Ranged) Modifier", value: damageRangedModifier, set: setDamageRangedModifier },
                ].map(({ label, value, set }) => (
                  <Grid item xs={6} md={4} key={label}>
                    <ChangeModifiers label={label} value={value} onChange={(e) => set(e.target.value)} />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={handleClear}>{t("Clear All Fields")}</Button>
              <ApplyRework rework={rework} setRework={setRework} />
            </Stack>
          </Grid>
        </Grid>
      }
      previewContent={<ArmorCard armor={shieldObj} />}
      addButton={<AddToCompendiumButton itemType="shield" data={shieldObj} />}
      data={shieldObj}
      itemName={shieldObj.name || ""}
    />
  );
}

// ── Custom Weapon panel ───────────────────────────────────────────────────────

function CustomWeaponPanel() {
  const { t } = useTranslate();
  const [name,                  setName]                  = useState("");
  const [category,              setCategory]              = useState(cwCategories[0]);
  const [range,                 setRange]                 = useState(cwRange[0]);
  const [accuracyCheck,         setAccuracyCheck]         = useState(cwAccuracyChecks[0]);
  const [type,                  setType]                  = useState(cwTypes[0]);
  const [customizations,        setCustomizations]        = useState([]);
  const [selectedCustomization, setSelectedCustomization] = useState("");
  const [quality,               setQuality]               = useState("");
  const [qualityCost,           setQualityCost]           = useState(0);
  const [selectedQuality,       setSelectedQuality]       = useState("");
  const {
    damageModifier, setDamageModifier,
    precModifier, setPrecModifier,
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    modifiersExpanded, setModifiersExpanded,
    modifiers,
    clearModifiers,
  } = useEquipmentForm(null);

  const weaponObj = {
    name,
    category,
    range,
    accuracyCheck: [accuracyCheck.att1, accuracyCheck.att2],
    type,
    customizations,
    quality,
    qualityCost,
    selectedQuality,
    damageModifier: parseInt(damageModifier),
    precModifier: parseInt(precModifier),
    defModifier: parseInt(defModifier),
    mDefModifier: parseInt(mDefModifier),
    ...modifiers(),
  };

  const handleClear = () => {
    setName(""); setCategory(cwCategories[0]); setRange(cwRange[0]);
    setAccuracyCheck(cwAccuracyChecks[0]); setType(cwTypes[0]);
    setCustomizations([]); setSelectedCustomization("");
    setQuality(""); setQualityCost(0); setSelectedQuality("");
    clearModifiers();
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    if (newCat === "weapon_category_arcane" || newCat === "weapon_category_dagger") {
      setCustomizations((prev) => prev.filter((c) => c.name !== "weapon_customization_powerful"));
    }
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ChangeCWCategory value={category} onChange={handleCategoryChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ChangeRange value={range} onChange={(e) => setRange(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ChangeAccuracyCheck value={accuracyCheck} onChange={(val) => setAccuracyCheck(val)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ChangeCWType value={type} onChange={(e) => setType(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <ChangeCustomizations
              selectedCustomization={selectedCustomization}
              setSelectedCustomization={setSelectedCustomization}
              onCustomizationAdd={(c) => setCustomizations((prev) => [...prev, c])}
              onCustomizationRemove={(name) => setCustomizations((prev) => prev.filter((c) => c.name !== name))}
              currentCustomizations={customizations}
              selectedCategory={category}
            />
          </Grid>
          <Grid item xs={12}>
            <SelectWeaponQuality quality={selectedQuality} setQuality={(e) => {
              const q = weaponQualities.find((el) => el.name === e.target.value);
              setSelectedQuality(q.name); setQuality(q.quality); setQualityCost(q.cost);
            }} />
          </Grid>
          <Grid item xs={12}>
            <ChangeQuality quality={quality} setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost} setQualityCost={(e) => setQualityCost(e.target.value)} />
          </Grid>
          <Accordion sx={{ width: "100%", marginLeft: "10px" }}
            expanded={modifiersExpanded} onChange={() => setModifiersExpanded(!modifiersExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Modifiers")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { label: "Damage Modifier",   value: damageModifier, set: setDamageModifier },
                  { label: "Precision Modifier", value: precModifier,   set: setPrecModifier },
                  { label: "DEF Modifier",       value: defModifier,    set: setDefModifier },
                  { label: "MDEF Modifier",      value: mDefModifier,   set: setMDefModifier },
                ].map(({ label, value, set }) => (
                  <Grid item xs={6} key={label}>
                    <ChangeModifiers label={label} value={value} onChange={(e) => set(e.target.value)} />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>{t("Clear All Fields")}</Button>
          </Grid>
        </Grid>
      }
      previewContent={<CustomWeaponCard weapon={weaponObj} />}
      addButton={<AddToCompendiumButton itemType="custom-weapon" data={weaponObj} />}
      data={weaponObj}
      itemName={weaponObj.name || ""}
    />
  );
}

// ── Accessory panel ───────────────────────────────────────────────────────────

function AccessoryPanel() {
  const { t } = useTranslate();
  const [name,            setName]            = useState("");
  const [quality,         setQuality]         = useState("");
  const [qualityCost,     setQualityCost]     = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("");
  const {
    defModifier, setDefModifier,
    mDefModifier, setMDefModifier,
    initModifier, setInitModifier,
    magicModifier, setMagicModifier,
    precModifier, setPrecModifier,
    damageMeleeModifier, setDamageMeleeModifier,
    damageRangedModifier, setDamageRangedModifier,
    modifiersExpanded, setModifiersExpanded,
    modifiers,
    clearModifiers,
  } = useEquipmentForm(null);

  const cost = parseInt(qualityCost);

  const accessoryObj = {
    name,
    cost,
    quality,
    qualityCost,
    selectedQuality,
    defModifier: parseInt(defModifier),
    mDefModifier: parseInt(mDefModifier),
    initModifier: parseInt(initModifier),
    magicModifier: parseInt(magicModifier),
    precModifier: parseInt(precModifier),
    damageMeleeModifier: parseInt(damageMeleeModifier),
    damageRangedModifier: parseInt(damageRangedModifier),
  };

  const handleClear = () => {
    setName(""); setQuality(""); setQualityCost(0); setSelectedQuality("");
    clearModifiers();
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField label={t("Name")} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" autoFocus />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectAccessoryQuality quality={selectedQuality} setQuality={(e) => {
              const q = accessoryQualities.find((el) => el.name === e.target.value);
              setSelectedQuality(q.name); setQuality(q.quality); setQualityCost(q.cost);
            }} />
          </Grid>
          <Grid item xs={12}>
            <ChangeQuality quality={quality} setQuality={(e) => setQuality(e.target.value)}
              qualityCost={qualityCost} setQualityCost={(e) => setQualityCost(e.target.value)} />
          </Grid>
          <Accordion sx={{ width: "100%", marginLeft: "10px" }}
            expanded={modifiersExpanded} onChange={() => setModifiersExpanded(!modifiersExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Modifiers")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {[
                  { label: "DEF Modifier",             value: defModifier,          set: setDefModifier },
                  { label: "MDEF Modifier",            value: mDefModifier,         set: setMDefModifier },
                  { label: "INIT Modifier",            value: initModifier,         set: setInitModifier },
                  { label: "Magic Modifier",           value: magicModifier,        set: setMagicModifier },
                  { label: "Precision Modifier",       value: precModifier,         set: setPrecModifier },
                  { label: "Damage (Melee) Modifier",  value: damageMeleeModifier,  set: setDamageMeleeModifier },
                  { label: "Damage (Ranged) Modifier", value: damageRangedModifier, set: setDamageRangedModifier },
                ].map(({ label, value, set }) => (
                  <Grid item xs={6} md={4} key={label}>
                    <ChangeModifiers label={label} value={value} onChange={(e) => set(e.target.value)} />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          <Grid item xs={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>{t("Clear All Fields")}</Button>
          </Grid>
        </Grid>
      }
      previewContent={<AccessoryCard accessory={accessoryObj} />}
      addButton={<AddToCompendiumButton itemType="accessory" data={accessoryObj} />}
      data={accessoryObj}
      itemName={accessoryObj.name || ""}
    />
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { key: "npc-attack",   label: "NPC Attack",   Panel: NpcAttackPanel   },
  { key: "npc-spell",    label: "NPC Spell",    Panel: NpcSpellPanel    },
  { key: "player-spell", label: "Player Spell", Panel: PlayerSpellPanel },
  { key: "quality",      label: "Quality",      Panel: QualityPanel     },
  { key: "heroic",       label: "Heroic Skill", Panel: HeroicPanel      },
  { key: "class",        label: "Class",        Panel: ClassPanel       },
  { key: "weapon",        label: "Weapon",        Panel: WeaponPanel        },
  { key: "custom-weapon", label: "Custom Weapon", Panel: CustomWeaponPanel  },
  { key: "armor",         label: "Armor",         Panel: ArmorPanel         },
  { key: "shield",        label: "Shield",        Panel: ShieldPanel        },
  { key: "accessory",     label: "Accessory",     Panel: AccessoryPanel     },
];

// ── Viewer type → Quick Create tab key ───────────────────────────────────────

const VIEWER_TYPE_TO_TAB_KEY = {
  "attacks":       "npc-attack",
  "spells":        "npc-spell",
  "player-spells": "player-spell",
  "qualities":     "quality",
  "heroics":       "heroic",
  "classes":       "class",
  "weapons":       "weapon",
  "custom-weapons": "custom-weapon",
  "armor":         "armor",
  "shields":       "shield",
  "accessories":   "accessory",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function QuickCreateModal({ open, onClose, lockedToViewerType }) {
  const { t } = useTranslate();

  const lockedTabKey = lockedToViewerType ? VIEWER_TYPE_TO_TAB_KEY[lockedToViewerType] : null;
  const lockedTabIdx = lockedTabKey != null ? TABS.findIndex((t) => t.key === lockedTabKey) : -1;
  const initialTab   = lockedTabIdx >= 0 ? lockedTabIdx : 0;

  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (open && lockedTabIdx >= 0) setTab(lockedTabIdx);
  }, [open, lockedTabIdx]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { height: "90vh", display: "flex", flexDirection: "column" } }}>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoFixHigh fontSize="small" />
          {t("Quick Create")}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          {TABS.map((item, idx) => (
            <Tab
              key={item.key}
              label={t(item.label)}
              disabled={lockedTabIdx >= 0 && idx !== lockedTabIdx}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, flex: 1, overflow: "auto" }}>
        {TABS.map(({ key, Panel }, idx) => (
          <Box key={key} hidden={tab !== idx} sx={{ height: "100%" }}>
            {tab === idx && <Panel />}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
