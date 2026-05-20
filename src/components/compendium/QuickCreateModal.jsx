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
import {
  weaponFieldConfig,
  weaponGroupLabels,
} from "../../forms/rendering/config/itemConfigs/weapon";
import {
  armorFieldConfig,
  armorGroupLabels,
} from "../../forms/rendering/config/itemConfigs/armor";
import FuidField from "../common/FuidField";
import {
  shieldFieldConfig,
  shieldGroupLabels,
} from "../../forms/rendering/config/itemConfigs/shield";
import {
  accessoryFieldConfig,
  accessoryGroupLabels,
} from "../../forms/rendering/config/itemConfigs/accessory";
import {
  customWeaponFieldConfig,
  customWeaponGroupLabels,
} from "../../forms/rendering/config/itemConfigs/customWeapon";
import {
  npcActionFieldConfig,
  npcActionGroupLabels,
} from "../../forms/rendering/config/itemConfigs/npcAction";
import {
  npcSpecialFieldConfig,
  npcSpecialGroupLabels,
} from "../../forms/rendering/config/itemConfigs/npcSpecial";
import {
  npcAttackFieldConfig,
  npcAttackGroupLabels,
} from "../../forms/rendering/config/itemConfigs/npcAttack";
import {
  npcSpellFieldConfig,
  npcSpellGroupLabels,
} from "../../forms/rendering/config/itemConfigs/npcSpell";
import {
  qualityFieldConfig,
  qualityGroupLabels,
} from "../../forms/rendering/config/itemConfigs/quality";
import { playerSpellFieldConfig } from "../../forms/rendering/config/itemConfigs/playerSpell";
import {
  heroicFieldConfig,
  heroicGroupLabels,
} from "../../forms/rendering/config/itemConfigs/heroic";
import {
  classFieldConfig,
  classGroupLabels,
} from "../../forms/rendering/config/itemConfigs/class";
import {
  hoplosphereFieldConfig,
  hoplosphereGroupLabels,
} from "../../forms/rendering/config/itemConfigs/hoplosphere";
import {
  optionalFieldConfig,
  optionalGroupLabels,
} from "../../forms/rendering/config/itemConfigs/optional";
import { createDefaultStateFromFields } from "../../forms/registry/helpers";
import { deriveIsOfficial } from "../../forms/rendering/config/metaFieldConfig";

// Shared constants
const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

function importIntoSchemaForm(
  fieldConfig,
  setFormState,
  item,
  transform = null,
) {
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
                ? staticT(skill.description, null, true)
                : skill.description,
          }
        : skill,
    );
  }
  if (
    next.benefits &&
    typeof next.benefits === "object" &&
    Array.isArray(next.benefits.custom)
  ) {
    next.benefits = {
      ...next.benefits,
      custom: next.benefits.custom.map((entry) =>
        typeof entry === "string" ? staticT(entry, null, true) : entry,
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
  if (!ctx)
    throw new Error(
      "useQuickCreateImport must be used within QuickCreateImportContext",
    );
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
            groupLabels={npcAttackGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("NPC Attack")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-attack"],
                  (item) =>
                    importIntoSchemaForm(
                      npcAttackFieldConfig,
                      setFormState,
                      item,
                    ),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            groupLabels={npcAttackGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="accuracy"
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            groupLabels={npcAttackGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="damage"
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            groupLabels={npcAttackGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="effect"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcAttackFieldConfig}
            groupLabels={npcAttackGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
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
        <AddToCompendiumButton
          itemType={REG["npc-attack"].addItemType}
          data={data}
        />
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
            groupLabels={npcSpellGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("NPC Spell")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-spell"],
                  (item) =>
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
            groupLabels={npcSpellGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="accuracy"
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            groupLabels={npcSpellGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="damage"
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            groupLabels={npcSpellGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="details"
            cols={2}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            groupLabels={npcSpellGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="effect"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcSpellFieldConfig}
            groupLabels={npcSpellGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
            cols={2}
          />
          <Grid size={12}>
            <Button size="small" variant="outlined" onClick={handleClear}>
              {t("Clear All Fields")}
            </Button>
          </Grid>
        </Grid>
      }
      previewContent={<SharedSpellCard item={data} />}
      addButton={
        <AddToCompendiumButton
          itemType={REG["npc-spell"].addItemType}
          data={data}
        />
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
            groupLabels={npcSpecialGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("Special Rule")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-special"],
                  (item) =>
                    importIntoSchemaForm(
                      npcSpecialFieldConfig,
                      setFormState,
                      item,
                    ),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcSpecialFieldConfig}
            groupLabels={npcSpecialGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcSpecialFieldConfig}
            groupLabels={npcSpecialGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
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
            groupLabels={npcActionGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("Other Action")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE["npc-action"],
                  (item) =>
                    importIntoSchemaForm(
                      npcActionFieldConfig,
                      setFormState,
                      item,
                    ),
                ),
            }}
          />
          <SchemaFieldRenderer
            config={npcActionFieldConfig}
            groupLabels={npcActionGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={npcActionFieldConfig}
            groupLabels={npcActionGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
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

// Pilot-vehicle constants (used by pilot JSX fallback)
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

function buildPlayerSpellPayload(state) {
  const { spellType, name, fuid } = state;
  const metaRaw = {
    book: state["meta.book"],
    page: state["meta.page"],
    bookName: state["meta.bookName"] || undefined,
    isOfficial: state["meta.isOfficial"],
  };
  const meta = state["meta.book"] ? metaRaw : undefined;

  const withMeta = (obj) => (meta ? { ...obj, meta } : obj);

  switch (spellType) {
    case "default":
      return withMeta({
        spellType: "default",
        class: state.class,
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        description: (state.description ?? "").trim(),
        isOffensive: state.isOffensive,
        cost: {
          resource: "mp",
          amount: state["cost.amount"] ?? 0,
          perTarget: state["cost.perTarget"] ?? true,
        },
        maxTargets: state.maxTargets ?? 1,
        targetDescription:
          (state.targetDescription ?? "").trim() || "One creature",
        duration: (state.duration ?? "").trim() || "Instantaneous",
        accuracy: {
          attr1: state["accuracy.attr1"] ?? "insight",
          attr2: state["accuracy.attr2"] ?? "will",
          value: 0,
          defense: "mdef",
        },
        damage: {
          value: state.isOffensive ? (state["damage.value"] ?? 0) : 0,
          type: state.isOffensive
            ? (state["damage.type"] ?? "physical")
            : "physical",
          hrZero: state["damage.hrZero"] ?? false,
        },
      });

    case "arcanist":
    case "arcanist-rework":
      return withMeta({
        spellType,
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        domain: (state.domain ?? "").trim() || undefined,
        domainDesc: (state.domainDesc ?? "").trim() || undefined,
        merge: (state.merge ?? "").trim() || undefined,
        mergeDesc: (state.mergeDesc ?? "").trim() || undefined,
        dismiss: (state.dismiss ?? "").trim() || undefined,
        dismissDesc: (state.dismissDesc ?? "").trim() || undefined,
        ...(spellType === "arcanist-rework" && {
          pulse: (state.pulse ?? "").trim() || undefined,
          pulseDesc: (state.pulseDesc ?? "").trim() || undefined,
        }),
      });

    case "tinkerer-alchemy":
      return withMeta({
        spellType: "tinkerer-alchemy",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        category: (state.category ?? "").trim() || undefined,
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "tinkerer-infusion":
      return withMeta({
        spellType: "tinkerer-infusion",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        infusionRank:
          state.infusionRank != null ? Number(state.infusionRank) : undefined,
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "gift":
      return withMeta({
        spellType: "gift",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        event: (state.event ?? "").trim(),
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "dance":
      return withMeta({
        spellType: "dance",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "therioform":
      return withMeta({
        spellType: "therioform",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        genoclepsis: (state.genoclepsis ?? "").trim(),
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "magichant":
      return withMeta({
        spellType: "magichant",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        magichantSubtype: "tone",
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "magichant-key":
      return withMeta({
        spellType: "magichant",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        magichantSubtype: "key",
        type: (state.keyType ?? "").trim() || undefined,
        status: (state.keyStatus ?? "").trim() || undefined,
        attribute: (state.keyAttribute ?? "").trim() || undefined,
        recovery: (state.keyRecovery ?? "").trim() || undefined,
      });

    case "symbol":
      return withMeta({
        spellType: "symbol",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "invocation":
      return withMeta({
        spellType: "invocation",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        wellspring: (state.wellspring ?? "").trim() || undefined,
        type: (state.invType ?? "").trim() || undefined,
        effect: (state.effect ?? "").trim(),
        description: (state.effect ?? "").trim(),
      });

    case "cooking":
      return withMeta({
        spellType: "cooking",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        cookbookEffects: (state.cookingEffects ?? []).map((row, i) => ({
          id: i + 1,
          effect: (row?.effect ?? "").trim(),
          taste1: "",
          taste2: "",
          customChoices: {},
        })),
      });

    case "magiseed":
      return withMeta({
        spellType: "magiseed",
        name: (name ?? "").trim(),
        fuid: fuid || undefined,
        description: (state.seedDescription ?? "").trim(),
        rangeStart: state.seedRangeStart ?? 1,
        rangeEnd: state.seedRangeEnd ?? 4,
        effects: {},
      });

    default:
      return null;
  }
}

function PlayerSpellPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const [formState, setFormState] = useState(() =>
    createDefaultStateFromFields(playerSpellFieldConfig),
  );

  // Pilot-vehicle local state (kept as-is - schema renderer not used for pilot-vehicle)
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
  const [pilotEffect, setPilotEffect] = useState("");
  const [weaponCategory, setWeaponCategory] = useState("Heavy");
  const [pilotAtt1, setPilotAtt1] = useState("might");
  const [pilotAtt2, setPilotAtt2] = useState("dexterity");
  const [pilotDamageType, setPilotDamageType] = useState("Physical");
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);
  const [isShield, setIsShield] = useState(false);
  const spellType = formState.spellType ?? "default";

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(playerSpellFieldConfig));
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
    setPilotEffect("");
    setWeaponCategory("Heavy");
    setPilotDamageType("Physical");
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

    // Build flat state for schema form
    const flatImport = {
      spellType: nextSpellType || "default",
      fuid: imported.fuid || undefined,
      name: String(imported.name ?? ""),
      class: String(imported.class ?? spellClasses[0] ?? ""),
      isOffensive: Boolean(imported.isOffensive ?? false),
      "cost.resource": "mp",
      "cost.amount": imported.cost?.amount ?? 0,
      "cost.perTarget": Boolean(imported.cost?.perTarget ?? true),
      maxTargets: imported.maxTargets ?? 1,
      targetDescription: String(imported.targetDescription ?? "One creature"),
      duration: String(imported.duration ?? "Instantaneous"),
      "accuracy.attr1": String(imported.accuracy?.attr1 ?? "insight"),
      "accuracy.attr2": String(imported.accuracy?.attr2 ?? "will"),
      "accuracy.value": 0,
      "accuracy.defense": "mdef",
      "damage.value": imported.damage?.value ?? 0,
      "damage.type": String(imported.damage?.type ?? "physical"),
      "damage.hrZero": Boolean(imported.damage?.hrZero ?? false),
      description: String(imported.description ?? ""),
      effect: String(imported.effect ?? imported.description ?? ""),
      event: String(imported.event ?? ""),
      genoclepsis: String(imported.genoclepsis ?? ""),
      domain: String(imported.domain ?? ""),
      domainDesc: String(imported.domainDesc ?? ""),
      merge: String(imported.merge ?? ""),
      mergeDesc: String(imported.mergeDesc ?? ""),
      dismiss: String(imported.dismiss ?? ""),
      dismissDesc: String(imported.dismissDesc ?? ""),
      pulse: String(imported.pulse ?? ""),
      pulseDesc: String(imported.pulseDesc ?? ""),
      wellspring: String(imported.wellspring ?? ""),
      invType: String(imported.type ?? ""),
      category: String(imported.category ?? ""),
      infusionRank:
        imported.infusionRank == null ? null : Number(imported.infusionRank),
      keyType:
        importedType === "magichant" && imported.magichantSubtype === "key"
          ? String(imported.type ?? "")
          : "",
      keyStatus:
        importedType === "magichant" && imported.magichantSubtype === "key"
          ? String(imported.status ?? "")
          : "",
      keyAttribute:
        importedType === "magichant" && imported.magichantSubtype === "key"
          ? String(imported.attribute ?? "")
          : "",
      keyRecovery:
        importedType === "magichant" && imported.magichantSubtype === "key"
          ? String(imported.recovery ?? "")
          : "",
      cookingEffects: (() => {
        const src = imported.cookbookEffects;
        if (Array.isArray(src)) {
          return src.map((r) => ({ effect: String(r?.effect ?? "") }));
        }
        if (src && typeof src === "object") {
          return Object.values(src).map((r) => ({
            effect: String(r?.effect ?? r ?? ""),
          }));
        }
        return Array.from({ length: 12 }, () => ({ effect: "" }));
      })(),
      seedDescription: String(imported.description ?? ""),
      seedRangeStart: imported.rangeStart ?? 1,
      seedRangeEnd: imported.rangeEnd ?? 4,
      "meta.book": imported.meta?.book ?? "",
      "meta.page": imported.meta?.page ?? undefined,
      "meta.bookName": imported.meta?.bookName ?? "",
      "meta.isOfficial": imported.meta?.isOfficial ?? false,
    };

    importIntoSchemaForm(playerSpellFieldConfig, setFormState, flatImport);

    // Pilot-vehicle - keep separate state
    if (nextSpellType === "pilot-vehicle") {
      const sub = imported.pilotSubtype ?? "frame";
      setPilotSubtype(sub);
      if (imported.frame) setVehicleFrame(imported.frame);
      if (imported.def !== undefined) setModuleDef(String(imported.def));
      if (imported.mdef !== undefined) setModuleMdef(String(imported.mdef));
      if (imported.martial !== undefined)
        setModuleMartial(Boolean(imported.martial));
      if (imported.cost !== undefined)
        setModuleCost(
          Number(imported.cost) || PILOT_MODULE_BASE_COST[sub] || 500,
        );
      if (imported.description)
        setModuleDescription(String(imported.description));
      if (imported.description || imported.effect)
        setPilotEffect(String(imported.effect ?? imported.description ?? ""));
      if (imported.category) setWeaponCategory(String(imported.category));
      if (imported.accuracy?.attr1)
        setPilotAtt1(String(imported.accuracy.attr1));
      if (imported.accuracy?.attr2)
        setPilotAtt2(String(imported.accuracy.attr2));
      if (imported.accuracy?.value !== undefined)
        setModulePrec(Number(imported.accuracy.value));
      if (imported.damage?.value !== undefined)
        setModuleDamage(String(imported.damage.value));
      if (imported.damage?.type)
        setPilotDamageType(String(imported.damage.type));
      if (imported.range) setModuleRange(String(imported.range));
      if (imported.cumbersome !== undefined)
        setModuleCumbersome(Boolean(imported.cumbersome));
      if (imported.quality !== undefined) setQuality(String(imported.quality));
      if (imported.qualityCost !== undefined)
        setQualityCost(Number(imported.qualityCost));
      if (imported.isShield !== undefined)
        setIsShield(Boolean(imported.isShield));
    }
  };

  // Build pilot-vehicle payload from local pilot state (schema renderer not used)
  const pilotPayload = (() => {
    const name = (formState.name ?? "").trim();
    const fuid = formState.fuid || undefined;
    const frameData = availableFrames.find((f) => f.name === vehicleFrame);
    const base = {
      spellType: "pilot-vehicle",
      name,
      fuid,
      pilotSubtype,
      customName: name,
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
        description: pilotEffect.trim(),
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
          type: String(pilotDamageType || "Physical").toLowerCase(),
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
      description: pilotEffect.trim(),
      isComplex: true,
      cost: Number(moduleCost) || PILOT_MODULE_BASE_COST.support,
    };
  })();

  const payload =
    spellType === "pilot-vehicle"
      ? pilotPayload
      : buildPlayerSpellPayload(formState);
  return (
    <PanelLayout
      data={payload}
      itemName={(formState.name ?? "").trim() || ""}
      formContent={
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          {/* Core: spellType, fuid, name */}
          <SchemaFieldRenderer
            config={playerSpellFieldConfig}
            state={formState}
            onChange={setFormState}
            surface="quickCreate"
            group="core"
            label={t("Player Spell")}
            cols={1}
            extraProps={{
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE["player-spell"],
                  handleImportPlayerSpell,
                  {
                    initialSpellClass: SPELL_TYPE_TO_CLASS[spellType] ?? "",
                    ...(spellType === "pilot-vehicle"
                      ? { initialModuleTypeFilter: pilotSubtype }
                      : {}),
                  },
                ),
            }}
          />

          {/* Pilot-vehicle fallback - not handled by schema renderer */}
          {spellType === "pilot-vehicle" ? (
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
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                      }}
                    >
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
                  <Grid size={12}>
                    <CustomTextarea
                      label={t("Description")}
                      value={pilotEffect}
                      onChange={(e) => setPilotEffect(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                </Grid>
              )}

              {/* Support Module */}
              {pilotSubtype === "support" && (
                <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
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
                  <Grid size={12}>
                    <CustomTextarea
                      label={t("Effect")}
                      value={pilotEffect}
                      onChange={(e) => setPilotEffect(e.target.value)}
                      helperText=""
                    />
                  </Grid>
                </Grid>
              )}

              {/* Armor Module */}
              {pilotSubtype === "armor" && (
                <>
                  <Grid
                    size={12}
                    container
                    spacing={2}
                    sx={{ mb: 2, alignItems: "center" }}
                  >
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
                        {t("Armor")}
                      </Typography>
                    </Grid>
                    <Grid
                      size="auto"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
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
                        label={
                          moduleMartial ? "MDEF" : t("INS die") + " + MDEF"
                        }
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
                  <Grid
                    size={12}
                    container
                    spacing={2}
                    sx={{ mb: 2, alignItems: "center" }}
                  >
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
                            <MenuItem key={c} value={c}>
                              {c}
                            </MenuItem>
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
                            <MenuItem key={r} value={r}>
                              {r}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      size={{ xs: 6, sm: 2 }}
                      sx={{ display: "flex", alignItems: "center" }}
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
                      size={{ xs: 6, sm: 2 }}
                      sx={{ display: "flex", alignItems: "center" }}
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
                  </Grid>
                  <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
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
                        {t("Accuracy")}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Att 1")}</InputLabel>
                        <Select
                          value={pilotAtt1}
                          label={t("Att 1")}
                          onChange={(e) => setPilotAtt1(e.target.value)}
                        >
                          {[
                            { value: "dexterity", label: "DEX" },
                            { value: "insight", label: "INS" },
                            { value: "might", label: "MIG" },
                            { value: "will", label: "WLP" },
                          ].map((a) => (
                            <MenuItem key={a.value} value={a.value}>
                              {t(a.label)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Att 2")}</InputLabel>
                        <Select
                          value={pilotAtt2}
                          label={t("Att 2")}
                          onChange={(e) => setPilotAtt2(e.target.value)}
                        >
                          {[
                            { value: "dexterity", label: "DEX" },
                            { value: "insight", label: "INS" },
                            { value: "might", label: "MIG" },
                            { value: "will", label: "WLP" },
                          ].map((a) => (
                            <MenuItem key={a.value} value={a.value}>
                              {t(a.label)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextField
                        label={t("+Acc")}
                        value={modulePrec}
                        type="number"
                        fullWidth
                        size="small"
                        onChange={(e) => setModulePrec(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
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
                        {t("Damage")}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t("Damage Type")}</InputLabel>
                        <Select
                          value={pilotDamageType}
                          label={t("Damage Type")}
                          onChange={(e) => setPilotDamageType(e.target.value)}
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
                                  {String(d).replace(/\b\w/g, (c) =>
                                    c.toUpperCase(),
                                  )}
                                </span>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <TextField
                        label="HR+"
                        value={moduleDamage}
                        type="number"
                        fullWidth
                        size="small"
                        onChange={(e) => setModuleDamage(e.target.value)}
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
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("Quality")}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
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
                  </Grid>
                </>
              )}
            </>
          ) : (
            <>
              {/* cost / target / accuracy / damage / description — default spell only */}
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="cost"
                label={t("Cost")}
                hidden={spellType !== "default"}
                cols={1}
              />
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="target"
                label={t("Target")}
                hidden={spellType !== "default"}
                cols={1}
              />
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="accuracy"
                label={t("Accuracy")}
                hidden={spellType !== "default"}
                cols={1}
              />
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="damage"
                label={t("Damage")}
                hidden={spellType !== "default" || !formState.isOffensive}
                cols={1}
              />
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="description"
                label={t("Details")}
                hidden={spellType !== "default"}
                cols={1}
              />
              {/* effect / type-specific fields — non-default spells */}
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="effect"
                label={t("Details")}
                hidden={spellType === "default"}
                cols={1}
              />
              {/* arcanist fields */}
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="arcanist"
                label={t("Arcanum")}
                hidden={
                  spellType !== "arcanist" && spellType !== "arcanist-rework"
                }
                cols={1}
              />
              {/* meta */}
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="quickCreate"
                group="meta"
                label={t("Metadata")}
                cols={2}
              />
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
          <SharedPlayerSpellCard item={payload} />
        ) : spellType === "gamble" ? (
          <SharedGambleSpellCard item={payload} />
        ) : spellType === "gift" ? (
          <SharedGiftCard item={payload} />
        ) : spellType === "dance" ? (
          <SharedDanceCard item={payload} />
        ) : spellType === "therioform" ? (
          <SharedTherioformCard item={payload} />
        ) : spellType === "magichant" || spellType === "magichant-key" ? (
          <SharedMagichantCard item={payload} />
        ) : spellType === "symbol" ? (
          <SharedSymbolCard item={payload} />
        ) : spellType === "invocation" ? (
          <SharedInvocationCard item={payload} />
        ) : spellType === "magiseed" ? (
          <SharedMagiseedCard item={payload} />
        ) : spellType === "tinkerer-alchemy" ? (
          <SharedAlchemyCard item={payload} />
        ) : spellType === "tinkerer-infusion" ? (
          <SharedInfusionCard item={payload} />
        ) : spellType === "tinkerer-magitech" ? (
          <SharedMagitechCard item={payload} />
        ) : spellType === "cooking" ? (
          <SharedCookingCard item={payload} />
        ) : spellType === "pilot-vehicle" ? (
          <SharedPilotVehicleCard item={payload} />
        ) : spellType === "arcanist" || spellType === "arcanist-rework" ? (
          <SharedArcanumCard item={payload} />
        ) : (
          <SharedPlayerSpellCard item={payload} />
        )
      }
      addButton={
        <AddToCompendiumButton
          itemType={REG["player-spell"].addItemType}
          data={payload}
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
                    openImport(
                      QUICK_CREATE_TAB_TO_VIEWER_TYPE.quality,
                      (item) =>
                        importIntoSchemaForm(
                          qualityFieldConfig,
                          setFormState,
                          item,
                        ),
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
                groupLabels={qualityGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="meta"
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
            groupLabels={heroicGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
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
    meta: createMetaFromBook(formState.meta?.book),
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
              groupLabels={classGroupLabels}
              state={formState}
              onChange={setFormState}
              surface="edit"
              group="meta"
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
          <AddToCompendiumButton
            itemType={REG.class.addItemType}
            data={classData}
          />
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
                groupLabels={weaponGroupLabels}
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
                        mergeImportedIntoDefaults(
                          buildWeaponPanelState(),
                          stripPrivateFields(item),
                        ),
                      ),
                    ),
                }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="accuracy"
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
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="damage"
                cols={2}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
                cols={2}
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="rareBonus"
                cols={1}
                extraProps={{
                  rework,
                  totalBonus,
                  basePrec: getWeaponPrec(base),
                }}
              />
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="rare"
                cols={2}
              />
              <SchemaFieldRenderer
                config={weaponFieldConfig}
                groupLabels={weaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="modifiers"
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
                groupLabels={armorGroupLabels}
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
                        mergeImportedIntoDefaults(
                          buildArmorPanelState(),
                          stripPrivateFields(item),
                        ),
                      ),
                    ),
                }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={armorFieldConfig}
                groupLabels={armorGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
                cols={2}
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={armorFieldConfig}
                groupLabels={armorGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="modifiers"
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
                groupLabels={shieldGroupLabels}
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
                        mergeImportedIntoDefaults(
                          buildShieldPanelState(),
                          stripPrivateFields(item),
                        ),
                      ),
                    ),
                }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={shieldFieldConfig}
                groupLabels={shieldGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
                cols={2}
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={shieldFieldConfig}
                groupLabels={shieldGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="modifiers"
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
                groupLabels={customWeaponGroupLabels}
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
                    openImport(
                      QUICK_CREATE_TAB_TO_VIEWER_TYPE["custom-weapon"],
                      (item) =>
                        setFormState((prev) =>
                          mergeImportedIntoDefaults(
                            buildCWPanelState(),
                            stripPrivateFields(item),
                          ),
                        ),
                    ),
                }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={customWeaponFieldConfig}
                groupLabels={customWeaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="accuracy"
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
                groupLabels={customWeaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="damage"
                cols={2}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={customWeaponFieldConfig}
                groupLabels={customWeaponGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
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
                    groupLabels={customWeaponGroupLabels}
                    state={formState}
                    onChange={setFormState}
                    surface="edit"
                    group="rare"
                    cols={2}
                  />
                  <SchemaFieldRenderer
                    config={customWeaponFieldConfig}
                    groupLabels={customWeaponGroupLabels}
                    state={formState}
                    onChange={setFormState}
                    surface="edit"
                    group="modifiers"
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
                    groupLabels={customWeaponGroupLabels}
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
                        groupLabels={customWeaponGroupLabels}
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
                groupLabels={accessoryGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                label={t("Accessory")}
                cols={2}
                extraProps={{
                  name: String(name ?? ""),
                  onBrowse: () =>
                    openImport(
                      QUICK_CREATE_TAB_TO_VIEWER_TYPE.accessory,
                      (item) =>
                        setFormState((prev) =>
                          mergeImportedIntoDefaults(
                            buildAccessoryPanelState(),
                            stripPrivateFields(item),
                          ),
                        ),
                    ),
                }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={accessoryFieldConfig}
                groupLabels={accessoryGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="quality"
                cols={2}
                extraProps={{ onBrowse: () => setQualityPickerOpen(true) }}
              />
            </Grid>
            <Grid size={12} container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={accessoryFieldConfig}
                groupLabels={accessoryGroupLabels}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="modifiers"
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

function OptionalPanel() {
  const { t } = useTranslate();
  const { openImport } = useQuickCreateImport();
  const { packs } = useCompendiumPacks();
  const initialSubtype = useQuickCreateSubtype();

  const [formState, setFormState] = useState(() => {
    const defaults = createDefaultStateFromFields(optionalFieldConfig);
    const validSubtypes =
      optionalFieldConfig
        .find((f) => f.key === "subtype")
        ?.componentProps?.options?.map((o) => o.value) ?? [];
    return {
      ...defaults,
      subtype:
        initialSubtype && validSubtypes.includes(initialSubtype)
          ? initialSubtype
          : "quirk",
    };
  });

  // zero-power: pack-sourced objects, not schema-driveable
  const [zeroTrigger, setZeroTrigger] = useState(null);
  const [zeroEffect, setZeroEffect] = useState(null);

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

  const subtype = formState.subtype;

  const data = String(formState.name ?? "").trim()
    ? subtype === "zero-power"
      ? {
          subtype,
          name: String(formState.name).trim(),
          fuid: formState.fuid || undefined,
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
          ...(formState.description
            ? { description: String(formState.description).trim() }
            : {}),
          clock: { sections: Number(formState.clockSections) || 6 },
          meta: createMetaFromBook("homebrew"),
        }
      : {
          subtype,
          name: String(formState.name).trim(),
          fuid: formState.fuid || undefined,
          ...(formState.description != null
            ? { description: String(formState.description).trim() }
            : {}),
          ...(formState.effect != null
            ? { effect: String(formState.effect).trim() }
            : {}),
          ...(formState.showClock && formState.clockSections
            ? { clock: { sections: Number(formState.clockSections) } }
            : {}),
          meta: createMetaFromBook("homebrew"),
        }
    : { subtype, name: "", meta: createMetaFromBook("homebrew") };

  const handleClear = () => {
    setFormState(createDefaultStateFromFields(optionalFieldConfig));
    setZeroTrigger(null);
    setZeroEffect(null);
  };

  const handleImport = (item) => {
    const imported = stripPrivateFields(item ?? {});
    const defaults = createDefaultStateFromFields(optionalFieldConfig);
    const sections =
      imported?.clock?.sections ?? imported?.clockSections ?? imported?.clock;
    const parsedSections = Number(sections);
    setFormState({
      ...defaults,
      subtype: String(imported.subtype ?? "quirk"),
      name: String(imported.name ?? ""),
      fuid: imported.fuid || "",
      description: String(imported.description ?? ""),
      effect: String(imported.effect ?? ""),
      clockSections:
        Number.isFinite(parsedSections) && parsedSections > 0
          ? parsedSections
          : 6,
      showClock: Number.isFinite(parsedSections) && parsedSections > 0,
    });
    setZeroTrigger(null);
    setZeroEffect(null);
  };

  return (
    <PanelLayout
      data={data}
      itemName={data.name || ""}
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={optionalFieldConfig}
            groupLabels={optionalGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            label={t("Optional Rule")}
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE.optional,
                  handleImport,
                  { initialOptionalSubtypes: [formState.subtype] },
                ),
            }}
          />
          <SchemaFieldRenderer
            config={optionalFieldConfig}
            groupLabels={optionalGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
          <SchemaFieldRenderer
            config={optionalFieldConfig}
            groupLabels={optionalGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="clock"
            cols={2}
          />
          {subtype === "zero-power" && (
            <>
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
        meta: deriveIsOfficial(formState) ?? createMetaFromBook("homebrew"),
      }
    : null;

  return (
    <PanelLayout
      formContent={
        <Grid container spacing={2}>
          <SchemaFieldRenderer
            config={hoplosphereFieldConfig}
            groupLabels={hoplosphereGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="core"
            cols={2}
            extraProps={{
              name: String(formState.name ?? ""),
              onBrowse: () =>
                openImport(
                  QUICK_CREATE_TAB_TO_VIEWER_TYPE.hoplosphere,
                  (item) => {
                    const defaults = createDefaultStateFromFields(
                      hoplosphereFieldConfig,
                    );
                    const merged = mergeImportedIntoDefaults(
                      defaults,
                      stripPrivateFields(item),
                    );
                    setFormState(merged);
                    const importedCoag = merged?.coagEffects;
                    if (importedCoag && typeof importedCoag === "object") {
                      const rows = Object.entries(importedCoag)
                        .map(([threshold, effect]) => ({
                          threshold: Number(threshold),
                          effect: String(effect ?? ""),
                        }))
                        .filter(
                          (row) => row.threshold > 1 && row.effect.trim(),
                        );
                      setCoagEffects(rows);
                    } else {
                      setCoagEffects([]);
                    }
                  },
                ),
            }}
          />
          <SchemaFieldRenderer
            config={hoplosphereFieldConfig}
            groupLabels={hoplosphereGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="body"
            cols={1}
          />
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
                  <Box sx={{ flex: 1 }}>
                    <CustomTextarea
                      label={t("hoplosphere.coag.effect")}
                      value={row.effect}
                      onChange={(e) =>
                        handleCoagChange(index, "effect", e.target.value)
                      }
                      helperText=""
                    />
                  </Box>
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
          <SchemaFieldRenderer
            config={hoplosphereFieldConfig}
            groupLabels={hoplosphereGroupLabels}
            state={formState}
            onChange={setFormState}
            surface="edit"
            group="meta"
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
            <Tab key={item.key} label={t(item.label)} disabled={false} />
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
