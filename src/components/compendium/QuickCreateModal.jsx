import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  ToggleButtonGroup,
  Autocomplete,
  Chip,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
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
import { OffensiveSpellIcon, Martial } from "../icons";
import AddToCompendiumButton from "./AddToCompendiumButton";
import Export from "../Export";
import { useTranslate, t as staticT } from "../../translation/translate";
import { useCompendiumPacks } from "../../hooks/useCompendiumPacks";
import { calculateCustomWeaponStats } from "../player/common/playerCalculations";
import types from "../../libs/types";
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
import CompendiumViewerModal from "./CompendiumViewerModal";
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
import { itemFormRegistry } from "../../forms/registry";
import {
  QUICK_CREATE_TAB_KEYS,
  VIEWER_TYPE_TO_TAB_KEY,
} from "./quickCreateTabKeys";

const REG = itemFormRegistry;
import { SchemaFieldRenderer } from "../../forms/rendering/SchemaFieldRenderer";
import { weaponFieldConfig } from "../../forms/rendering/config/itemConfigs/weapon";
import { armorFieldConfig } from "../../forms/rendering/config/itemConfigs/armor";
import FuidField from "../common/FuidField";
import { shieldFieldConfig } from "../../forms/rendering/config/itemConfigs/shield";
import { accessoryFieldConfig } from "../../forms/rendering/config/itemConfigs/accessory";
import { customWeaponFieldConfig } from "../../forms/rendering/config/itemConfigs/customWeapon";
import { npcActionFieldConfig } from "../../forms/rendering/config/itemConfigs/npcAction";
import { npcSpecialFieldConfig } from "../../forms/rendering/config/itemConfigs/npcSpecial";
import { npcAttackFieldConfig } from "../../forms/rendering/config/itemConfigs/npcAttack";
import { npcSpellFieldConfig } from "../../forms/rendering/config/itemConfigs/npcSpell";
import { qualityFieldConfig } from "../../forms/rendering/config/itemConfigs/quality";
import { heroicFieldConfig } from "../../forms/rendering/config/itemConfigs/heroic";
import { classFieldConfig } from "../../forms/rendering/config/itemConfigs/class";
import { hoplosphereFieldConfig } from "../../forms/rendering/config/itemConfigs/hoplosphere";
import { createDefaultStateFromFields } from "../../forms/registry/helpers";
import { deriveIsOfficial } from "../../forms/rendering/config/metaFieldConfig";

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

function createMetaFromBook(bookValue = "homebrew") {
  const book = String(bookValue ?? "").trim() || "homebrew";
  return {
    book,
    page: undefined,
    bookName: "",
    isOfficial: deriveIsOfficial(book),
  };
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function mergeImportedIntoDefaults(defaultState, imported) {
  if (Array.isArray(imported)) return [...imported];
  if (!isPlainObject(imported)) return imported;
  const base = isPlainObject(defaultState) ? { ...defaultState } : {};
  for (const [key, value] of Object.entries(imported)) {
    const existing = base[key];
    if (Array.isArray(value)) {
      base[key] = [...value];
    } else if (isPlainObject(value)) {
      base[key] = mergeImportedIntoDefaults(existing, value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function stripPrivateFields(value) {
  if (Array.isArray(value)) return value.map(stripPrivateFields);
  if (!isPlainObject(value)) return value;
  const next = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key.startsWith("_")) continue;
    next[key] = stripPrivateFields(entry);
  }
  return next;
}

function importIntoSchemaForm(fieldConfig, setFormState, item, transform = null) {
  const defaults = createDefaultStateFromFields(fieldConfig);
  const prepared = stripPrivateFields(transform ? transform(item) : item);
  const merged = mergeImportedIntoDefaults(defaults, prepared);
  setFormState(merged);
}

const QUICK_CREATE_TAB_TO_VIEWER_TYPE = {
  "npc-attack": "attacks",
  "npc-spell": "spells",
  "npc-special": "special",
  "npc-action": "actions",
  "player-spell": "player-spells",
  quality: "qualities",
  heroic: "heroics",
  class: "classes",
  mnemosphere: "mnemospheres",
  hoplosphere: "hoplospheres",
  weapon: "weapons",
  "custom-weapon": "custom-weapons",
  armor: "armor",
  shield: "shields",
  accessory: "accessories",
  optional: "optionals",
};

function localizeImportedClassItem(item) {
  if (!item || typeof item !== "object") return item;
  const next = { ...item };
  if (Array.isArray(next.skills)) {
    next.skills = next.skills.map((skill) =>
      skill && typeof skill === "object"
        ? {
            ...skill,
            description:
              typeof skill.description === "string"
                ? staticT(skill.description)
                : skill.description,
          }
        : skill,
    );
  }
  if (next.benefits && typeof next.benefits === "object" && Array.isArray(next.benefits.custom)) {
    next.benefits = {
      ...next.benefits,
      custom: next.benefits.custom.map((entry) =>
        typeof entry === "string" ? staticT(entry) : entry,
      ),
    };
  }
  return next;
}

function normalizeImportedNpcSpellItem(item) {
  if (!item || typeof item !== "object") return item;
  const next = { ...item };
  if (typeof next.effect === "string" && next.effect.trim()) return next;
  if (Array.isArray(next.special) && typeof next.special[0] === "string") {
    next.effect = next.special[0].trim();
    return next;
  }
  if (typeof next.special === "string" && next.special.trim()) {
    next.effect = next.special.trim();
    return next;
  }
  if (typeof next.description === "string" && next.description.trim()) {
    next.effect = next.description.trim();
  }
  return next;
}
// Only classes that use standard spells (spellType: "default")
const STANDARD_SPELL_CLASSES = [
  "Chimerist",
  "Tinkerer",
  "Elementalist",
  "Entropist",
  "Spiritist",
];
const spellClasses = STANDARD_SPELL_CLASSES;
const QuickCreateImportContext = React.createContext(null);

function useQuickCreateImport() {
  const ctx = React.useContext(QuickCreateImportContext);
  if (!ctx) throw new Error("useQuickCreateImport must be used within QuickCreateImportContext");
  return ctx;
}

const QuickCreateSubtypeContext = React.createContext(null);

function useQuickCreateSubtype() {
  return React.useContext(QuickCreateSubtypeContext);
}

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
  const { openImport } = useQuickCreateImport();
  const buildState = () => createDefaultStateFromFields(npcAttackFieldConfig);
  const [formState, setFormState] = useState(() => buildState());
  const data = {
    ...formState,
    name: String(formState.name ?? "").trim(),
    fuid: formState.fuid || undefined,
  };

  const handleClear = () => {
    setFormState(buildState());
  };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("NPC Attack")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-attack"], (item) =>
                  importIntoSchemaForm(npcAttackFieldConfig, setFormState, item),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="accuracy"
            label={t("Accuracy")}
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="damage"
            label={t("Damage")}
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="effect"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
            label={t("Metadata")}
            cols={2}
          />
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedAttackCard item={data} />}
      addButton={
        <AddToCompendiumButton itemType={REG["npc-attack"].addItemType} data={data} />
      }
      exportDataType={REG["npc-attack"].exportDataType}
    />
  );
}

// NPC Spell panel

function NpcSpellPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const buildState = () => createDefaultStateFromFields(npcSpellFieldConfig);
  const [formState, setFormState] = useState(() => buildState());
  const data = {
    ...formState,
    name: String(formState.name ?? "").trim(),
    fuid: formState.fuid || undefined,
  };

  const handleClear = () => {
    setFormState(buildState());
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("NPC Spell")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-spell"], (item) =>
                  importIntoSchemaForm(
                    npcSpellFieldConfig,
                    setFormState,
                    item,
                    normalizeImportedNpcSpellItem,
                  ),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="accuracy"
            label={t("Accuracy")}
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="damage"
            label={t("Damage")}
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="details"
            label={t("Details")}
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="effect"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
            label={t("Metadata")}
            cols={2}
          />
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={
        <SharedSpellCard item={data} />
      }
      addButton={
        <AddToCompendiumButton itemType={REG["npc-spell"].addItemType} data={data} />
      }
      data={data}
      itemName={data.name}
      exportDataType={REG["npc-spell"].exportDataType}
    />
  );
}

// NPC Special Rule panel

function NpcSpecialPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(npcSpecialFieldConfig),
  );

  const data = { ...formState, fuid: formState.fuid || undefined };

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(npcSpecialFieldConfig));
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={npcSpecialFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("Special Rule")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-special"], (item) =>
                  importIntoSchemaForm(npcSpecialFieldConfig, setFormState, item),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcSpecialFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcSpecialFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
            label="Metadata"
            cols={2}
          />
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedSpecialRuleCard item={data} />}
      addButton={
        <AddToCompendiumButton
          itemType={REG["npc-special"].addItemType}
          data={data}
        />
      }
      data={data}
      itemName={data.name || ""}
      exportDataType={REG["npc-special"].exportDataType}
    />
  );
}

// NPC Other Action panel

function NpcActionPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(npcActionFieldConfig),
  );

  const data = { ...formState, fuid: formState.fuid || undefined };

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(npcActionFieldConfig));
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={npcActionFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("Other Action")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-action"], (item) =>
                  importIntoSchemaForm(npcActionFieldConfig, setFormState, item),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcActionFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcActionFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
            label="Metadata"
            cols={2}
          />
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedActionCard item={data} />}
      addButton={
        <AddToCompendiumButton
          itemType={REG["npc-action"].addItemType}
          data={data}
        />
      }
      data={data}
      itemName={data.name || ""}
      exportDataType={REG["npc-action"].exportDataType}
    />
  );
}

// Player Spell panel

const SPELL_TYPE_TO_CLASS = {
  gift: "Esper",
  dance: "Dancer",
  therioform: "Mutant",
  "magichant-key": "Chanter",
  magichant: "Chanter",
  symbol: "Symbolist",
  invocation: "Invoker",
  arcanist: "Arcanist",
  "arcanist-rework": "Arcanist-Rework",
  "tinkerer-alchemy": "Tinkerer",
  "tinkerer-infusion": "Tinkerer",
  cooking: "Gourmet",
  magiseed: "Floralist",
  "pilot-vehicle": "Pilot",
};

const PILOT_MODULE_BASE_COST = {
  armor: 500,
  weapon: 500,
  support: 1000,
};

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
  const { openImport } = useQuickCreateImport();
  const initialSubtype = useQuickCreateSubtype();
  const [spellType, setSpellType] = useState("default");
  const [spellClass, setSpellClass] = useState(
    initialSubtype && spellClasses.includes(initialSubtype) ? initialSubtype : (spellClasses[0] ?? "")
  );
  const [name, setName] = useState("");
  const [fuid, setFuid] = useState(undefined);
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
  const [moduleCost, setModuleCost] = useState(PILOT_MODULE_BASE_COST.armor);
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
    setFuid(undefined);
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
    setModuleCost(PILOT_MODULE_BASE_COST.armor);
    setModuleDescription("");
    setWeaponCategory("Heavy");
    setDamageType("Physical");
    setPilotAtt1("might");
    setPilotAtt2("dexterity");
    setQuality("");
    setQualityCost(0);
    setIsShield(false);
  };

  const handleImportPlayerSpell = (item) => {
    const imported = stripPrivateFields(item ?? {});
    const importedType = String(imported.spellType ?? "default");
    const nextSpellType =
      importedType === "magichant" && imported.magichantSubtype === "key"
        ? "magichant-key"
        : importedType;

    setSpellType(nextSpellType || "default");
    setName(String(imported.name ?? ""));
    setFuid(imported.fuid || undefined);
    setSpellClass(String(imported.class ?? spellClasses[0] ?? ""));

    setDescription(String(imported.description ?? ""));
    setEffect(String(imported.effect ?? imported.description ?? ""));
    setEvent(String(imported.event ?? ""));
    setGenoclepsis(String(imported.genoclepsis ?? ""));

    setDuration(String(imported.duration ?? ""));
    setTargetDescription(String(imported.targetDescription ?? ""));
    setMaxTargets(String(imported.maxTargets ?? "1"));
    setPerTarget(Boolean(imported.cost?.perTarget ?? true));
    setMp(String(imported.cost?.amount ?? ""));
    setIsOffensive(Boolean(imported.isOffensive ?? false));
    setDamage(String(imported.damage?.value ?? ""));
    setDamageType(String(imported.damage?.type ?? "physical"));
    setHrZero(Boolean(imported.damage?.hrZero ?? false));
    setAttr1(String(imported.accuracy?.attr1 ?? "insight"));
    setAttr2(String(imported.accuracy?.attr2 ?? "will"));

    setDomain(String(imported.domain ?? ""));
    setDomainDesc(String(imported.domainDesc ?? ""));
    setMerge(String(imported.merge ?? ""));
    setMergeDesc(String(imported.mergeDesc ?? ""));
    setDismiss(String(imported.dismiss ?? ""));
    setDismissDesc(String(imported.dismissDesc ?? ""));
    setPulse(String(imported.pulse ?? ""));
    setPulseDesc(String(imported.pulseDesc ?? ""));

    setWellspring(String(imported.wellspring ?? ""));
    setInvType(String(imported.type ?? ""));
    setItemCategory(String(imported.category ?? ""));
    setInfusionRank(
      imported.infusionRank === undefined ? "" : String(imported.infusionRank),
    );
  };

  const data = {
    class: spellClass,
    name: name.trim(),
    fuid: fuid || undefined,
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
          fuid: fuid || undefined,
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
                  cost: Number(moduleCost) || PILOT_MODULE_BASE_COST.armor,
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
                  cost: Number(moduleCost) || PILOT_MODULE_BASE_COST.weapon,
                  accuracy: {
                    attr1: pilotAtt1,
                    attr2: pilotAtt2,
                    value: Number(modulePrec) || 0,
                    defense: "def",
                  },
                  damage: {
                    value: Number(moduleDamage) || 0,
                    type: String(damageType || "Physical").toLowerCase(),
                    hrZero: false,
                  },
                  range: moduleRange || "Melee",
                  cumbersome: moduleCumbersome,
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
                cost: Number(moduleCost) || PILOT_MODULE_BASE_COST.support,
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
                <FuidField
                  value={fuid}
                  name={name}
                  onChange={setFuid}
                  onBrowse={() =>
                    openImport(
                      QUICK_CREATE_TAB_TO_VIEWER_TYPE["player-spell"],
                      handleImportPlayerSpell,
                      {
                        initialSpellClass: SPELL_TYPE_TO_CLASS[spellType] ?? "",
                        ...(spellType === "pilot-vehicle"
                          ? { initialModuleTypeFilter: pilotSubtype }
                          : {}),
                      },
                    )
                  }
                  autoSync
                />
              </Grid>
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
                    <ToggleButtonGroup
                      value={pilotSubtype}
                      exclusive
                      onChange={(_, v) => {
                        if (v !== null) {
                          setPilotSubtype(v);
                          if (v === "armor" || v === "weapon" || v === "support") {
                            setModuleCost(PILOT_MODULE_BASE_COST[v]);
                          }
                        }
                      }}
                      size="small"
                      fullWidth
                    >
                      {PILOT_SUBTYPES.map((s) => (
                        <ToggleButton key={s.value} value={s.value}>
                          {t(s.label)}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Grid>

                  {/* Frame */}
                  {pilotSubtype === "frame" && (
                    <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                          {t("Frame")}
                        </Typography>
                      </Grid>
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
                    </Grid>
                  )}

                  {/* Support Module */}
                  {pilotSubtype === "support" && (
                    <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                          {t("Support Module")}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <TextField
                          label={t("Cost")}
                          value={moduleCost}
                          type="number"
                          fullWidth
                          size="small"
                          onChange={(e) => setModuleCost(e.target.value)}
                          slotProps={{ htmlInput: { min: 0 } }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {/* Armor Module */}
                  {pilotSubtype === "armor" && (
                    <>
                      <Grid size={12} container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
                        <Grid size={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                            {t("Armor")}
                          </Typography>
                        </Grid>
                        <Grid size="auto" sx={{ display: "flex", alignItems: "center" }}>
                          <ToggleButton
                            value="martial"
                            selected={moduleMartial}
                            onChange={() => setModuleMartial((v) => !v)}
                            size="small"
                          >
                            <Martial />
                          </ToggleButton>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField
                            label={moduleMartial ? "DEF" : t("DEX die") + " + DEF"}
                            value={moduleDef}
                            type="number"
                            fullWidth
                            size="small"
                            onChange={(e) => setModuleDef(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField
                            label={moduleMartial ? "MDEF" : t("INS die") + " + MDEF"}
                            value={moduleMdef}
                            type="number"
                            fullWidth
                            size="small"
                            onChange={(e) => setModuleMdef(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField
                            label={t("Cost")}
                            value={moduleCost}
                            type="number"
                            fullWidth
                            size="small"
                            onChange={(e) => setModuleCost(e.target.value)}
                            slotProps={{ htmlInput: { min: 0 } }}
                          />
                        </Grid>
                      </Grid>
                      <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                            {t("Description")}
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <CustomTextarea
                            label={t("Description (optional)")}
                            value={moduleDescription}
                            onChange={(e) => setModuleDescription(e.target.value)}
                            helperText=""
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {/* Weapon Module */}
                  {pilotSubtype === "weapon" && (
                    <>
                      <Grid size={12} container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
                        <Grid size={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                            {t("Weapon")}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t("Category")}</InputLabel>
                            <Select
                              value={weaponCategory}
                              label={t("Category")}
                              onChange={(e) => setWeaponCategory(e.target.value)}
                            >
                              {PILOT_WEAPON_CATEGORIES.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t("Range")}</InputLabel>
                            <Select
                              value={moduleRange || "Melee"}
                              label={t("Range")}
                              onChange={(e) => setModuleRange(e.target.value)}
                            >
                              {PILOT_RANGES.map((r) => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }} sx={{ display: "flex", alignItems: "center" }}>
                          <ToggleButton value="cumbersome" selected={moduleCumbersome} onChange={() => setModuleCumbersome((v) => !v)} size="small" sx={{ width: "100%" }}>
                            {t("Cumbersome")}
                          </ToggleButton>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }} sx={{ display: "flex", alignItems: "center" }}>
                          <ToggleButton value="isShield" selected={isShield} onChange={() => setIsShield((v) => !v)} size="small" sx={{ width: "100%" }}>
                            {t("Shield")}
                          </ToggleButton>
                        </Grid>
                      </Grid>
                      <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                            {t("Accuracy")}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t("Att 1")}</InputLabel>
                            <Select value={pilotAtt1} label={t("Att 1")} onChange={(e) => setPilotAtt1(e.target.value)}>
                              {ATTRS.map((a) => (<MenuItem key={a.value} value={a.value}>{t(a.label)}</MenuItem>))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t("Att 2")}</InputLabel>
                            <Select value={pilotAtt2} label={t("Att 2")} onChange={(e) => setPilotAtt2(e.target.value)}>
                              {ATTRS.map((a) => (<MenuItem key={a.value} value={a.value}>{t(a.label)}</MenuItem>))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField label={t("+Acc")} value={modulePrec} type="number" fullWidth size="small" onChange={(e) => setModulePrec(e.target.value)} />
                        </Grid>
                      </Grid>
                      <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                            {t("Damage")}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t("Damage Type")}</InputLabel>
                            <Select
                              value={damageType}
                              label={t("Damage Type")}
                              onChange={(e) => setDamageType(e.target.value)}
                              renderValue={(selected) => renderDamageTypeValue(String(selected).toLowerCase(), t)}
                            >
                              {PILOT_DAMAGE_TYPES.map((d) => (
                                <MenuItem key={d} value={d}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <TypeIcon type={String(d).toLowerCase()} />
                                    <span>{String(d).replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 2 }}>
                          <TextField label="HR+" value={moduleDamage} type="number" fullWidth size="small" onChange={(e) => setModuleDamage(e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField label={t("Cost")} value={moduleCost} type="number" fullWidth size="small" onChange={(e) => setModuleCost(e.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
                        </Grid>
                      </Grid>
                      <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                            {t("Quality")}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <TextField label={t("Quality Cost")} value={qualityCost} type="number" fullWidth size="small" onChange={(e) => setQualityCost(e.target.value)} />
                        </Grid>
                        <Grid size={12}>
                          <TextField label={t("Quality")} value={quality} fullWidth size="small" onChange={(e) => setQuality(e.target.value)} />
                        </Grid>
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
                  <Grid size={12} container spacing={2} sx={{ mb: spellType === "pilot-vehicle" ? 2 : 0 }}>
                    {spellType === "pilot-vehicle" && (
                      <Grid size={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                          {pilotSubtype === "support" ? t("Effect") : t("Description")}
                        </Typography>
                      </Grid>
                    )}
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
                  </Grid>
                )}
            </Grid>
          ) : (
            <>
              <Grid size={12}>
                <FuidField
                  value={fuid}
                  name={name}
                  onChange={setFuid}
                  onBrowse={() =>
                    openImport(
                      QUICK_CREATE_TAB_TO_VIEWER_TYPE["player-spell"],
                      handleImportPlayerSpell,
                      { initialSpellClass: spellClass },
                    )
                  }
                  autoSync
                />
              </Grid>
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
          itemType={REG["player-spell"].addItemType}
          data={spellType === "default" ? data : nonStaticData}
        />
      }
      exportDataType={REG["player-spell"].exportDataType}
    />
  );
}

// Quality panel

function QualityPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(qualityFieldConfig),
  );
  const [qualityTab, setQualityTab] = useState(0);

  const data = { ...formState, fuid: formState.fuid || undefined };

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(qualityFieldConfig));
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
                      setFormState((prev) => ({
                        ...prev,
                        name: q.name,
                        category: q.category,
                        quality: q.quality,
                        cost: q.cost,
                        filter: q.filter || [],
                      }));
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
              <SchemaFieldRenderer
                config={qualityFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                cols={2}
                extraProps={{
                  name: String(formState.name ?? ""),
                  onBrowse: () =>
                    openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.quality, (item) =>
                      importIntoSchemaForm(qualityFieldConfig, setFormState, item),
                    ),
                }}
              />
              <SchemaFieldRenderer
                config={qualityFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="body"
                cols={1}
              />
              <SchemaFieldRenderer
                config={qualityFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="meta"
                label="Metadata"
                cols={2}
              />
            </Grid>
          ) : (
            <QualitiesGenerator
              onGenerate={(text) =>
                setFormState((prev) => ({ ...prev, quality: text }))
              }
            />
          )}
          <Box sx={{ mt: 2 }}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Box>
        </Box>
      }
      previewContent={<SharedQualityCard item={data} />}
      addButton={
        <AddToCompendiumButton itemType={REG.quality.addItemType} data={data} />
      }
      exportDataType={REG.quality.exportDataType}
    />
  );
}

// Heroic panel

function HeroicPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(heroicFieldConfig),
  );

  const data = { ...formState, fuid: formState.fuid || undefined };

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(heroicFieldConfig));
  };

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={heroicFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.heroic, (item) =>
                  importIntoSchemaForm(heroicFieldConfig, setFormState, item),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={heroicFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={heroicFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
            label="Metadata"
            cols={2}
          />
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedHeroicCard item={data} />}
      addButton={
        <AddToCompendiumButton itemType={REG.heroic.addItemType} data={data} />
      }
      data={data}
      itemName={data.name || ""}
      exportDataType={REG.heroic.exportDataType}
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

function ClassPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(classFieldConfig),
  );

  const normalizedCustomBenefits = Array.isArray(formState.benefits?.custom)
    ? formState.benefits.custom
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object") {
            const value = entry.value;
            return typeof value === "string" ? value : "";
          }
          return "";
        })
        .filter((entry) => entry.trim())
    : [];

  const classData = {
    ...formState,
    name: String(formState.name ?? "").trim(),
    fuid: formState.fuid || undefined,
    book: String(formState.book ?? "").trim() || "homebrew",
    meta: createMetaFromBook(formState.book),
    benefits: {
      ...(formState.benefits ?? {}),
      custom: normalizedCustomBenefits,
      isCustomBenefit: normalizedCustomBenefits.length > 0,
    },
    skills: Array.isArray(formState.skills) ? formState.skills : [],
  };

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(classFieldConfig));
  };

  return (
    <>
      <PanelLayout
        formContent={
          <Grid container spacing={2}>
            <SchemaFieldRenderer
              config={classFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="core"
              cols={2}
              extraProps={{
                name: String(formState.name ?? ""),
                onBrowse: () =>
                  openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.class, (item) =>
                    importIntoSchemaForm(
                      classFieldConfig,
                      setFormState,
                      item,
                      localizeImportedClassItem,
                    ),
                  ),
              }}
            />
            <SchemaFieldRenderer
              config={classFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="benefits"
              label="Free Benefits"
              cols={3}
            />
            <SchemaFieldRenderer
              config={classFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="martials"
              cols={1}
            />
            <SchemaFieldRenderer
              config={classFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="spellClasses"
              cols={1}
            />
            <SchemaFieldRenderer
              config={classFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="skills"
              cols={1}
            />
            <SchemaFieldRenderer
              config={classFieldConfig}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="meta"
              label="Metadata"
              cols={2}
            />
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
              skills: classData.skills.filter((s) => s.skillName?.trim?.()),
            }}
          />
        }
        addButton={
          <AddToCompendiumButton itemType={REG.class.addItemType} data={classData} />
        }
        data={classData}
        itemName={classData.name || ""}
        exportDataType={REG.class.exportDataType}
      />
    </>
  );
}

// Weapon panel (inline form)

function buildWeaponPanelState() {
  const base = weapons[0];
  return {
    fuid: undefined,
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

function QualityPickerDialog({ open, onClose, onSelect, filterType }) {
  const { t } = useTranslate();
  const filtered = qualities.filter((q) => q.filter?.includes(filterType));
  const [search, setSearch] = useState("");
  const visible = search
    ? filtered.filter((q) =>
        q.name.toLowerCase().includes(search.toLowerCase()),
      )
    : filtered;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("Browse Qualities")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={t("Search...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, mt: 1 }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {visible.map((q) => (
            <Box
              key={q.fuid}
              onClick={() => {
                onSelect(q);
                onClose();
              }}
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography variant="subtitle2">
                {q.name} ({q.cost}z)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {q.quality}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
      </DialogActions>
    </Dialog>
  );
}

function WeaponPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(buildWeaponPanelState);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);

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
    fuid: formState.fuid || undefined,
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
    <>
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
                extraProps={{
                  name: String(name ?? ""),
                  onBrowse: () =>
                    openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.weapon, (item) =>
                      setFormState((prev) =>
                        mergeImportedIntoDefaults(buildWeaponPanelState(), stripPrivateFields(item)),
                      ),
                    ),
                }}
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
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
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
        addButton={
          <AddToCompendiumButton
            itemType={REG.weapon.addItemType}
            data={weaponObj}
          />
        }
        data={weaponObj}
        itemName={weaponObj.name || ""}
        exportDataType={REG.weapon.exportDataType}
      />
      <QualityPickerDialog
        open={qualityPickerOpen}
        onClose={() => setQualityPickerOpen(false)}
        filterType="weapon"
        onSelect={(q) =>
          setFormState((prev) => ({
            ...prev,
            selectedQuality: q.name,
            qualityName: q.name,
            quality: q.quality ?? "",
            qualityCost: q.cost ?? 0,
          }))
        }
      />
    </>
  );
}

// Armor panel (inline form)

function buildArmorPanelState() {
  const base = armor[0];
  return {
    fuid: undefined,
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
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(buildArmorPanelState);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);

  const { base, name, quality, cost } = formState;

  const armorObj = {
    base,
    ...base,
    name,
    fuid: formState.fuid || undefined,
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
    <>
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
                extraProps={{
                  name: String(name ?? ""),
                  onBrowse: () =>
                    openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.armor, (item) =>
                      setFormState((prev) =>
                        mergeImportedIntoDefaults(buildArmorPanelState(), stripPrivateFields(item)),
                      ),
                    ),
                }}
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
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
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
        addButton={
          <AddToCompendiumButton
            itemType={REG.armor.addItemType}
            data={armorObj}
          />
        }
        data={armorObj}
        itemName={armorObj.name || ""}
        exportDataType={REG.armor.exportDataType}
      />
      <QualityPickerDialog
        open={qualityPickerOpen}
        onClose={() => setQualityPickerOpen(false)}
        filterType="armor"
        onSelect={(q) =>
          setFormState((prev) => ({
            ...prev,
            selectedQuality: q.name,
            qualityName: q.name,
            quality: q.quality ?? "",
            qualityCost: q.cost ?? 0,
          }))
        }
      />
    </>
  );
}

// Shield panel (inline form)

function buildShieldPanelState() {
  const base = shields[0];
  return {
    fuid: undefined,
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
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(buildShieldPanelState);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);

  const { base, name, quality, cost } = formState;

  const shieldObj = {
    base,
    ...base,
    name,
    fuid: formState.fuid || undefined,
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
    <>
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
                extraProps={{
                  name: String(name ?? ""),
                  onBrowse: () =>
                    openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.shield, (item) =>
                      setFormState((prev) =>
                        mergeImportedIntoDefaults(buildShieldPanelState(), stripPrivateFields(item)),
                      ),
                    ),
                }}
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
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
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
        addButton={
          <AddToCompendiumButton
            itemType={REG.shield.addItemType}
            data={shieldObj}
          />
        }
        data={shieldObj}
        itemName={shieldObj.name || ""}
        exportDataType={REG.shield.exportDataType}
      />
      <QualityPickerDialog
        open={qualityPickerOpen}
        onClose={() => setQualityPickerOpen(false)}
        filterType="shield"
        onSelect={(q) =>
          setFormState((prev) => ({
            ...prev,
            selectedQuality: q.name,
            qualityName: q.name,
            quality: q.quality ?? "",
            qualityCost: q.cost ?? 0,
          }))
        }
      />
    </>
  );
}

// Custom Weapon panel

function buildCWPanelState() {
  return {
    fuid: undefined,
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
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(buildCWPanelState);
  const [modifiersExpanded, setModifiersExpanded] = useState(false);
  const [secondModifiersExpanded, setSecondModifiersExpanded] = useState(false);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);

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
    fuid: formState.fuid || undefined,
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
    <>
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
                extraProps={{
                  ...coreExtraProps,
                  name: String(formState.name ?? ""),
                  onBrowse: () =>
                    openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE["custom-weapon"], (item) =>
                      setFormState((prev) =>
                        mergeImportedIntoDefaults(buildCWPanelState(), stripPrivateFields(item)),
                      ),
                    ),
                }}
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
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
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
          <AddToCompendiumButton
            itemType={REG["custom-weapon"].addItemType}
            data={weaponObj}
          />
        }
        data={weaponObj}
        itemName={weaponObj.name || ""}
        exportDataType={REG["custom-weapon"].exportDataType}
      />
      <QualityPickerDialog
        open={qualityPickerOpen}
        onClose={() => setQualityPickerOpen(false)}
        filterType="customWeapon"
        onSelect={(q) =>
          setFormState((prev) => ({
            ...prev,
            selectedQuality: q.name,
            qualityName: q.name,
            quality: q.quality ?? "",
            qualityCost: q.cost ?? 0,
          }))
        }
      />
    </>
  );
}

// Accessory panel

function buildAccessoryPanelState() {
  return {
    fuid: undefined,
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
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(buildAccessoryPanelState);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);

  const { name, quality, cost } = formState;

  const accessoryObj = {
    name,
    fuid: formState.fuid || undefined,
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
    <>
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
                extraProps={{
                  name: String(name ?? ""),
                  onBrowse: () =>
                    openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.accessory, (item) =>
                      setFormState((prev) =>
                        mergeImportedIntoDefaults(buildAccessoryPanelState(), stripPrivateFields(item)),
                      ),
                    ),
                }}
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
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
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
          <AddToCompendiumButton
            itemType={REG.accessory.addItemType}
            data={accessoryObj}
          />
        }
        data={accessoryObj}
        itemName={accessoryObj.name || ""}
        exportDataType={REG.accessory.exportDataType}
      />
      <QualityPickerDialog
        open={qualityPickerOpen}
        onClose={() => setQualityPickerOpen(false)}
        filterType="accessory"
        onSelect={(q) =>
          setFormState((prev) => ({
            ...prev,
            selectedQuality: q.name,
            qualityName: q.name,
            quality: q.quality ?? "",
            qualityCost: q.cost ?? 0,
          }))
        }
      />
    </>
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
  const { openImport } = useQuickCreateImport();
  const { packs } = useCompendiumPacks();
  const initialSubtype = useQuickCreateSubtype();
  const validOptionalSubtypes = OPTIONAL_SUBTYPES.map((s) => s.value);
  const [subtype, setSubtype] = useState(
    initialSubtype && validOptionalSubtypes.includes(initialSubtype) ? initialSubtype : "quirk"
  );
  const [name, setName] = useState("");
  const [fuid, setFuid] = useState(undefined);
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
          fuid: fuid || undefined,
          description: description.trim(),
          effect: effect.trim(),
          meta: createMetaFromBook("homebrew"),
        }
      : subtype === "camp-activities"
        ? {
            subtype,
            name: name.trim(),
            fuid: fuid || undefined,
            description: targetDescription.trim(),
            effect: effect.trim(),
            meta: createMetaFromBook("homebrew"),
          }
        : subtype === "zero-trigger" || subtype === "zero-effect"
          ? {
              subtype,
              name: name.trim(),
              fuid: fuid || undefined,
              description: description.trim(),
              meta: createMetaFromBook("homebrew"),
            }
          : subtype === "zero-power"
            ? {
                subtype,
                name: name.trim(),
                fuid: fuid || undefined,
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
                meta: createMetaFromBook("homebrew"),
              }
            : /* other */ {
                subtype,
                name: name.trim(),
                fuid: fuid || undefined,
                description: description.trim(),
                effect: effect.trim(),
                ...(showClock
                  ? { clock: { sections: Number(clockSections) } }
                  : {}),
                meta: createMetaFromBook("homebrew"),
              };

  const handleClear = () => {
    setSubtype("quirk");
    setName("");
    setFuid(undefined);
    setDescription("");
    setEffect("");
    setTargetDescription("");
    setClockSections(6);
    setShowClock(false);
    setZeroTrigger(null);
    setZeroEffect(null);
  };

  const handleImportOptional = (item) => {
    const imported = stripPrivateFields(item ?? {});
    setSubtype(String(imported.subtype ?? "quirk"));
    setName(String(imported.name ?? ""));
    setFuid(imported.fuid || undefined);
    setDescription(String(imported.description ?? ""));
    setEffect(String(imported.effect ?? ""));
    setTargetDescription(String(imported.targetDescription ?? ""));
    const sections =
      imported?.clock?.sections ?? imported?.clockSections ?? imported?.clock;
    const parsedSections = Number(sections);
    if (Number.isFinite(parsedSections) && parsedSections > 0) {
      setClockSections(parsedSections);
      setShowClock(true);
    }
  };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Grid container spacing={2}>
          <Grid size={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                {t("Optional Rule")}
              </Typography>
            </Box>
          </Grid>
          <Grid size={12}>
            <FuidField
              value={fuid}
              name={name}
              onChange={setFuid}
              onBrowse={() =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE.optional,
                  handleImportOptional,
                )
              }
              autoSync
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
      addButton={
        <AddToCompendiumButton
          itemType={REG.optional.addItemType}
          data={data}
        />
      }
      exportDataType={REG.optional.exportDataType}
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
    ? {
        ...buildMnemosphere(selectedClass, Number(selectedLvl)),
        meta: createMetaFromBook("homebrew"),
      }
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
          <AddToCompendiumButton
            itemType={REG.mnemosphere.addItemType}
            data={data}
          />
        ) : null
      }
      data={data}
      itemName={data?.name || ""}
      exportDataType={REG.mnemosphere.exportDataType}
    />
  );
}

function HoplospherePanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(hoplosphereFieldConfig),
  );
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

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(hoplosphereFieldConfig));
    setCoagEffects([]);
  };

  const data = String(formState.name ?? "").trim()
    ? {
        name: String(formState.name ?? "").trim(),
        fuid: formState.fuid || undefined,
        description: formState.description,
        requiredSlots: Number(formState.requiredSlots),
        socketable: formState.socketable,
        cost: Number(formState.cost) || 0,
        coagEffects: coagEffects.reduce((acc, row) => {
          const threshold = Number(row.threshold);
          const effect = String(row.effect ?? "").trim();

          if (threshold > 1 && effect) {
            acc[threshold] = effect;
          }

          return acc;
        }, {}),
        meta: createMetaFromBook("homebrew"),
      }
    : null;

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={hoplosphereFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(QUICK_CREATE_TAB_TO_VIEWER_TYPE.hoplosphere, (item) => {
                  const defaults = createDefaultStateFromFields(hoplosphereFieldConfig);
                  const merged = mergeImportedIntoDefaults(defaults, stripPrivateFields(item));
                  setFormState(merged);
                  const importedCoag = merged?.coagEffects;
                  if (importedCoag && typeof importedCoag === "object") {
                    const rows = Object.entries(importedCoag)
                      .map(([threshold, effect]) => ({
                        threshold: Number(threshold),
                        effect: String(effect ?? ""),
                      }))
                      .filter((row) => row.threshold > 1 && row.effect.trim());
                    setCoagEffects(rows);
                  } else {
                    setCoagEffects([]);
                  }
                }),
            }}
          />
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label={t("Description")}
              value={formState.description ?? ""}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, description: e.target.value }))
              }
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
                  <CustomTextarea
                    label={t("Effect")}
                    value={row.effect}
                    onChange={(e) =>
                      handleCoagChange(index, "effect", e.target.value)
                    }
                    helperText=""
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
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
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
          <AddToCompendiumButton
            itemType={REG.hoplosphere.addItemType}
            data={data}
          />
        ) : null
      }
      data={data}
      itemName={data?.name || ""}
      exportDataType={REG.hoplosphere.exportDataType}
    />
  );
}

const TAB_CONFIG = {
  "npc-attack": { Panel: NpcAttackPanel },
  "npc-spell": { Panel: NpcSpellPanel },
  "npc-special": { Panel: NpcSpecialPanel },
  "npc-action": { Panel: NpcActionPanel },
  "player-spell": { Panel: PlayerSpellPanel },
  quality: { Panel: QualityPanel },
  heroic: { Panel: HeroicPanel },
  class: { Panel: ClassPanel },
  mnemosphere: { Panel: MnemospherePanel },
  hoplosphere: { Panel: HoplospherePanel },
  weapon: { Panel: WeaponPanel },
  "custom-weapon": { Panel: CustomWeaponPanel },
  armor: { Panel: ArmorPanel },
  shield: { Panel: ShieldPanel },
  accessory: { Panel: AccessoryPanel },
  optional: { Panel: OptionalPanel },
};

const TABS = QUICK_CREATE_TAB_KEYS.map((key) => ({
  key,
  label: itemFormRegistry[key].label,
  ...TAB_CONFIG[key],
}));

// Main component

export default function QuickCreateModal({
  open,
  onClose,
  lockedToViewerType,
  initialSubtype,
}) {
  const { t } = useTranslate();
  const tabsWrapRef = useRef(null);
  const tabsDragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const lockedTabKey = lockedToViewerType
    ? VIEWER_TYPE_TO_TAB_KEY[lockedToViewerType]
    : null;
  const lockedTabIdx =
    lockedTabKey != null ? TABS.findIndex((t) => t.key === lockedTabKey) : -1;
  const initialTab = lockedTabIdx >= 0 ? lockedTabIdx : 0;

  const [tab, setTab] = useState(initialTab);
  const [importRequest, setImportRequest] = useState(null);

  useEffect(() => {
    if (open) setTab(lockedTabIdx >= 0 ? lockedTabIdx : 0);
  }, [open, lockedTabIdx]);

  const getTabsScroller = () =>
    tabsWrapRef.current?.querySelector?.(".MuiTabs-scroller") ?? null;

  const handleTabsPointerDown = (event) => {
    const scroller = getTabsScroller();
    if (!scroller) return;
    tabsDragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: scroller.scrollLeft,
    };
  };

  const handleTabsPointerMove = (event) => {
    const scroller = getTabsScroller();
    if (!scroller || !tabsDragRef.current.active) return;
    const deltaX = event.clientX - tabsDragRef.current.startX;
    scroller.scrollLeft = tabsDragRef.current.startScrollLeft - deltaX;
  };

  const stopTabsDrag = () => {
    tabsDragRef.current.active = false;
  };

  const handleTabsWheel = (event) => {
    const scroller = getTabsScroller();
    if (!scroller) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      scroller.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  };

  const openImport = (viewerType, onImport, extraProps = {}) => {
    setImportRequest({ viewerType, onImport, extraProps });
  };

  const closeImport = () => setImportRequest(null);

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
      <Box
        ref={tabsWrapRef}
        sx={{ borderBottom: 1, borderColor: "divider" }}
        onPointerDown={handleTabsPointerDown}
        onPointerMove={handleTabsPointerMove}
        onPointerUp={stopTabsDrag}
        onPointerLeave={stopTabsDrag}
        onWheel={handleTabsWheel}
      >
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
              disabled={false}
            />
          ))}
        </Tabs>
      </Box>
      <QuickCreateImportContext.Provider value={{ openImport }}>
        <QuickCreateSubtypeContext.Provider value={initialSubtype ?? null}>
          <DialogContent sx={{ p: 0, flex: 1, overflow: "auto" }}>
            {TABS.map(({ key, Panel }, idx) => (
              <Box key={key} hidden={tab !== idx} sx={{ height: "100%" }}>
                {tab === idx && <Panel />}
              </Box>
            ))}
          </DialogContent>
        </QuickCreateSubtypeContext.Provider>
      </QuickCreateImportContext.Provider>
      <CompendiumViewerModal
        open={Boolean(importRequest)}
        onClose={closeImport}
        onAddItem={(item) => {
          importRequest?.onImport?.(item);
          closeImport();
        }}
        initialType={
          importRequest?.viewerType ?? QUICK_CREATE_TAB_TO_VIEWER_TYPE.class
        }
        restrictToTypes={
          importRequest?.viewerType ? [importRequest.viewerType] : undefined
        }
        {...(importRequest?.extraProps ?? {})}
      />
    </Dialog>
  );
}
