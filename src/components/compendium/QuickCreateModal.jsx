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
  Divider,
  ListSubheader,
  FormControlLabel,
  Checkbox,
  Switch,
} from "@mui/material";
import {
  Add,
  Close,
  AutoFixHigh,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { OffensiveSpellIcon } from "../icons";
import AddToCompendiumButton from "./AddToCompendiumButton";
import Export from "../Export";
import { useTranslate } from "../../translation/translate";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { calculateCustomWeaponStats } from "../player/common/playerCalculations";
import types from "../../libs/types";
import classList from "../../libs/classes";
import spellClassesList from "../../libs/spellClasses";
import specialSkillsList from "../../libs/skills";
import weapons from "../../libs/weapons";
import armor from "../../libs/armor";
import shields from "../../libs/shields";
import {
  SharedSpellCard,
  SharedPlayerSpellCard,
  SharedGambleSpellCard,
  SharedGiftCard,
  SharedDanceCard,
  SharedTherioformCard,
  SharedArcanumCard,
  SharedAlchemyCard,
  SharedInfusionCard,
  SharedMagitechCard,
  SharedInvocationCard,
  SharedCookingCard,
  SharedMagiseedCard,
  SharedPilotVehicleCard,
  SharedSymbolCard,
  SharedMagichantCard,
  SharedAttackCard,
  SharedSpecialRuleCard,
  SharedActionCard,
  SharedClassCard,
  SharedHeroicCard,
  SharedOptionalCard,
  SharedWeaponCard,
  SharedArmorCard,
  SharedShieldCard,
  SharedCustomWeaponCard,
  SharedAccessoryCard,
  SharedQualityCard,
  SharedMnemosphereCard,
  SharedHoplosphereCard,
} from "../shared/itemCards";
import useDownloadImage from "../../hooks/useDownloadImage";
import QualitiesGenerator from "../../routes/equip/Qualities/QualitiesGenerator";
import qualities from "../../libs/qualities";
import CustomTextarea from "../common/CustomTextarea";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import { availableFrames } from "../../libs/pilotVehicleData";
import { availableMagichantKeys } from "../player/spells/spellOptionData";
import {
  buildMnemosphere,
  getMnemosphereCost,
  MNEMOSPHERE_LEVELS,
  mnemosphereClassList,
} from "../../libs/mnemospheres";

import { TypeIcon } from "../types";
import {
  categories as cwCategories,
  accuracyChecks as cwAccuracyChecks,
} from "../../routes/equip/customWeapons/libs.jsx";
import {
  getWeaponAttr1,
  getWeaponAttr2,
  getWeaponPrec,
  getWeaponRange,
  getWeaponType,
  normalizeCustomWeaponLike,
  normalizeWeaponLike,
  calcWeaponCost,
  calcWeaponDamage,
  calcWeaponPrec,
} from "../../libs/weaponNormalization";
import { validateWeaponPersisted } from "../../forms/schema/itemSchemas/weapon";
import { validateCustomWeaponPersisted } from "../../forms/schema/itemSchemas/customWeapon";
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { weaponFieldConfig } from "../../forms/rendering/config/itemConfigs/weapon";
import { armorFieldConfig } from "../../forms/rendering/config/itemConfigs/armor";
import { shieldFieldConfig } from "../../forms/rendering/config/itemConfigs/shield";
import { accessoryFieldConfig } from "../../forms/rendering/config/itemConfigs/accessory";
import { customWeaponFieldConfig } from "../../forms/rendering/config/itemConfigs/customWeapon";

// Shared constants
const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ATTRS = [
  { value: "dexterity", label: "DEX" },
  { value: "insight", label: "INS" },
  { value: "might", label: "MIG" },
  { value: "will", label: "WLP" },
];
const ATTRIBUTE_OPTIONS = ATTRS.map((attr) => attr.value);

function isValidAttribute(value) {
  return ATTRIBUTE_OPTIONS.includes(value);
}

function normalizeCustomWeaponAccuracyCheck(
  value,
  fallback = cwAccuracyChecks[0],
) {
  const att1 = Array.isArray(value) ? value[0] : value?.att1;
  const att2 = Array.isArray(value) ? value[1] : value?.att2;
  if (isValidAttribute(att1) && isValidAttribute(att2)) {
    return { att1, att2 };
  }
  return fallback;
}

function renderDamageTypeValue(typeValue, t) {
  if (!typeValue || typeValue === "nodmg") return t("No Damage");
  const rawLabel = types[typeValue]?.long ?? typeValue;
  const label = String(rawLabel).replace(/\b\w/g, (char) => char.toUpperCase());
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <TypeIcon type={typeValue} />
      <span>{label}</span>
    </Box>
  );
}

function findCustomWeaponPresetAccuracyCheck(value) {
  const normalized = normalizeCustomWeaponAccuracyCheck(value);
  return (
    cwAccuracyChecks.find(
      (check) =>
        check.att1 === normalized.att1 && check.att2 === normalized.att2,
    ) ?? null
  );
}

function hasAccurateCustomization(customizationList) {
  return (customizationList ?? []).some(
    (customization) => customization.name === "weapon_customization_accurate",
  );
}

const DURATION_OPTIONS = ["Scene", "Instantaneous", "Special"];
const TARGET_OPTIONS = [
  "Self",
  "One creature",
  "Up to two creatures",
  "Up to three creatures",
  "Up to four creatures",
  "Up to five creatures",
  "One equipped weapon",
  "Special",
];

const QUALITY_CATEGORIES = ["Offensive", "Defensive", "Enhancement"];
const FILTER_OPTIONS = [
  { label: "Weapons", value: "weapon" },
  { label: "Custom Weapons", value: "customWeapon" },
  { label: "Armor", value: "armor" },
  { label: "Shields", value: "shield" },
  { label: "Accessories", value: "accessory" },
];

const HEROIC_BOOK_OPTIONS = [
  "core",
  "rework",
  "bonus",
  "high",
  "techno",
  "natural",
];

const GROUPED_SPECIAL_SKILLS = specialSkillsList.reduce((acc, skill) => {
  if (!acc[skill.class]) acc[skill.class] = [];
  acc[skill.class].push(skill);
  return acc;
}, {});
const CLASS_BOOK_SUGGESTIONS = [
  "core",
  "rework",
  "bonus",
  "high",
  "techno",
  "natural",
  "homebrew",
];
const CLASS_NAME_OPTIONS = classList.map((c) => c.name);

// Only classes that use standard spells (spellType: "default")
const STANDARD_SPELL_CLASSES = [
  "Chimerist",
  "Tinkerer",
  "Elementalist",
  "Entropist",
  "Spiritist",
];
const spellClasses = STANDARD_SPELL_CLASSES;

// Shared panel layout

function PanelLayout({
  formContent,
  previewContent,
  data,
  itemName,
  addButton,
  exportDataType,
}) {
  const { t } = useTranslate();
  const previewRef = useRef(null);
  const [downloadImage] = useDownloadImage(itemName || "item", previewRef);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          {formContent}
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Stack spacing={2}>
            <Box ref={previewRef}>{previewContent}</Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Tooltip title={t("Share URL")}>
                <IconButton size="small" onClick={handleCopyShareUrl}>
                  <LinkIcon
                    sx={{
                      fontSize: "small",
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("Download as Image")}>
                <IconButton size="small" onClick={downloadImage}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {exportDataType ? (
                <Export
                  name={itemName || "item"}
                  dataType={exportDataType}
                  data={data}
                  size="small"
                />
              ) : null}
              {addButton}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// NPC Attack panel

function NpcAttackPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [range, setRange] = useState("melee");
  const [attr1, setAttr1] = useState("dexterity");
  const [attr2, setAttr2] = useState("dexterity");
  const [dmgType, setDmgType] = useState("physical");
  const [special, setSpecial] = useState("");
  const [accuracyValue, setAccuracyValue] = useState(0);
  const [damageValue, setDamageValue] = useState(0);
  const [hrZero, setHrZero] = useState(false);

  const data = {
    itemType: "basic",
    name: name.trim(),
    range,
    accuracy: { attr1, attr2, value: Number(accuracyValue), defense: "def" },
    damage: { value: Number(damageValue), type: dmgType, hrZero },
    martial: false,
    category: range === "melee" ? "Melee Attack" : "Ranged Attack",
    special: special.trim() ? [special.trim()] : [],
  };

  const handleClear = () => {
    setName("");
    setRange("melee");
    setAttr1("dexterity");
    setAttr2("dexterity");
    setDmgType("physical");
    setSpecial("");
    setAccuracyValue(0);
    setDamageValue(0);
    setHrZero(false);
  };

  return (
    <>
      <PanelLayout
        data={data}
        itemName={data.name || ""}
        formContent={
          <Grid container spacing={2}>
            <Grid size={12}>
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
                sm: 6,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{t("Range")}</InputLabel>
                <Select
                  value={range}
                  label={t("Range")}
                  onChange={(e) => setRange(e.target.value)}
                >
                  <MenuItem value="melee">{t("Melee")}</MenuItem>
                  <MenuItem value="ranged">{t("Ranged")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{t("Attr 1")}</InputLabel>
                <Select
                  value={attr1}
                  label={t("Attr 1")}
                  onChange={(e) => setAttr1(e.target.value)}
                >
                  {ATTRS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{t("Attr 2")}</InputLabel>
                <Select
                  value={attr2}
                  label={t("Attr 2")}
                  onChange={(e) => setAttr2(e.target.value)}
                >
                  {ATTRS.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{t("Damage Type")}</InputLabel>
                <Select
                  value={dmgType}
                  label={t("Damage Type")}
                  onChange={(e) => setDmgType(e.target.value)}
                  renderValue={(selected) => renderDamageTypeValue(selected, t)}
                >
                  {Object.keys(types).map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TypeIcon type={type} />
                        <span>
                          {String(types[type].long).replace(/\b\w/g, (char) =>
                            char.toUpperCase(),
                          )}
                        </span>
                      </Box>
                    </MenuItem>
                  ))}
                  <MenuItem value="nodmg">{t("No Damage")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                label={t("Accuracy Bonus")}
                value={accuracyValue}
                onChange={(e) => setAccuracyValue(e.target.value)}
                fullWidth
                size="small"
                type="number"
                slotProps={{
                  htmlInput: { min: 0 },
                }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                label={t("Damage Value")}
                value={damageValue}
                onChange={(e) => setDamageValue(e.target.value)}
                fullWidth
                size="small"
                type="number"
                slotProps={{
                  htmlInput: { min: 0 },
                }}
              />
            </Grid>
            <Grid size={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hrZero}
                    onChange={(e) => setHrZero(e.target.checked)}
                    size="small"
                  />
                }
                label="HR0"
              />
            </Grid>
            <Grid size={12}>
              <CustomTextarea
                label={t("Special")}
                value={special}
                onChange={(e) => setSpecial(e.target.value)}
                helperText=""
                placeholder={t("Optional special effect description")}
              />
            </Grid>
            <Grid size={12}>
              <Button size="small" variant="outlined" onClick={handleClear}>
                {t("Clear All Fields")}
              </Button>
            </Grid>
          </Grid>
        }
        previewContent={<SharedAttackCard item={data} />}
        addButton={<AddToCompendiumButton itemType="npc-attack" data={data} />}
        exportDataType="attacks"
      />
    </>
  );
}

// NPC Spell panel

function NpcSpellPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [isOffensive, setIsOffensive] = useState(false);
  const [mp, setMp] = useState("1");
  const [perTarget, setPerTarget] = useState(true);
  const [maxTargets, setMaxTargets] = useState("1");
  const [duration, setDuration] = useState("");
  const [target, setTarget] = useState("");
  const [range, setRange] = useState("melee");
  const [attr1, setAttr1] = useState("dexterity");
  const [attr2, setAttr2] = useState("dexterity");
  const [dmgType, setDmgType] = useState("physical");
  const [damage, setDamage] = useState("");
  const [hrZero, setHrZero] = useState(false);
  const [special, setSpecial] = useState("");

  const data = {
    itemType: "spell",
    name: name.trim(),
    isOffensive,
    damage: {
      value: isOffensive && damage !== "" ? Number(damage) : 0,
      type: dmgType,
      hrZero,
    },
    cost: { resource: "mp", amount: mp === "" ? 0 : Number(mp), perTarget },
    maxTargets: maxTargets === "" ? undefined : Number(maxTargets),
    duration: duration || undefined,
    targetDescription: target || undefined,
    range,
    accuracy: { attr1, attr2, value: 0, defense: "mdef" },
    special: special.trim() ? [special.trim()] : [],
  };

  const handleClear = () => {
    setName("");
    setIsOffensive(false);
    setMp("1");
    setPerTarget(true);
    setMaxTargets("1");
    setDuration("");
    setTarget("");
    setRange("melee");
    setAttr1("dexterity");
    setAttr2("dexterity");
    setDmgType("physical");
    setDamage("");
    setHrZero(false);
    setSpecial("");
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid
            size={{
              xs: 10,
              sm: 11,
            }}
          >
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              slotProps={{
                htmlInput: { maxLength: 50 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 2,
              sm: 1,
            }}
          >
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
              sm: 3,
            }}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <TextField
              label={perTarget ? t("MP x Target") : t("MP")}
              value={mp}
              onChange={(e) => setMp(e.target.value)}
              sx={{ flex: 1 }}
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
            <Tooltip title={t("Cost is per target hit")}>
              <Switch
                size="small"
                checked={perTarget}
                onChange={(e) => setPerTarget(e.target.checked)}
              />
            </Tooltip>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3,
            }}
          >
            <TextField
              label={t("Max Targets")}
              value={maxTargets}
              onChange={(e) => setMaxTargets(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Autocomplete
              freeSolo
              options={DURATION_OPTIONS.map(t)}
              inputValue={duration}
              onInputChange={(_, v) => setDuration(v)}
              renderInput={(params) => (
                <TextField {...params} label={t("Duration")} size="small" />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Autocomplete
              freeSolo
              options={TARGET_OPTIONS.map(t)}
              inputValue={target}
              onInputChange={(_, v) => {
                setTarget(v);
                if (["Self", "One creature", "One equipped weapon"].includes(v))
                  setPerTarget(false);
                else if (v.startsWith("Up to")) setPerTarget(true);
              }}
              renderInput={(params) => (
                <TextField {...params} label={t("Target")} size="small" />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t("Range")}</InputLabel>
              <Select
                value={range}
                label={t("Range")}
                onChange={(e) => setRange(e.target.value)}
              >
                <MenuItem value="melee">{t("Melee")}</MenuItem>
                <MenuItem value="ranged">{t("Ranged")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {isOffensive && (
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{t("Damage Type")}</InputLabel>
                <Select
                  value={dmgType}
                  label={t("Damage Type")}
                  onChange={(e) => setDmgType(e.target.value)}
                  renderValue={(selected) => renderDamageTypeValue(selected, t)}
                >
                  {Object.keys(types).map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TypeIcon type={type} />
                        <span>
                          {String(types[type].long).replace(/\b\w/g, (char) =>
                            char.toUpperCase(),
                          )}
                        </span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          {isOffensive && (
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <TextField
                label={t("Damage")}
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                fullWidth
                size="small"
                type="number"
                slotProps={{
                  htmlInput: { min: 0 },
                }}
              />
            </Grid>
          )}
          {isOffensive && (
            <Grid
              size={{
                xs: 6,
                sm: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hrZero}
                    onChange={(e) => setHrZero(e.target.checked)}
                    size="small"
                  />
                }
                label="HR0"
              />
            </Grid>
          )}
          <Grid
            size={{
              xs: 6,
              sm: 3,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 1")}</InputLabel>
              <Select
                value={attr1}
                label={t("Attr 1")}
                onChange={(e) => setAttr1(e.target.value)}
              >
                {ATTRS.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 3,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t("Attr 2")}</InputLabel>
              <Select
                value={attr2}
                label={t("Attr 2")}
                onChange={(e) => setAttr2(e.target.value)}
              >
                {ATTRS.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <CustomTextarea
              label={t("Special")}
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              helperText=""
              placeholder={t("Spell effect description")}
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={
        <SharedSpellCard
          item={{ ...data, effect: data.special?.join("; ") ?? "" }}
        />
      }
      addButton={<AddToCompendiumButton itemType="npc-spell" data={data} />}
      data={data}
      itemName={data.name}
      exportDataType="spells"
    />
  );
}

// NPC Special Rule panel

function NpcSpecialPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [effect, setEffect] = useState("");
  const [spCost, setSpCost] = useState("1");

  const data = {
    name: name.trim(),
    effect: effect.trim(),
    spCost: spCost === "" ? 1 : Number(spCost),
  };

  const handleClear = () => {
    setName("");
    setEffect("");
    setSpCost("1");
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <Grid size={12}>
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
              sm: 4,
            }}
          >
            <TextField
              label={t("SP Cost")}
              value={spCost}
              onChange={(e) => setSpCost(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Grid>
          <Grid size={12}>
            <CustomTextarea
              label={t("Effect")}
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              helperText=""
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedSpecialRuleCard item={data} />}
      addButton={<AddToCompendiumButton itemType="npc-special" data={data} />}
      data={data}
      itemName={data.name || ""}
      exportDataType="special"
    />
  );
}

// NPC Other Action panel

function NpcActionPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [effect, setEffect] = useState("");
  const [spCost, setSpCost] = useState("1");

  const data = {
    name: name.trim(),
    effect: effect.trim(),
    spCost: spCost === "" ? 1 : Number(spCost),
  };

  const handleClear = () => {
    setName("");
    setEffect("");
    setSpCost("1");
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <Grid size={12}>
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
              sm: 4,
            }}
          >
            <TextField
              label={t("SP Cost")}
              value={spCost}
              onChange={(e) => setSpCost(e.target.value)}
              fullWidth
              size="small"
              type="number"
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Grid>
          <Grid size={12}>
            <CustomTextarea
              label={t("Effect")}
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              helperText=""
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedActionCard item={data} />}
      addButton={<AddToCompendiumButton itemType="npc-action" data={data} />}
      data={data}
      itemName={data.name || ""}
      exportDataType="actions"
    />
  );
}

// Player Spell panel

const NON_STATIC_TYPES = [
  { value: "default", label: "Standard Spell" },
  { value: "gift", label: "Gift" },
  { value: "dance", label: "Dance" },
  { value: "therioform", label: "Therioform" },
  { value: "magichant-key", label: "Key (Chanter)" },
  { value: "magichant", label: "Tone (Chanter)" },
  { value: "symbol", label: "Symbol" },
  { value: "invocation", label: "Invocation" },
  { value: "arcanist", label: "Arcanum" },
  { value: "arcanist-rework", label: "Arcanum (Rework)" },
  { value: "tinkerer-alchemy", label: "Alchemy" },
  { value: "tinkerer-infusion", label: "Infusion" },
  { value: "cooking", label: "Delicacy" },
  { value: "magiseed", label: "Magiseed" },
  { value: "pilot-vehicle", label: "Pilot Vehicle" },
];

const WELLSPRINGS = ["Air", "Earth", "Fire", "Lightning", "Water"];
const INV_TYPES = ["Blast", "Hex", "Utility"];
const PILOT_SUBTYPES = [
  { value: "frame", label: "Vehicle Frame" },
  { value: "armor", label: "Armor Module" },
  { value: "weapon", label: "Weapon Module" },
  { value: "support", label: "Support Module" },
];
const PILOT_WEAPON_CATEGORIES = [
  "Arcane",
  "Brawling",
  "Bow",
  "Dagger",
  "Firearm",
  "Flail",
  "Heavy",
  "Spear",
  "Sword",
];
const PILOT_DAMAGE_TYPES = [
  "Physical",
  "Air",
  "Bolt",
  "Dark",
  "Earth",
  "Fire",
  "Ice",
  "Light",
  "Poison",
];
const PILOT_ATTRS = ["dexterity", "insight", "might", "willpower"];
const PILOT_RANGES = ["Melee", "Ranged"];
const MAGICHANT_KEY_TYPES = Array.from(
  new Set(availableMagichantKeys.map((k) => k.type).filter(Boolean)),
);
const MAGICHANT_KEY_STATUSES = Array.from(
  new Set(availableMagichantKeys.map((k) => k.status).filter(Boolean)),
);
const MAGICHANT_KEY_ATTRIBUTES = Array.from(
  new Set(availableMagichantKeys.map((k) => k.attribute).filter(Boolean)),
);
const MAGICHANT_KEY_RECOVERIES = Array.from(
  new Set(availableMagichantKeys.map((k) => k.recovery).filter(Boolean)),
);

function PlayerSpellPanel() {
  const { t } = useTranslate();
  const [spellType, setSpellType] = useState("default");
  const [spellClass, setSpellClass] = useState(spellClasses[0] ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOffensive, setIsOffensive] = useState(false);
  const [mp, setMp] = useState("");
  const [perTarget, setPerTarget] = useState(true);
  const [maxTargets, setMaxTargets] = useState("1");
  const [targetDescription, setTargetDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [attr1, setAttr1] = useState("insight");
  const [attr2, setAttr2] = useState("will");
  const [damage, setDamage] = useState("");
  const [damageType, setDamageType] = useState("physical");
  const [hrZero, setHrZero] = useState(false);
  // Non-static type fields
  const [effect, setEffect] = useState("");
  const [event, setEvent] = useState("");
  const [genoclepsis, setGenoclepsis] = useState("");
  const [keyType, setKeyType] = useState("");
  const [keyStatus, setKeyStatus] = useState("");
  const [keyAttribute, setKeyAttribute] = useState("");
  const [keyRecovery, setKeyRecovery] = useState("");
  const [wellspring, setWellspring] = useState("");
  const [invType, setInvType] = useState("");
  // arcanist / arcanist-rework
  const [domain, setDomain] = useState("");
  const [domainDesc, setDomainDesc] = useState("");
  const [merge, setMerge] = useState("");
  const [mergeDesc, setMergeDesc] = useState("");
  const [dismiss, setDismiss] = useState("");
  const [dismissDesc, setDismissDesc] = useState("");
  const [pulse, setPulse] = useState("");
  const [pulseDesc, setPulseDesc] = useState("");
  // tinkerer-alchemy, pilot-vehicle
  const [itemCategory, setItemCategory] = useState("");
  // tinkerer-infusion
  const [infusionRank, setInfusionRank] = useState("");
  // cooking : 12 roll-result effects (indices 0-11 = results 1-12)
  const [cookingEffects, setCookingEffects] = useState(
    Array.from({ length: 12 }, () => ""),
  );
  // magiseed
  const [seedDescription, setSeedDescription] = useState("");
  const [seedRangeStart, setSeedRangeStart] = useState(1);
  const [seedRangeEnd, setSeedRangeEnd] = useState(4);
  const [seedEffects, setSeedEffects] = useState({});
  // pilot-vehicle
  const [pilotSubtype, setPilotSubtype] = useState("frame");
  const [vehicleFrame, setVehicleFrame] = useState(
    availableFrames[0]?.name ?? "",
  );
  const [moduleDef, setModuleDef] = useState("");
  const [moduleMdef, setModuleMdef] = useState("");
  const [moduleMartial, setModuleMartial] = useState(false);
  const [moduleDamage, setModuleDamage] = useState("");
  const [moduleRange, setModuleRange] = useState("");
  const [modulePrec, setModulePrec] = useState(0);
  const [moduleCumbersome, setModuleCumbersome] = useState(false);
  const [moduleCost, setModuleCost] = useState(0);
  const [moduleDescription, setModuleDescription] = useState("");
  // weapon-specific
  const [weaponCategory, setWeaponCategory] = useState("Heavy");
  const [pilotAtt1, setPilotAtt1] = useState("might");
  const [pilotAtt2, setPilotAtt2] = useState("dexterity");
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [isShield, setIsShield] = useState(false);

  const handleClear = () => {
    setSpellType("default");
    setSpellClass(spellClasses[0] ?? "");
    setName("");
    setDescription("");
    setIsOffensive(false);
    setMp("");
    setPerTarget(true);
    setMaxTargets("1");
    setTargetDescription("");
    setDuration("");
    setAttr1("insight");
    setAttr2("will");
    setDamage("");
    setDamageType("physical");
    setHrZero(false);
    setEffect("");
    setEvent("");
    setGenoclepsis("");
    setKeyType("");
    setKeyStatus("");
    setKeyAttribute("");
    setKeyRecovery("");
    setWellspring("");
    setInvType("");
    setDomain("");
    setDomainDesc("");
    setMerge("");
    setMergeDesc("");
    setDismiss("");
    setDismissDesc("");
    setPulse("");
    setPulseDesc("");
    setItemCategory("");
    setInfusionRank("");
    setCookingEffects(Array.from({ length: 12 }, () => ""));
    setSeedDescription("");
    setSeedRangeStart(1);
    setSeedRangeEnd(4);
    setSeedEffects({});
    setPilotSubtype("frame");
    setVehicleFrame(availableFrames[0]?.name ?? "");
    setModuleDef("");
    setModuleMdef("");
    setModuleMartial(false);
    setModuleDamage("");
    setModuleRange("");
    setModulePrec(0);
    setModuleCumbersome(false);
    setModuleCost(0);
    setModuleDescription("");
    setWeaponCategory("Heavy");
    setDamageType("Physical");
    setPilotAtt1("might");
    setPilotAtt2("dexterity");
    setQuality("");
    setQualityCost(0);
    setIsShield(false);
  };

  const data = {
    class: spellClass,
    name: name.trim(),
    description: description.trim(),
    isOffensive,
    cost: { resource: "mp", amount: mp === "" ? 0 : Number(mp), perTarget },
    maxTargets: maxTargets === "" ? 1 : Number(maxTargets),
    targetDescription: targetDescription.trim() || "One creature",
    duration: duration.trim() || "Instantaneous",
    accuracy: { attr1, attr2, value: 0, defense: "mdef" },
    damage: {
      value: isOffensive && damage !== "" ? Number(damage) : 0,
      type: isOffensive ? damageType : "physical",
      hrZero,
    },
    spellType: "default",
  };

  const nonStaticData =
    spellType === "default"
      ? null
      : {
          name: name.trim(),
          spellType: spellType === "magichant-key" ? "magichant" : spellType,
          magichantSubtype:
            spellType === "magichant-key"
              ? "key"
              : spellType === "magichant"
                ? "tone"
                : undefined,
          // generic effect/description (therioform, magichant, symbol, dance, gift, tinkerer-infusion, etc.)
          effect: effect.trim(),
          description: effect.trim(),
          event: event.trim(),
          genoclepsis: genoclepsis.trim() || undefined,
          status:
            spellType === "magichant-key"
              ? keyStatus.trim() || undefined
              : undefined,
          attribute:
            spellType === "magichant-key"
              ? keyAttribute.trim() || undefined
              : undefined,
          recovery:
            spellType === "magichant-key"
              ? keyRecovery.trim() || undefined
              : undefined,
          duration: duration || undefined,
          // invocation
          wellspring: wellspring.trim() || undefined,
          type:
            spellType === "magichant-key"
              ? keyType.trim() || undefined
              : invType.trim() || undefined,
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
            cookbookEffects: cookingEffects.map((fx, i) => ({
              id: i + 1,
              effect: fx.trim(),
              customChoices: {},
            })),
          }),
          // magiseed
          ...(spellType === "magiseed" && {
            description: seedDescription.trim(),
            rangeStart: Number(seedRangeStart),
            rangeEnd: Number(seedRangeEnd),
            effects: seedEffects,
          }),
          // pilot-vehicle : flat structure per subtype for later import into player-edit
          ...(spellType === "pilot-vehicle" &&
            (() => {
              const frameData = availableFrames.find(
                (f) => f.name === vehicleFrame,
              );
              const base = {
                pilotSubtype,
                customName: name.trim(),
                enabled: false,
                equipped: false,
                equippedSlot: null,
              };
              if (pilotSubtype === "frame")
                return {
                  ...base,
                  frame: vehicleFrame,
                  passengers: frameData?.passengers ?? 0,
                  distance: frameData?.distance ?? 1,
                  description: effect.trim(),
                };
              if (pilotSubtype === "armor")
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
              if (pilotSubtype === "weapon")
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
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid
            size={{
              xs: 12,
              sm: 5,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t("Spell Type")}</InputLabel>
              <Select
                value={spellType}
                label={t("Spell Type")}
                onChange={(e) => setSpellType(e.target.value)}
              >
                {NON_STATIC_TYPES.map((st) => (
                  <MenuItem key={st.value} value={st.value}>
                    {t(st.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {spellType === "default" && (
            <Grid
              size={{
                xs: 12,
                sm: 7,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>{t("Class")}</InputLabel>
                <Select
                  value={spellClass}
                  label={t("Class")}
                  onChange={(e) => setSpellClass(e.target.value)}
                >
                  {spellClasses.map((c) => (
                    <MenuItem key={c} value={c}>
                      {t(c)}
                    </MenuItem>
                  ))}
                  <MenuItem value="">{t("Custom")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {spellType !== "default" ? (
            <Grid
              container
              spacing={2}
              sx={{ alignItems: "center", mt: 0, ml: 0 }}
            >
              <Grid size={12}>
                <TextField
                  label={t("Name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  size="small"
                  autoFocus
                />
              </Grid>

              {/* Gift */}
              {spellType === "gift" && (
                <Grid size={12}>
                  <TextField
                    label={t("Event / Trigger")}
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
              )}

              {/* Therioform */}
              {spellType === "therioform" && (
                <Grid size={12}>
                  <TextField
                    label={t("Genoclepsis (optional)")}
                    value={genoclepsis}
                    onChange={(e) => setGenoclepsis(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
              )}

              {/* Magichant Key */}
              {spellType === "magichant-key" && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("magichant_type")}</InputLabel>
                      <Select
                        value={keyType}
                        label={t("magichant_type")}
                        onChange={(e) => setKeyType(e.target.value)}
                      >
                        <MenuItem value="">{t("Select")}</MenuItem>
                        {MAGICHANT_KEY_TYPES.map((value) => (
                          <MenuItem key={value} value={value}>
                            {t(value)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("magichant_status_effect")}</InputLabel>
                      <Select
                        value={keyStatus}
                        label={t("magichant_status_effect")}
                        onChange={(e) => setKeyStatus(e.target.value)}
                      >
                        <MenuItem value="">{t("Select")}</MenuItem>
                        {MAGICHANT_KEY_STATUSES.map((value) => (
                          <MenuItem key={value} value={value}>
                            {t(value)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("magichant_attribute")}</InputLabel>
                      <Select
                        value={keyAttribute}
                        label={t("magichant_attribute")}
                        onChange={(e) => setKeyAttribute(e.target.value)}
                      >
                        <MenuItem value="">{t("Select")}</MenuItem>
                        {MAGICHANT_KEY_ATTRIBUTES.map((value) => (
                          <MenuItem key={value} value={value}>
                            {t(value)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("magichant_recovery")}</InputLabel>
                      <Select
                        value={keyRecovery}
                        label={t("magichant_recovery")}
                        onChange={(e) => setKeyRecovery(e.target.value)}
                      >
                        <MenuItem value="">{t("Select")}</MenuItem>
                        {MAGICHANT_KEY_RECOVERIES.map((value) => (
                          <MenuItem key={value} value={value}>
                            {t(value)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Dance */}
              {spellType === "dance" && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Autocomplete
                    freeSolo
                    options={DURATION_OPTIONS.map(t)}
                    inputValue={duration}
                    onInputChange={(_, v) => setDuration(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("Duration")}
                        size="small"
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Invocation */}
              {spellType === "invocation" && (
                <>
                  <Grid size={6}>
                    <Autocomplete
                      options={WELLSPRINGS}
                      value={wellspring || null}
                      onChange={(_, v) => setWellspring(v ?? "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("Wellspring")}
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Autocomplete
                      options={INV_TYPES}
                      value={invType || null}
                      onChange={(_, v) => setInvType(v ?? "")}
                      renderInput={(params) => (
                        <TextField {...params} label={t("Type")} size="small" />
                      )}
                    />
                  </Grid>
                </>
              )}

              {/* Arcanum / Arcanum Rework */}
              {(spellType === "arcanist" ||
                spellType === "arcanist-rework") && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <TextField
                      label={t("Domain name")}
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomTextarea
                      label={t("Domain effect")}
                      value={domainDesc}
                      onChange={(e) => setDomainDesc(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <TextField
                      label={t("Merge name")}
                      value={merge}
                      onChange={(e) => setMerge(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomTextarea
                      label={t("Merge effect")}
                      value={mergeDesc}
                      onChange={(e) => setMergeDesc(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                  {spellType === "arcanist-rework" && (
                    <>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 4,
                        }}
                      >
                        <TextField
                          label={t("Pulse name")}
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid size={12}>
                        <CustomTextarea
                          label={t("Pulse effect")}
                          value={pulseDesc}
                          onChange={(e) => setPulseDesc(e.target.value)}
                          helperText=""
                        />
                      </Grid>
                    </>
                  )}
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <TextField
                      label={t("Dismiss name")}
                      value={dismiss}
                      onChange={(e) => setDismiss(e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomTextarea
                      label={t("Dismiss effect")}
                      value={dismissDesc}
                      onChange={(e) => setDismissDesc(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                </>
              )}

              {/* Tinkerer Alchemy */}
              {spellType === "tinkerer-alchemy" && (
                <Grid size={12}>
                  <TextField
                    label={t("Category")}
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
              )}

              {/* Tinkerer Infusion */}
              {spellType === "tinkerer-infusion" && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 4,
                  }}
                >
                  <TextField
                    label={t("Rank")}
                    value={infusionRank}
                    onChange={(e) => setInfusionRank(e.target.value)}
                    fullWidth
                    size="small"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 1, max: 3 },
                    }}
                  />
                </Grid>
              )}

              {/* Cooking : one text field per roll result 1-12 */}
              {spellType === "cooking" && (
                <>
                  {cookingEffects.map((fx, i) => (
                    <Grid key={i} size={12}>
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

              {/* Magiseed : description + per-tick effects */}
              {spellType === "magiseed" && (
                <>
                  <Grid
                    size={{
                      xs: 6,
                      sm: 3,
                    }}
                  >
                    <TextField
                      label={t("Range Start")}
                      value={seedRangeStart}
                      type="number"
                      fullWidth
                      size="small"
                      onChange={(e) =>
                        setSeedRangeStart(Number(e.target.value))
                      }
                      slotProps={{
                        htmlInput: { min: 0, max: 4 },
                      }}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 6,
                      sm: 3,
                    }}
                  >
                    <TextField
                      label={t("Range End")}
                      value={seedRangeEnd}
                      type="number"
                      fullWidth
                      size="small"
                      onChange={(e) => setSeedRangeEnd(Number(e.target.value))}
                      slotProps={{
                        htmlInput: { min: 1, max: 6 },
                      }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomTextarea
                      label={t("Description")}
                      value={seedDescription}
                      onChange={(e) => setSeedDescription(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                  {Array.from(
                    { length: seedRangeEnd - seedRangeStart + 1 },
                    (_, i) => {
                      const tick = seedRangeStart + i;
                      return (
                        <Grid key={tick} size={12}>
                          <CustomTextarea
                            label={`${t("Tick")} ${tick}`}
                            value={seedEffects[tick] ?? ""}
                            onChange={(e) =>
                              setSeedEffects((prev) => ({
                                ...prev,
                                [tick]: e.target.value,
                              }))
                            }
                            helperText=""
                          />
                        </Grid>
                      );
                    },
                  )}
                </>
              )}

              {/* Pilot Vehicle */}
              {spellType === "pilot-vehicle" && (
                <>
                  <Grid size={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t("Component Type")}</InputLabel>
                      <Select
                        value={pilotSubtype}
                        label={t("Component Type")}
                        onChange={(e) => setPilotSubtype(e.target.value)}
                      >
                        {PILOT_SUBTYPES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {t(s.label)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Frame */}
                  {pilotSubtype === "frame" && (
                    <Grid size={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Frame")}</InputLabel>
                        <Select
                          value={vehicleFrame}
                          label={t("Frame")}
                          onChange={(e) => setVehicleFrame(e.target.value)}
                        >
                          {availableFrames.map((f) => (
                            <MenuItem key={f.name} value={f.name}>
                              {t(f.name)} - {t("Passengers")}: {f.passengers} |{" "}
                              {t("Distance")}: {f.distance}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {/* Cost : shown for all module types */}
                  {pilotSubtype !== "frame" && (
                    <Grid
                      size={{
                        xs: 6,
                        sm: 4,
                      }}
                    >
                      <TextField
                        label={t("Cost")}
                        value={moduleCost}
                        type="number"
                        fullWidth
                        size="small"
                        onChange={(e) => setModuleCost(e.target.value)}
                        slotProps={{
                          htmlInput: { min: 0 },
                        }}
                      />
                    </Grid>
                  )}

                  {/* Armor Module */}
                  {pilotSubtype === "armor" && (
                    <>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 3,
                        }}
                      >
                        <TextField
                          label="DEF"
                          value={moduleDef}
                          type="number"
                          fullWidth
                          size="small"
                          onChange={(e) => setModuleDef(e.target.value)}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 3,
                        }}
                      >
                        <TextField
                          label="MDEF"
                          value={moduleMdef}
                          type="number"
                          fullWidth
                          size="small"
                          onChange={(e) => setModuleMdef(e.target.value)}
                        />
                      </Grid>
                      <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={{
                          xs: 4,
                          sm: 2,
                        }}
                      >
                        <ToggleButton
                          value="martial"
                          selected={moduleMartial}
                          onChange={() => setModuleMartial((v) => !v)}
                          size="small"
                          sx={{ width: "100%" }}
                        >
                          {t("Martial")}
                        </ToggleButton>
                      </Grid>
                      <Grid size={12}>
                        <CustomTextarea
                          label={t("Description (optional)")}
                          value={moduleDescription}
                          onChange={(e) => setModuleDescription(e.target.value)}
                          helperText=""
                        />
                      </Grid>
                    </>
                  )}

                  {/* Weapon Module */}
                  {pilotSubtype === "weapon" && (
                    <>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 4,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Category")}</InputLabel>
                          <Select
                            value={weaponCategory}
                            label={t("Category")}
                            onChange={(e) => setWeaponCategory(e.target.value)}
                          >
                            {PILOT_WEAPON_CATEGORIES.map((c) => (
                              <MenuItem key={c} value={c}>
                                {c}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 4,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Damage Type")}</InputLabel>
                          <Select
                            value={damageType}
                            label={t("Damage Type")}
                            onChange={(e) => setDamageType(e.target.value)}
                            renderValue={(selected) =>
                              renderDamageTypeValue(
                                String(selected).toLowerCase(),
                                t,
                              )
                            }
                          >
                            {PILOT_DAMAGE_TYPES.map((d) => (
                              <MenuItem key={d} value={d}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <TypeIcon type={String(d).toLowerCase()} />
                                  <span>
                                    {String(d).replace(/\b\w/g, (char) =>
                                      char.toUpperCase(),
                                    )}
                                  </span>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 4,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Range")}</InputLabel>
                          <Select
                            value={moduleRange || "Melee"}
                            label={t("Range")}
                            onChange={(e) => setModuleRange(e.target.value)}
                          >
                            {PILOT_RANGES.map((r) => (
                              <MenuItem key={r} value={r}>
                                {r}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 3,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Att 1")}</InputLabel>
                          <Select
                            value={pilotAtt1}
                            label={t("Att 1")}
                            onChange={(e) => setPilotAtt1(e.target.value)}
                          >
                            {PILOT_ATTRS.map((a) => (
                              <MenuItem key={a} value={a}>
                                {t(a)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          sm: 3,
                        }}
                      >
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Att 2")}</InputLabel>
                          <Select
                            value={pilotAtt2}
                            label={t("Att 2")}
                            onChange={(e) => setPilotAtt2(e.target.value)}
                          >
                            {PILOT_ATTRS.map((a) => (
                              <MenuItem key={a} value={a}>
                                {t(a)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 2,
                        }}
                      >
                        <TextField
                          label="HR+"
                          value={moduleDamage}
                          type="number"
                          fullWidth
                          size="small"
                          onChange={(e) => setModuleDamage(e.target.value)}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 2,
                        }}
                      >
                        <TextField
                          label={t("+Acc")}
                          value={modulePrec}
                          type="number"
                          fullWidth
                          size="small"
                          onChange={(e) => setModulePrec(e.target.value)}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 4,
                          sm: 2,
                        }}
                      >
                        <TextField
                          label={t("Quality Cost")}
                          value={qualityCost}
                          type="number"
                          fullWidth
                          size="small"
                          onChange={(e) => setQualityCost(e.target.value)}
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          label={t("Quality")}
                          value={quality}
                          fullWidth
                          size="small"
                          onChange={(e) => setQuality(e.target.value)}
                        />
                      </Grid>
                      <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={6}
                      >
                        <ToggleButton
                          value="cumbersome"
                          selected={moduleCumbersome}
                          onChange={() => setModuleCumbersome((v) => !v)}
                          size="small"
                          sx={{ width: "100%" }}
                        >
                          {t("Cumbersome")}
                        </ToggleButton>
                      </Grid>
                      <Grid
                        sx={{ display: "flex", alignItems: "center" }}
                        size={6}
                      >
                        <ToggleButton
                          value="isShield"
                          selected={isShield}
                          onChange={() => setIsShield((v) => !v)}
                          size="small"
                          sx={{ width: "100%" }}
                        >
                          {t("Shield")}
                        </ToggleButton>
                      </Grid>
                    </>
                  )}
                </>
              )}

              {/* Generic effect/description for types that use it */}
              {!(
                spellType === "arcanist" ||
                spellType === "arcanist-rework" ||
                spellType === "cooking" ||
                spellType === "magiseed" ||
                spellType === "magichant-key"
              ) &&
                !(
                  spellType === "pilot-vehicle" &&
                  (pilotSubtype === "armor" || pilotSubtype === "weapon")
                ) && (
                  <Grid size={12}>
                    <CustomTextarea
                      label={
                        spellType === "therioform" ||
                        spellType === "pilot-vehicle"
                          ? t("Description")
                          : t("Effect")
                      }
                      value={effect}
                      onChange={(e) => setEffect(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                )}
            </Grid>
          ) : (
            <>
              <Grid
                size={{
                  xs: 10,
                  sm: 6,
                }}
              >
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
                  xs: 2,
                  sm: 1,
                }}
              >
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
                  sm: 3,
                }}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  label={perTarget ? t("MP x Target") : t("MP")}
                  value={mp}
                  onChange={(e) => setMp(e.target.value)}
                  sx={{ flex: 1 }}
                  size="small"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0 },
                  }}
                />
                <Switch
                  size="small"
                  checked={perTarget}
                  onChange={(e) => setPerTarget(e.target.checked)}
                />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3,
                }}
              >
                <TextField
                  label={t("Max Targets")}
                  value={maxTargets}
                  onChange={(e) => setMaxTargets(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 0 },
                  }}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Autocomplete
                  freeSolo
                  options={TARGET_OPTIONS.map(t)}
                  inputValue={targetDescription}
                  onInputChange={(_, v) => {
                    setTargetDescription(v);
                    if (
                      ["Self", "One creature", "One equipped weapon"].includes(
                        v,
                      )
                    )
                      setPerTarget(false);
                    else if (v.startsWith("Up to")) setPerTarget(true);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t("Target")} size="small" />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Autocomplete
                  freeSolo
                  options={DURATION_OPTIONS.map(t)}
                  inputValue={duration}
                  onInputChange={(_, v) => setDuration(v)}
                  renderInput={(params) => (
                    <TextField {...params} label={t("Duration")} size="small" />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Attr 1")}</InputLabel>
                  <Select
                    value={attr1}
                    label={t("Attr 1")}
                    onChange={(e) => setAttr1(e.target.value)}
                  >
                    {ATTRS.map((a) => (
                      <MenuItem key={a.value} value={a.value}>
                        {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  sm: 3,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Attr 2")}</InputLabel>
                  <Select
                    value={attr2}
                    label={t("Attr 2")}
                    onChange={(e) => setAttr2(e.target.value)}
                  >
                    {ATTRS.map((a) => (
                      <MenuItem key={a.value} value={a.value}>
                        {a.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {isOffensive && (
                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <FormControl fullWidth size="small">
                    <InputLabel>{t("Damage Type")}</InputLabel>
                    <Select
                      value={damageType}
                      label={t("Damage Type")}
                      onChange={(e) => setDamageType(e.target.value)}
                      renderValue={(selected) =>
                        renderDamageTypeValue(selected, t)
                      }
                    >
                      {Object.keys(types).map((type) => (
                        <MenuItem key={type} value={type}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TypeIcon type={type} />
                            <span>
                              {String(types[type].long).replace(
                                /\b\w/g,
                                (char) => char.toUpperCase(),
                              )}
                            </span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {isOffensive && (
                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <TextField
                    label={t("Damage")}
                    value={damage}
                    onChange={(e) => setDamage(e.target.value)}
                    fullWidth
                    size="small"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />
                </Grid>
              )}
              {isOffensive && (
                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hrZero}
                        onChange={(e) => setHrZero(e.target.checked)}
                        size="small"
                      />
                    }
                    label="HR0"
                  />
                </Grid>
              )}
              <Grid size={12}>
                <CustomTextarea
                  label={t("Description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText=""
                />
              </Grid>
            </>
          )}
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={
        spellType === "default" ? (
          <SharedPlayerSpellCard item={data} />
        ) : spellType === "gamble" ? (
          <SharedGambleSpellCard item={nonStaticData} />
        ) : spellType === "gift" ? (
          <SharedGiftCard item={nonStaticData} />
        ) : spellType === "dance" ? (
          <SharedDanceCard item={nonStaticData} />
        ) : spellType === "therioform" ? (
          <SharedTherioformCard item={nonStaticData} />
        ) : spellType === "magichant" || spellType === "magichant-key" ? (
          <SharedMagichantCard item={nonStaticData} />
        ) : spellType === "symbol" ? (
          <SharedSymbolCard item={nonStaticData} />
        ) : spellType === "invocation" ? (
          <SharedInvocationCard item={nonStaticData} />
        ) : spellType === "magiseed" ? (
          <SharedMagiseedCard item={nonStaticData} />
        ) : spellType === "tinkerer-alchemy" ? (
          <SharedAlchemyCard item={nonStaticData} />
        ) : spellType === "tinkerer-infusion" ? (
          <SharedInfusionCard item={nonStaticData} />
        ) : spellType === "tinkerer-magitech" ? (
          <SharedMagitechCard item={nonStaticData} />
        ) : spellType === "cooking" ? (
          <SharedCookingCard item={nonStaticData} />
        ) : spellType === "pilot-vehicle" ? (
          <SharedPilotVehicleCard item={nonStaticData} />
        ) : spellType === "arcanist" || spellType === "arcanist-rework" ? (
          <SharedArcanumCard item={nonStaticData} />
        ) : (
          <SharedPlayerSpellCard item={data} />
        )
      }
      addButton={
        <AddToCompendiumButton
          itemType="player-spell"
          data={spellType === "default" ? data : nonStaticData}
        />
      }
      exportDataType="player-spells"
    />
  );
}

// Quality panel

function QualityPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(QUALITY_CATEGORIES[0]);
  const [quality, setQuality] = useState("");
  const [cost, setCost] = useState(0);
  const [filter, setFilter] = useState([]);
  const [qualityTab, setQualityTab] = useState(0);

  const data = {
    name: name.trim(),
    category,
    quality: quality.trim(),
    cost: Number(cost),
    filter,
  };

  const handleClear = () => {
    setName("");
    setCategory(QUALITY_CATEGORIES[0]);
    setQuality("");
    setCost(0);
    setFilter([]);
  };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Box>
          <Tabs
            value={qualityTab}
            onChange={(_, v) => setQualityTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label={t("Custom")} />
            <Tab label={t("Generator")} />
          </Tabs>
          {qualityTab === 0 ? (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  options={qualities}
                  getOptionLabel={(q) => q.name}
                  onChange={(_, q) => {
                    if (q) {
                      setName(q.name);
                      setCategory(q.category);
                      setQuality(q.quality);
                      setCost(q.cost);
                      setFilter(q.filter || []);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("Select Existing Quality")}
                      size="small"
                    />
                  )}
                  size="small"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
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
                  sm: 6,
                }}
              >
                <FormControl fullWidth>
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
              <Grid size={12}>
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
                  sm: 6,
                }}
              >
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
                  sm: 6,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="qc-filter-label">
                    {t("Applicable to")}
                  </InputLabel>
                  <Select
                    labelId="qc-filter-label"
                    multiple
                    value={filter}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFilter(typeof v === "string" ? v.split(",") : v);
                    }}
                    input={<OutlinedInput label={t("Applicable to")} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((v) => (
                          <Chip
                            key={v}
                            label={t(
                              FILTER_OPTIONS.find((o) => o.value === v)
                                ?.label ?? v,
                            )}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {FILTER_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {t(o.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <QualitiesGenerator onGenerate={(text) => setQuality(text)} />
          )}
          <Box sx={{ mt: 2 }}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Box>
        </Box>
      }
      previewContent={<SharedQualityCard item={data} />}
      addButton={<AddToCompendiumButton itemType="quality" data={data} />}
      exportDataType="qualities"
    />
  );
}

// Heroic panel

function HeroicPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [book, setBook] = useState("");
  const [quote, setQuote] = useState("");
  const [description, setDescription] = useState("");
  const [applicableTo, setApplicableTo] = useState([]);

  const data = {
    name: name.trim(),
    book,
    quote: quote.trim(),
    description: description.trim(),
    applicableTo,
  };

  const handleClear = () => {
    setName("");
    setBook("");
    setQuote("");
    setDescription("");
    setApplicableTo([]);
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              slotProps={{
                htmlInput: { maxLength: 50 },
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t("Book")}</InputLabel>
              <Select
                value={book}
                label={t("Book")}
                onChange={(e) => setBook(e.target.value)}
              >
                <MenuItem value="">{t("None")}</MenuItem>
                {HEROIC_BOOK_OPTIONS.map((b) => (
                  <MenuItem
                    key={b}
                    value={b}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {b}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              options={CLASS_NAME_OPTIONS}
              value={applicableTo}
              onChange={(_, v) => setApplicableTo(v)}
              freeSolo
              renderValue={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                  />
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
          <Grid size={12}>
            <TextField
              label={t("Quote")}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              fullWidth
              size="small"
              slotProps={{
                htmlInput: { maxLength: 200 },
              }}
            />
          </Grid>
          <Grid size={12}>
            <CustomTextarea
              label={t("Description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText=""
              maxLength={1500}
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedHeroicCard item={data} />}
      addButton={<AddToCompendiumButton itemType="heroic" data={data} />}
      data={data}
      itemName={data.name || ""}
      exportDataType="heroics"
    />
  );
}

// Class panel (inline form)

// const BLANK_BENEFITS = {
//   hpplus: 0, mpplus: 0, ipplus: 0, isCustomBenefit: false,
//   martials: { armor: false, shields: false, melee: false, ranged: false },
//   rituals: { ritualism: false },
//   custom: [], spellClasses: [],
// };

const BLANK_SKILL = {
  skillName: "",
  maxLvl: 1,
  description: "",
  specialSkill: "",
  currentLvl: 0,
};

function ClassPanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [book, setBook] = useState("homebrew");
  const [hpplus, setHpplus] = useState(0);
  const [mpplus, setMpplus] = useState(0);
  const [ipplus, setIpplus] = useState(0);
  const [martials, setMartials] = useState({
    armor: false,
    shields: false,
    melee: false,
    ranged: false,
  });
  const [ritualism, setRitualism] = useState(false);
  const [customBenefits, setCustomBenefits] = useState([]);
  const [customBenefitToDelete, setCustomBenefitToDelete] = useState(null);
  const [spellClassesSelected, setSpellClassesSelected] = useState([]);
  const [skills, setSkills] = useState(
    Array.from({ length: 5 }, () => ({ ...BLANK_SKILL })),
  );

  const updateSkillField = (idx, field, value) =>
    setSkills((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );

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

  const handleClear = () => {
    setName("");
    setBook("homebrew");
    setHpplus(0);
    setMpplus(0);
    setIpplus(0);
    setMartials({ armor: false, shields: false, melee: false, ranged: false });
    setRitualism(false);
    setCustomBenefits([]);
    setCustomBenefitToDelete(null);
    setSpellClassesSelected([]);
    setSkills(Array.from({ length: 5 }, () => ({ ...BLANK_SKILL })));
  };

  return (
    <>
      <PanelLayout
        formContent={
          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 8,
                sm: 9,
              }}
            >
              <TextField
                label={t("Class Name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                size="small"
                autoFocus
                slotProps={{
                  htmlInput: { maxLength: 50 },
                }}
              />
            </Grid>
            <Grid
              size={{
                xs: 4,
                sm: 3,
              }}
            >
              <Autocomplete
                freeSolo
                options={CLASS_BOOK_SUGGESTIONS}
                inputValue={book}
                onInputChange={(_, v) => setBook(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Book")}
                    size="small"
                    placeholder="homebrew"
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  mb: 0.5,
                }}
              >
                {t("Free Benefits")}
              </Typography>
            </Grid>
            <Grid size={4}>
              <TextField
                label={t("HP+")}
                type="number"
                value={hpplus}
                onChange={(e) => setHpplus(Number(e.target.value))}
                fullWidth
                size="small"
                slotProps={{
                  htmlInput: { min: 0, step: 5 },
                }}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label={t("MP+")}
                type="number"
                value={mpplus}
                onChange={(e) => setMpplus(Number(e.target.value))}
                fullWidth
                size="small"
                slotProps={{
                  htmlInput: { min: 0, step: 5 },
                }}
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label={t("IP+")}
                type="number"
                value={ipplus}
                onChange={(e) => setIpplus(Number(e.target.value))}
                fullWidth
                size="small"
                slotProps={{
                  htmlInput: { min: 0, step: 2 },
                }}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {[
                  { key: "melee", label: t("Martial Melee") },
                  { key: "ranged", label: t("Martial Ranged") },
                  { key: "shields", label: t("Martial Shields") },
                  { key: "armor", label: t("Martial Armor") },
                ].map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    size="small"
                    clickable
                    color={martials[key] ? "primary" : "default"}
                    variant={martials[key] ? "filled" : "outlined"}
                    onClick={() =>
                      setMartials((m) => ({ ...m, [key]: !m[key] }))
                    }
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

            {customBenefits.map((cb, i) => (
              <Grid
                key={i}
                sx={{ display: "flex", gap: 1, alignItems: "center" }}
                size={12}
              >
                <TextField
                  label={`${t("Custom Benefit")} ${i + 1}`}
                  value={cb}
                  onChange={(e) =>
                    setCustomBenefits((arr) =>
                      arr.map((v, j) => (j === i ? e.target.value : v)),
                    )
                  }
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: { maxLength: 500 },
                  }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setCustomBenefitToDelete(i)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            ))}
            <Grid size={12}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setCustomBenefits((arr) => [...arr, ""])}
              >
                + {t("Add Custom Benefit")}
              </Button>
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  mb: 0.5,
                }}
              >
                {t("Spell Types")}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {spellClassesList.map((sc) => (
                  <Chip
                    key={sc}
                    label={t(sc)}
                    size="small"
                    clickable
                    color={
                      spellClassesSelected.includes(sc)
                        ? "secondary"
                        : "default"
                    }
                    variant={
                      spellClassesSelected.includes(sc) ? "filled" : "outlined"
                    }
                    onClick={() =>
                      setSpellClassesSelected((prev) =>
                        prev.includes(sc)
                          ? prev.filter((s) => s !== sc)
                          : [...prev, sc],
                      )
                    }
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                {t("Skills")}
              </Typography>
            </Grid>
            {skills.map((skill, i) => (
              <Grid key={i} size={12}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1.5,
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid
                      size={{
                        xs: 9,
                        sm: 10,
                      }}
                    >
                      <TextField
                        label={`${t("Skill Name")} ${i + 1}`}
                        value={skill.skillName}
                        onChange={(e) =>
                          updateSkillField(i, "skillName", e.target.value)
                        }
                        fullWidth
                        size="small"
                        slotProps={{
                          htmlInput: { maxLength: 50 },
                        }}
                      />
                    </Grid>
                    <Grid
                      size={{
                        xs: 3,
                        sm: 2,
                      }}
                    >
                      <TextField
                        label={t("Max Lvl")}
                        type="number"
                        value={skill.maxLvl}
                        onChange={(e) =>
                          updateSkillField(
                            i,
                            "maxLvl",
                            Math.max(1, Math.min(10, Number(e.target.value))),
                          )
                        }
                        fullWidth
                        size="small"
                        slotProps={{
                          htmlInput: { min: 1, max: 10 },
                        }}
                      />
                    </Grid>
                    <Grid size={12}>
                      <CustomTextarea
                        label={t("Description")}
                        value={skill.description}
                        onChange={(e) =>
                          updateSkillField(i, "description", e.target.value)
                        }
                        helperText=""
                        maxLength={1500}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Special Skill Effect")}</InputLabel>
                        <Select
                          value={skill.specialSkill}
                          onChange={(e) =>
                            updateSkillField(i, "specialSkill", e.target.value)
                          }
                          label={t("Special Skill Effect")}
                        >
                          <MenuItem value="">
                            <em>{t("None")}</em>
                          </MenuItem>
                          {Object.keys(GROUPED_SPECIAL_SKILLS)
                            .sort((a, b) => t(a).localeCompare(t(b)))
                            .flatMap((cls) => [
                              <ListSubheader key={cls}>{t(cls)}</ListSubheader>,
                              ...GROUPED_SPECIAL_SKILLS[cls].map((s) => (
                                <MenuItem key={s.name} value={s.name}>
                                  {t(s.name)}
                                </MenuItem>
                              )),
                            ])}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
            <Grid size={12}>
              <Button size="small" variant="outlined" onClick={handleClear}>
                {t("Clear All Fields")}
              </Button>
            </Grid>
          </Grid>
        }
        previewContent={
          <SharedClassCard
            item={{
              ...classData,
              skills: classData.skills.filter((s) => s.skillName.trim()),
            }}
          />
        }
        addButton={<AddToCompendiumButton itemType="class" data={classData} />}
        data={classData}
        itemName={classData.name || ""}
        exportDataType="classes"
      />
      <DeleteConfirmationDialog
        open={customBenefitToDelete !== null}
        onClose={() => setCustomBenefitToDelete(null)}
        onConfirm={() => {
          if (customBenefitToDelete !== null) {
            setCustomBenefits((arr) =>
              arr.filter((_, j) => j !== customBenefitToDelete),
            );
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
    </>
  );
}

// Weapon panel (inline form)

function buildWeaponPanelState() {
  const base = weapons[0];
  return {
    base,
    name: base.name,
    category: base.category ?? "",
    type: getWeaponType(base),
    hands: base.hands,
    att1: getWeaponAttr1(base),
    att2: getWeaponAttr2(base),
    martial: base.martial || false,
    damageHrZero: false,
    damageBonus: false,
    damageReworkBonus: false,
    precBonus: false,
    rareBonuses: {
      precBonus: false,
      damageBonus: false,
      damageReworkBonus: false,
    },
    rework: false,
    quality: "",
    qualityCost: 0,
    totalBonus: 0,
    selectedQuality: "",
    qualityName: "",
    range: getWeaponRange(base),
    precModifier: 0,
    damageModifier: 0,
    defModifier: 0,
    mDefModifier: 0,
    isEquipped: false,
  };
}

function WeaponPanel() {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(buildWeaponPanelState);

  const {
    base,
    name,
    category,
    type,
    hands,
    att1,
    att2,
    martial,
    damageHrZero,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityCost,
    totalBonus,
    selectedQuality,
    precModifier,
    damageModifier,
    defModifier,
    mDefModifier,
  } = formState;

  const cost = calcWeaponCost({
    base,
    type,
    att1,
    att2,
    rework,
    damageBonus,
    precBonus,
    qualityCost,
  });
  const damage = calcWeaponDamage({
    base,
    hands,
    rework,
    damageBonus,
    damageReworkBonus,
    damageModifier,
    cost,
  });
  const prec = calcWeaponPrec({ base, rework, precBonus, precModifier });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      totalBonus: Math.floor(cost / 1000) * 2,
    }));
  }, [damageReworkBonus, cost, qualityCost, rework]);

  const weaponObj = normalizeWeaponLike({
    base,
    name,
    category,
    range: getWeaponRange(base),
    type,
    hands,
    att1,
    att2,
    martial,
    damageBonus,
    damageReworkBonus,
    precBonus,
    rework,
    quality,
    qualityCost,
    totalBonus,
    selectedQuality,
    cost,
    damage: { value: damage, type, hrZero: damageHrZero },
    prec,
    precModifier: parseInt(precModifier),
    damageModifier: parseInt(damageModifier),
    defModifier: parseInt(defModifier),
    mDefModifier: parseInt(mDefModifier),
  });

  if (import.meta.env.DEV && name) {
    const result = validateWeaponPersisted(weaponObj);
    if (!result.success) {
      console.warn(
        "[QuickCreateModal] weapon schema validation failed",
        result.error.issues,
      );
    }
  }

  const handleClear = () => {
    setFormState(buildWeaponPanelState());
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid
            size={12}
            container
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              label={t("Weapon")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="accuracy"
              label={t("Accuracy")}
              cols={2}
            />
          </Grid>
          <Grid
            size={12}
            container
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="damage"
              label={t("Damage")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="quality"
              label={t("Quality")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="rareBonus"
              label={t("Rare Weapon Options")}
              cols={1}
              extraProps={{
                rework,
                totalBonus,
                basePrec: getWeaponPrec(base),
              }}
            />
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="rare"
              cols={2}
            />
            <SchemaFieldRenderer
              config={weaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="modifiers"
              label={t("Modifiers")}
              cols={2}
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedWeaponCard item={weaponObj} />}
      addButton={<AddToCompendiumButton itemType="weapon" data={weaponObj} />}
      data={weaponObj}
      itemName={weaponObj.name || ""}
      exportDataType="weapons"
    />
  );
}

// Armor panel (inline form)

function buildArmorPanelState() {
  const base = armor[0];
  return {
    itemType: "armor",
    base,
    name: base.name,
    martial: base.martial ?? false,
    def: base.def,
    mdef: base.mdef,
    init: base.init ?? 0,
    rework: false,
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    isSlotsVariant: false,
    slots: "alpha",
    slotted: [],
    cost: base.cost,
    defModifier: 0,
    mDefModifier: 0,
    initModifier: 0,
    magicModifier: 0,
    precModifier: 0,
    damageMeleeModifier: 0,
    damageRangedModifier: 0,
    isEquipped: false,
  };
}

function ArmorPanel() {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(buildArmorPanelState);

  const { base, name, quality, cost } = formState;

  const armorObj = {
    base,
    ...base,
    name,
    cost,
    quality,
    qualityCost: formState.qualityCost,
    selectedQuality: formState.selectedQuality,
    init: formState.init,
    rework: formState.rework,
    category: "Armor",
    defModifier: parseInt(formState.defModifier),
    mDefModifier: parseInt(formState.mDefModifier),
    initModifier: parseInt(formState.initModifier),
    magicModifier: parseInt(formState.magicModifier),
    precModifier: parseInt(formState.precModifier),
    damageMeleeModifier: parseInt(formState.damageMeleeModifier),
    damageRangedModifier: parseInt(formState.damageRangedModifier),
    modifiers: {
      def: parseInt(formState.defModifier),
      mdef: parseInt(formState.mDefModifier),
      init: parseInt(formState.initModifier),
      magic: parseInt(formState.magicModifier),
      accuracy: parseInt(formState.precModifier),
      damageMelee: parseInt(formState.damageMeleeModifier),
      damageRanged: parseInt(formState.damageRangedModifier),
    },
  };

  const handleClear = () => {
    setFormState(buildArmorPanelState());
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={armorFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              label={t("Armor")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={armorFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="quality"
              label={t("Quality")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={armorFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="modifiers"
              label={t("Modifiers")}
              cols={2}
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedArmorCard item={armorObj} />}
      addButton={<AddToCompendiumButton itemType="armor" data={armorObj} />}
      data={armorObj}
      itemName={armorObj.name || ""}
      exportDataType="armor"
    />
  );
}

// Shield panel (inline form)

function buildShieldPanelState() {
  const base = shields[0];
  return {
    itemType: "shield",
    base,
    name: base.name,
    martial: base.martial ?? false,
    def: base.def,
    mdef: base.mdef,
    init: base.init ?? 0,
    rework: false,
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    cost: base.cost,
    defModifier: 0,
    mDefModifier: 0,
    initModifier: 0,
    magicModifier: 0,
    precModifier: 0,
    damageMeleeModifier: 0,
    damageRangedModifier: 0,
    isEquipped: false,
  };
}

function ShieldPanel() {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(buildShieldPanelState);

  const { base, name, quality, cost } = formState;

  const shieldObj = {
    base,
    ...base,
    name,
    cost,
    quality,
    qualityCost: formState.qualityCost,
    selectedQuality: formState.selectedQuality,
    init: formState.init,
    rework: formState.rework,
    category: "Shield",
    defModifier: parseInt(formState.defModifier),
    mDefModifier: parseInt(formState.mDefModifier),
    initModifier: parseInt(formState.initModifier),
    magicModifier: parseInt(formState.magicModifier),
    precModifier: parseInt(formState.precModifier),
    damageMeleeModifier: parseInt(formState.damageMeleeModifier),
    damageRangedModifier: parseInt(formState.damageRangedModifier),
    modifiers: {
      def: parseInt(formState.defModifier),
      mdef: parseInt(formState.mDefModifier),
      init: parseInt(formState.initModifier),
      magic: parseInt(formState.magicModifier),
      accuracy: parseInt(formState.precModifier),
      damageMelee: parseInt(formState.damageMeleeModifier),
      damageRanged: parseInt(formState.damageRangedModifier),
    },
  };

  const handleClear = () => {
    setFormState(buildShieldPanelState());
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={shieldFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              label={t("Shield")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={shieldFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="quality"
              label={t("Quality")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={shieldFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="modifiers"
              label={t("Modifiers")}
              cols={2}
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedShieldCard item={shieldObj} />}
      addButton={<AddToCompendiumButton itemType="shield" data={shieldObj} />}
      data={shieldObj}
      itemName={shieldObj.name || ""}
      exportDataType="shields"
    />
  );
}

// Custom Weapon panel

function buildCWPanelState() {
  return {
    itemType: "customWeapon",
    name: "",
    category: cwCategories[0],
    range: "melee",
    hands: 2,
    martial: false,
    accuracy: {
      attr1: "dexterity",
      attr2: "insight",
      value: 0,
      defense: "def",
    },
    damage: { value: 0, type: "physical", hrZero: false },
    modifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
    rare: {
      accuracyBonus: false,
      damageBonus: false,
      overrideDamageType: false,
      overrideAccuracyAttributes: false,
    },
    customizations: [],
    quality: "",
    qualityCost: 0,
    cost: 300,
    slots: "alpha",
    slotted: [],
    secondName: "",
    secondCategory: cwCategories[0],
    secondRange: "melee",
    secondAccuracy: undefined,
    secondDamage: undefined,
    secondModifiers: { damage: 0, accuracy: 0, def: 0, mdef: 0 },
    secondCustomizations: [],
    dataType: "weapon",
    selectedQuality: "",
    qualityName: "",
    isEquipped: false,
    selectedCategory: cwCategories[0],
    selectedRange: "melee",
    selectedAccuracyCheck: {
      attr1: cwAccuracyChecks[0].att1,
      attr2: cwAccuracyChecks[0].att2,
    },
    customDamageType: "physical",
    primaryHrZero: false,
    rareAccuracyBonus: false,
    rareDamageBonus: false,
    overrideDamageType: false,
    overrideAccuracyAttributes: false,
    precModifier: 0,
    damageModifier: 0,
    defModifier: 0,
    mDefModifier: 0,
    hasTransforming: false,
    secondWeaponName: "",
    secondSelectedCategory: cwCategories[0],
    secondSelectedRange: "melee",
    secondSelectedAccuracyCheck: {
      attr1: cwAccuracyChecks[0].att1,
      attr2: cwAccuracyChecks[0].att2,
    },
    secondaryHrZero: false,
    secondOverrideDamageType: false,
    secondCustomDamageType: "physical",
    secondPrecModifier: 0,
    secondDamageModifier: 0,
    secondDefModifier: 0,
    secondMDefModifier: 0,
    isSlotsVariant: false,
  };
}

function CustomWeaponPanel() {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(buildCWPanelState);
  const [modifiersExpanded, setModifiersExpanded] = useState(false);
  const [secondModifiersExpanded, setSecondModifiersExpanded] = useState(false);

  const {
    selectedCategory,
    selectedAccuracyCheck,
    overrideAccuracyAttributes,
    rareAccuracyBonus,
    hasTransforming,
    secondSelectedCategory,
    primaryHrZero,
    customDamageType,
    overrideDamageType,
    damageModifier,
    precModifier,
    secondSelectedAccuracyCheck,
    secondaryHrZero,
    secondOverrideDamageType,
    secondCustomDamageType,
    secondDamageModifier,
    secondPrecModifier,
    secondCustomizations,
    qualityCost,
    selectedQuality,
    quality,
  } = formState;

  const customizations = formState.customizations ?? [];

  const { precision, damage } = calculateCustomWeaponStats(
    {
      category: selectedCategory,
      customizations,
      rareAccuracyBonus,
      rareDamageBonus: formState.rareDamageBonus,
      damageModifier: parseInt(damageModifier) || 0,
      precModifier: parseInt(precModifier) || 0,
    },
    false,
  );

  const pHasElemental = customizations.some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const primaryType = pHasElemental
    ? customDamageType
    : overrideDamageType
      ? customDamageType
      : "physical";

  const { precision: secondPrecision, damage: secondDamage } = hasTransforming
    ? calculateCustomWeaponStats(
        {
          secondSelectedCategory: formState.secondSelectedCategory,
          secondCurrentCustomizations: secondCustomizations,
          rareAccuracyBonus,
          rareDamageBonus: formState.rareDamageBonus,
          secondDamageModifier: parseInt(secondDamageModifier) || 0,
          secondPrecModifier: parseInt(secondPrecModifier) || 0,
        },
        true,
      )
    : { precision: 0, damage: 0 };

  const s2HasElemental = (secondCustomizations ?? []).some(
    (c) => c.name === "weapon_customization_elemental",
  );
  const secondType = s2HasElemental
    ? secondCustomDamageType
    : secondOverrideDamageType
      ? secondCustomDamageType
      : "physical";

  const singleAttributeAccuracyCost =
    overrideAccuracyAttributes &&
    selectedAccuracyCheck.attr1 === selectedAccuracyCheck.attr2
      ? 50
      : 0;
  const totalCost =
    300 +
    (hasTransforming ? 100 : 0) +
    (parseInt(qualityCost) || 0) +
    (rareAccuracyBonus ? 100 : 0) +
    (formState.rareDamageBonus ? 200 : 0) +
    (overrideDamageType ? 100 : 0) +
    singleAttributeAccuracyCost;

  const weaponObj = normalizeCustomWeaponLike({
    name: formState.name,
    category: selectedCategory,
    range: formState.selectedRange,
    accuracy: {
      attr1: selectedAccuracyCheck.attr1,
      attr2: selectedAccuracyCheck.attr2,
      value: precision,
      defense: "def",
    },
    damage: { value: damage, type: primaryType, hrZero: primaryHrZero },
    customizations,
    quality,
    qualityCost,
    selectedQuality,
    cost: totalCost,
    hands: 2,
    martial: formState.martial,
    rareAccuracyBonus,
    rareDamageBonus: formState.rareDamageBonus,
    overrideAccuracyAttributes,
    secondWeaponName: formState.secondWeaponName,
    secondSelectedCategory: formState.secondSelectedCategory,
    secondSelectedRange: formState.secondSelectedRange,
    secondAccuracy: {
      attr1: overrideAccuracyAttributes
        ? selectedAccuracyCheck.attr1
        : secondSelectedAccuracyCheck.attr1,
      attr2: overrideAccuracyAttributes
        ? selectedAccuracyCheck.attr2
        : secondSelectedAccuracyCheck.attr2,
      value: secondPrecision,
      defense: "def",
    },
    secondDamage: {
      value: secondDamage,
      type: secondType,
      hrZero: secondaryHrZero,
    },
    secondCurrentCustomizations: secondCustomizations,
    secondDefModifier: parseInt(formState.secondDefModifier) || 0,
    secondMDefModifier: parseInt(formState.secondMDefModifier) || 0,
    secondOverrideDamageType,
    defModifier: parseInt(formState.defModifier) || 0,
    mDefModifier: parseInt(formState.mDefModifier) || 0,
    overrideDamageType,
    precModifier: parseInt(precModifier) || 0,
    damageModifier: parseInt(damageModifier) || 0,
  });

  if (import.meta.env.DEV && formState.name) {
    const result = validateCustomWeaponPersisted(weaponObj);
    if (!result.success) {
      console.warn(
        "[QuickCreateModal/CustomWeapon] customWeapon schema validation failed",
        result.error.issues,
      );
    }
  }

  const handleClear = () => {
    setFormState(buildCWPanelState());
    setModifiersExpanded(false);
    setSecondModifiersExpanded(false);
  };

  const coreExtraProps = {
    selectedCategory,
    rareAccuracyBonus,
    isSecondForm: false,
  };
  const secondaryExtraProps = {
    selectedCategory: secondSelectedCategory,
    rareAccuracyBonus,
    isSecondForm: true,
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid
            size={12}
            container
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              label={t("Custom Weapon")}
              cols={2}
              extraProps={coreExtraProps}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="accuracy"
              label={t("Accuracy")}
              cols={2}
            />
          </Grid>
          <Grid
            size={12}
            container
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="damage"
              label={t("Damage")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={customWeaponFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="quality"
              label={t("Quality")}
              cols={2}
            />
          </Grid>
          <Accordion
            sx={{ width: "100%", mb: 2 }}
            expanded={modifiersExpanded}
            onChange={() => setModifiersExpanded(!modifiersExpanded)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{t("Modifiers")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="rare"
                  label={t("Rare Weapon Options")}
                  cols={2}
                />
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="modifiers"
                  label={t("Modifiers")}
                  cols={2}
                />
              </Grid>
            </AccordionDetails>
          </Accordion>
          {hasTransforming && (
            <>
              <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                <SchemaFieldRenderer
                  config={customWeaponFieldConfig}
                  state={formState}
                  onChange={setFormState}
                  surface="edit"
                  group="secondary"
                  label={t("weapon_customization_transforming_form")}
                  cols={2}
                  extraProps={secondaryExtraProps}
                />
              </Grid>
              <Accordion
                sx={{ width: "100%", mb: 2 }}
                expanded={secondModifiersExpanded}
                onChange={() =>
                  setSecondModifiersExpanded(!secondModifiersExpanded)
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>
                    {t("weapon_customization_transforming_form_modifiers")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <SchemaFieldRenderer
                      config={customWeaponFieldConfig}
                      state={formState}
                      onChange={setFormState}
                      surface="edit"
                      group="secondaryModifiers"
                      cols={2}
                      extraProps={secondaryExtraProps}
                    />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </>
          )}
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedCustomWeaponCard item={weaponObj} />}
      addButton={
        <AddToCompendiumButton itemType="custom-weapon" data={weaponObj} />
      }
      data={weaponObj}
      itemName={weaponObj.name || ""}
      exportDataType="custom-weapons"
    />
  );
}

// Accessory panel

function buildAccessoryPanelState() {
  return {
    itemType: "accessory",
    name: "",
    quality: "",
    qualityCost: 0,
    selectedQuality: "",
    cost: 0,
    defModifier: 0,
    mDefModifier: 0,
    initModifier: 0,
    magicModifier: 0,
    precModifier: 0,
    damageMeleeModifier: 0,
    damageRangedModifier: 0,
    isEquipped: false,
  };
}

function AccessoryPanel() {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(buildAccessoryPanelState);

  const { name, quality, cost } = formState;

  const accessoryObj = {
    name,
    cost,
    quality,
    qualityCost: formState.qualityCost,
    selectedQuality: formState.selectedQuality,
    defModifier: parseInt(formState.defModifier),
    mDefModifier: parseInt(formState.mDefModifier),
    initModifier: parseInt(formState.initModifier),
    magicModifier: parseInt(formState.magicModifier),
    precModifier: parseInt(formState.precModifier),
    damageMeleeModifier: parseInt(formState.damageMeleeModifier),
    damageRangedModifier: parseInt(formState.damageRangedModifier),
    modifiers: {
      def: parseInt(formState.defModifier),
      mdef: parseInt(formState.mDefModifier),
      init: parseInt(formState.initModifier),
      magic: parseInt(formState.magicModifier),
      accuracy: parseInt(formState.precModifier),
      damageMelee: parseInt(formState.damageMeleeModifier),
      damageRanged: parseInt(formState.damageRangedModifier),
    },
  };

  const handleClear = () => {
    setFormState(buildAccessoryPanelState());
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={accessoryFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              label={t("Accessory")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={accessoryFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="quality"
              label={t("Quality")}
              cols={2}
            />
          </Grid>
          <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
            <SchemaFieldRenderer
              config={accessoryFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="modifiers"
              label={t("Modifiers")}
              cols={2}
            />
          </Grid>
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedAccessoryCard item={accessoryObj} />}
      addButton={
        <AddToCompendiumButton itemType="accessory" data={accessoryObj} />
      }
      data={accessoryObj}
      itemName={accessoryObj.name || ""}
      exportDataType="accessories"
    />
  );
}

// Optional panel

const OPTIONAL_SUBTYPES = [
  { value: "quirk", label: "Quirk" },
  { value: "camp-activities", label: "Camp Activities" },
  { value: "zero-trigger", label: "Zero Trigger" },
  { value: "zero-effect", label: "Zero Effect" },
  { value: "zero-power", label: "Zero Power" },
  { value: "other", label: "Other" },
];

function OptionalPanel() {
  const { t } = useTranslate();
  const { packs } = useCompendiumPacks();
  const [subtype, setSubtype] = useState("quirk");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [effect, setEffect] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [clockSections, setClockSections] = useState(6);
  const [showClock, setShowClock] = useState(false);
  const [zeroTrigger, setZeroTrigger] = useState(null);
  const [zeroEffect, setZeroEffect] = useState(null);

  // Collect zero-trigger / zero-effect items from all active packs
  const allOptionals = packs.flatMap((p) => {
    if (p.active === false) return [];
    const packFuid = p.fuid || p.name;
    return p.items
      .filter((i) => i.type === "optional")
      .map((i) => {
        const itemFuid =
          typeof i.data?.fuid === "string" && i.data.fuid.trim()
            ? slugify(i.data.fuid)
            : i.id;
        return {
          ...i.data,
          _sourceRef: packFuid ? `${slugify(packFuid)}:${itemFuid}` : "",
        };
      });
  });
  const zeroTriggerOptions = allOptionals.filter(
    (i) => i.subtype === "zero-trigger",
  );
  const zeroEffectOptions = allOptionals.filter(
    (i) => i.subtype === "zero-effect",
  );
  const campTargetOptions = [
    t("Yourself"),
    t("One ally"),
    t("Yourself or one ally"),
  ];

  const data =
    subtype === "quirk"
      ? {
          subtype,
          name: name.trim(),
          description: description.trim(),
          effect: effect.trim(),
        }
      : subtype === "camp-activities"
        ? {
            subtype,
            name: name.trim(),
            targetDescription: targetDescription.trim(),
            effect: effect.trim(),
          }
        : subtype === "zero-trigger" || subtype === "zero-effect"
          ? { subtype, name: name.trim(), description: description.trim() }
          : subtype === "zero-power"
            ? {
                subtype,
                name: name.trim(),
                zeroTriggerRef: zeroTrigger?._sourceRef ?? "",
                zeroEffectRef: zeroEffect?._sourceRef ?? "",
                zeroTrigger: zeroTrigger
                  ? {
                      name: zeroTrigger.name ?? "",
                      description: zeroTrigger.description ?? "",
                    }
                  : "",
                zeroEffect: zeroEffect
                  ? {
                      name: zeroEffect.name ?? "",
                      description: zeroEffect.description ?? "",
                    }
                  : "",
                clock: { sections: Number(clockSections) },
              }
            : /* other */ {
                subtype,
                name: name.trim(),
                description: description.trim(),
                effect: effect.trim(),
                ...(showClock
                  ? { clock: { sections: Number(clockSections) } }
                  : {}),
              };

  const handleClear = () => {
    setSubtype("quirk");
    setName("");
    setDescription("");
    setEffect("");
    setTargetDescription("");
    setClockSections(6);
    setShowClock(false);
    setZeroTrigger(null);
    setZeroEffect(null);
  };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
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
              sm: 6,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>{t("Subtype")}</InputLabel>
              <Select
                value={subtype}
                label={t("Subtype")}
                onChange={(e) => setSubtype(e.target.value)}
              >
                {OPTIONAL_SUBTYPES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {t(s.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {subtype === "quirk" && (
            <>
              <Grid size={12}>
                <CustomTextarea
                  label={t("Description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText=""
                />
              </Grid>
              <Grid size={12}>
                <CustomTextarea
                  label={t("Effect")}
                  value={effect}
                  onChange={(e) => setEffect(e.target.value)}
                  helperText=""
                />
              </Grid>
            </>
          )}

          {subtype === "camp-activities" && (
            <>
              <Grid size={12}>
                <Autocomplete
                  freeSolo
                  options={campTargetOptions}
                  value={targetDescription}
                  onInputChange={(_, value) => setTargetDescription(value)}
                  onChange={(_, value) =>
                    setTargetDescription(typeof value === "string" ? value : "")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("Target")}
                      size="small"
                      helperText={t(
                        "Suggested: Yourself, One ally, Yourself or one ally",
                      )}
                    />
                  )}
                  size="small"
                />
              </Grid>
              <Grid size={12}>
                <CustomTextarea
                  label={t("Effect")}
                  value={effect}
                  onChange={(e) => setEffect(e.target.value)}
                  helperText=""
                />
              </Grid>
            </>
          )}

          {(subtype === "zero-trigger" || subtype === "zero-effect") && (
            <Grid size={12}>
              <CustomTextarea
                label={t("Description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText=""
              />
            </Grid>
          )}

          {subtype === "zero-power" && (
            <>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  label={t("Clock Sections")}
                  value={clockSections}
                  onChange={(e) => setClockSections(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                  slotProps={{
                    htmlInput: { min: 2, max: 12 },
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  options={zeroTriggerOptions}
                  getOptionLabel={(o) => o.name ?? ""}
                  value={zeroTrigger}
                  onChange={(_, v) => setZeroTrigger(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("Zero Trigger")}
                      size="small"
                      helperText={
                        zeroTriggerOptions.length === 0
                          ? t("No zero-trigger items in active packs")
                          : ""
                      }
                    />
                  )}
                  size="small"
                  isOptionEqualToValue={(a, b) =>
                    Boolean(
                      b &&
                      ((a._sourceRef &&
                        b._sourceRef &&
                        a._sourceRef === b._sourceRef) ||
                        a.name === b.name),
                    )
                  }
                />
              </Grid>
              <Grid size={12}>
                <Autocomplete
                  options={zeroEffectOptions}
                  getOptionLabel={(o) => o.name ?? ""}
                  value={zeroEffect}
                  onChange={(_, v) => setZeroEffect(v)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("Zero Effect")}
                      size="small"
                      helperText={
                        zeroEffectOptions.length === 0
                          ? t("No zero-effect items in active packs")
                          : ""
                      }
                    />
                  )}
                  size="small"
                  isOptionEqualToValue={(a, b) =>
                    Boolean(
                      b &&
                      ((a._sourceRef &&
                        b._sourceRef &&
                        a._sourceRef === b._sourceRef) ||
                        a.name === b.name),
                    )
                  }
                />
              </Grid>
            </>
          )}

          {subtype === "other" && (
            <>
              <Grid size={12}>
                <CustomTextarea
                  label={t("Description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText=""
                />
              </Grid>
              <Grid size={12}>
                <CustomTextarea
                  label={t("Effect")}
                  value={effect}
                  onChange={(e) => setEffect(e.target.value)}
                  helperText=""
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Clock")}</InputLabel>
                  <Select
                    value={showClock ? "yes" : "no"}
                    label={t("Clock")}
                    onChange={(e) => setShowClock(e.target.value === "yes")}
                  >
                    <MenuItem value="no">{t("No Clock")}</MenuItem>
                    <MenuItem value="yes">{t("With Clock")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {showClock && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <TextField
                    label={t("Clock Sections")}
                    value={clockSections}
                    onChange={(e) => setClockSections(e.target.value)}
                    fullWidth
                    size="small"
                    type="number"
                    slotProps={{
                      htmlInput: { min: 2, max: 12 },
                    }}
                  />
                </Grid>
              )}
            </>
          )}
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedOptionalCard item={data} />}
      addButton={<AddToCompendiumButton itemType="optional" data={data} />}
      exportDataType="optionals"
    />
  );
}

// Tab definitions
function MnemospherePanel() {
  const { t } = useTranslate();
  const [selectedClass, setSelectedClass] = useState(
    mnemosphereClassList[0]?.name ?? "",
  );
  const [selectedLvl, setSelectedLvl] = useState(1);

  const data = selectedClass
    ? buildMnemosphere(selectedClass, Number(selectedLvl))
    : null;

  return (
    <PanelLayout
      formContent={
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("Class")}</InputLabel>
            <Select
              value={selectedClass}
              label={t("Class")}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {mnemosphereClassList.map((classItem) => (
                <MenuItem key={classItem.name} value={classItem.name}>
                  {t(classItem.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>{t("Level")}</InputLabel>
            <Select
              value={selectedLvl}
              label={t("Level")}
              onChange={(e) => setSelectedLvl(e.target.value)}
            >
              {MNEMOSPHERE_LEVELS.map((lvl) => (
                <MenuItem key={lvl} value={lvl}>
                  {lvl}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            {t("Cost")}: {getMnemosphereCost(selectedLvl)}z
          </Typography>
        </Stack>
      }
      previewContent={
        <SharedMnemosphereCard
          item={
            data || {
              name: "",
              cost: 0,
              skills: [],
            }
          }
        />
      }
      addButton={
        data ? (
          <AddToCompendiumButton itemType="mnemosphere" data={data} />
        ) : null
      }
      data={data}
      itemName={data?.name || ""}
      exportDataType="mnemospheres"
    />
  );
}

function HoplospherePanel() {
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSlots, setRequiredSlots] = useState(1);
  const [socketable, setSocketable] = useState("all");
  const [cost, setCost] = useState(500);
  const [coagEffects, setCoagEffects] = useState([]);

  const handleCoagChange = (index, field, value) => {
    setCoagEffects((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const handleAddCoag = () => {
    setCoagEffects((prev) => [...prev, { threshold: 2, effect: "" }]);
  };

  const handleRemoveCoag = (index) => {
    setCoagEffects((prev) => prev.filter((_, i) => i !== index));
  };

  const data = name.trim()
    ? {
        name: name.trim(),
        description,
        requiredSlots: Number(requiredSlots),
        socketable,
        cost: Number(cost) || 0,
        coagEffects: coagEffects.reduce((acc, row) => {
          const threshold = Number(row.threshold);
          const effect = String(row.effect ?? "").trim();

          if (threshold > 1 && effect) {
            acc[threshold] = effect;
          }

          return acc;
        }, {}),
      }
    : null;

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              fullWidth
              size="small"
              label={t("Name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label={t("Description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Slots")}</InputLabel>
              <Select
                value={requiredSlots}
                label={t("Slots")}
                onChange={(e) => setRequiredSlots(e.target.value)}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Socketable")}</InputLabel>
              <Select
                value={socketable}
                label={t("Socketable")}
                onChange={(e) => setSocketable(e.target.value)}
              >
                <MenuItem value="all">{t("All")}</MenuItem>
                <MenuItem value="weapon">{t("Weapon only")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={t("Cost")}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("Coagulation")}
            </Typography>
            <Stack spacing={1}>
              {coagEffects.map((row, index) => (
                <Stack
                  key={index}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "flex-start" }}
                >
                  <TextField
                    label={t("Threshold")}
                    type="number"
                    size="small"
                    value={row.threshold}
                    onChange={(e) =>
                      handleCoagChange(index, "threshold", e.target.value)
                    }
                    sx={{ width: { xs: 1, sm: 140 } }}
                    slotProps={{ input: { inputProps: { min: 2 } } }}
                  />
                  <TextField
                    label={t("Effect")}
                    size="small"
                    multiline
                    minRows={2}
                    value={row.effect}
                    onChange={(e) =>
                      handleCoagChange(index, "effect", e.target.value)
                    }
                    fullWidth
                  />
                  <IconButton
                    aria-label={t("Remove coagulation effect")}
                    onClick={() => handleRemoveCoag(index)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button
                size="small"
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddCoag}
                sx={{ alignSelf: "flex-start" }}
              >
                {t("Add Coagulation")}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      }
      previewContent={
        <SharedHoplosphereCard
          item={
            data || {
              name: "",
              description: "",
              requiredSlots: 1,
              socketable: "all",
              cost: 0,
              coagEffects: {},
            }
          }
        />
      }
      addButton={
        data ? (
          <AddToCompendiumButton itemType="hoplosphere" data={data} />
        ) : null
      }
      data={data}
      itemName={data?.name || ""}
      exportDataType="hoplospheres"
    />
  );
}

const TABS = [
  { key: "npc-attack", label: "NPC Attack", Panel: NpcAttackPanel },
  { key: "npc-spell", label: "NPC Spell", Panel: NpcSpellPanel },
  { key: "npc-special", label: "Special Rule", Panel: NpcSpecialPanel },
  { key: "npc-action", label: "Other Action", Panel: NpcActionPanel },
  { key: "player-spell", label: "Player Spell", Panel: PlayerSpellPanel },
  { key: "quality", label: "Quality", Panel: QualityPanel },
  { key: "heroic", label: "Heroic Skill", Panel: HeroicPanel },
  { key: "class", label: "Class", Panel: ClassPanel },
  { key: "mnemosphere", label: "Mnemosphere", Panel: MnemospherePanel },
  { key: "hoplosphere", label: "Hoplosphere", Panel: HoplospherePanel },
  { key: "weapon", label: "Weapon", Panel: WeaponPanel },
  { key: "custom-weapon", label: "Custom Weapon", Panel: CustomWeaponPanel },
  { key: "armor", label: "Armor", Panel: ArmorPanel },
  { key: "shield", label: "Shield", Panel: ShieldPanel },
  { key: "accessory", label: "Accessory", Panel: AccessoryPanel },
  { key: "optional", label: "Optional", Panel: OptionalPanel },
];

// Viewer type to Quick Create tab key

const VIEWER_TYPE_TO_TAB_KEY = {
  attacks: "npc-attack",
  spells: "npc-spell",
  special: "npc-special",
  actions: "npc-action",
  "player-spells": "player-spell",
  qualities: "quality",
  heroics: "heroic",
  classes: "class",
  mnemospheres: "mnemosphere",
  hoplospheres: "hoplosphere",
  weapons: "weapon",
  "custom-weapons": "custom-weapon",
  armor: "armor",
  shields: "shield",
  accessories: "accessory",
  optionals: "optional",
};

// Main component

export default function QuickCreateModal({
  open,
  onClose,
  lockedToViewerType,
}) {
  const { t } = useTranslate();

  const lockedTabKey = lockedToViewerType
    ? VIEWER_TYPE_TO_TAB_KEY[lockedToViewerType]
    : null;
  const lockedTabIdx =
    lockedTabKey != null ? TABS.findIndex((t) => t.key === lockedTabKey) : -1;
  const initialTab = lockedTabIdx >= 0 ? lockedTabIdx : 0;

  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (open && lockedTabIdx >= 0) setTab(lockedTabIdx);
  }, [open, lockedTabIdx]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: { height: "90vh", display: "flex", flexDirection: "column" },
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoFixHigh fontSize="small" />
          {t("Quick Create")}
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
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
