import { Grid, Paper, Button, useTheme, IconButton, Tooltip } from "@mui/material";
import { AutoFixHigh, Download, Search } from "@mui/icons-material";
import { useState, useRef } from "react";
import {
  SharedPlayerSpellCard,
  SharedGiftCard,
  SharedDanceCard,
  SharedTherioformCard,
  SharedSymbolCard,
  SharedInvocationCard,
  SharedMagichantCard,
  SharedAlchemyCard,
  SharedInfusionCard,
  SharedMagitechCard,
} from "../../../components/shared/items";
import { useTranslate } from "../../../translation/translate";
import { useStickyTop } from "../../../hooks/useStickyTop";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import Export from "../../../components/Export";
import AddToCompendiumButton from "../../../components/compendium/AddToCompendiumButton";
import CompendiumViewerModal from "../../../components/compendium/CompendiumViewerModal";
import useDownloadImage from "../../../hooks/useDownloadImage";
import useUploadJSON from "../../../hooks/useUploadJSON";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import { playerSpellFieldConfig } from "../../../forms/rendering/config/itemConfigs/spells";

function buildInitialState() {
  return {
    spellType: "default",
    fuid: undefined,
    name: "",
    class: "Elementalist",
    isOffensive: false,
    "cost.resource": "mp",
    "cost.amount": 0,
    "cost.perTarget": false,
    maxTargets: 1,
    targetDescription: "One creature",
    duration: "Instantaneous",
    "accuracy.attr1": "insight",
    "accuracy.attr2": "will",
    "accuracy.value": 0,
    "accuracy.defense": "mdef",
    "damage.value": 0,
    "damage.type": "physical",
    "damage.hrZero": false,
    description: "",
    // arcanist (not rendered here, zeroed)
    domain: "",
    domainDesc: "",
    merge: "",
    mergeDesc: "",
    pulse: "",
    pulseDesc: "",
    dismiss: "",
    dismissDesc: "",
    // tinkerer
    category: "",
    infusionRank: null,
    // gift
    event: "",
    // therioform
    genoclepsis: "",
    // magichant-key / invocation shared "type" field
    type: "",
    // magichant-key
    status: "",
    attribute: "",
    recovery: "",
    // tone / dance / symbol / gift / invocation effect
    effect: "",
    // invocation
    wellspring: "",
    // cooking (excluded, zeroed)
    cookingEffects: [],
    // magiseed (excluded, zeroed)
    seedDescription: "",
    seedRangeStart: 1,
    seedRangeEnd: 6,
    // meta
    "meta.book": "",
    "meta.page": undefined,
    "meta.bookName": "",
    "meta.isOfficial": false,
  };
}

function buildSpellData(s) {
  return {
    spellType: s.spellType === "magichant-key" ? "magichant" : s.spellType,
    magichantSubtype: s.spellType === "magichant-key" ? "key" : undefined,
    name: s.name,
    fuid: s.fuid,
    class: s.class,
    isOffensive: s.isOffensive,
    cost: {
      amount: s["cost.amount"],
      perTarget: s["cost.perTarget"],
      resource: "mp",
    },
    maxTargets: s.maxTargets,
    targetDescription: s.targetDescription,
    duration: s.duration,
    accuracy: {
      attr1: s["accuracy.attr1"],
      attr2: s["accuracy.attr2"],
      value: s["accuracy.value"],
      defense: s["accuracy.defense"],
    },
    damage: {
      value: s["damage.value"],
      type: s["damage.type"],
      hrZero: s["damage.hrZero"],
    },
    description: s.description,
    effect: s.effect,
    event: s.event,
    genoclepsis: s.genoclepsis,
    wellspring: s.wellspring,
    type: s.type,
    status: s.status,
    attribute: s.attribute,
    recovery: s.recovery,
    category: s.category,
    infusionRank: s.infusionRank,
  };
}

function SpellCardRouter({ item, variant, imageMode, showImageToggle, actionContent }) {
  switch (item.spellType) {
    case "gift":
      return <SharedGiftCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "dance":
      return <SharedDanceCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "therioform":
      return <SharedTherioformCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "symbol":
      return <SharedSymbolCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "invocation":
      return <SharedInvocationCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "magichant":
      return <SharedMagichantCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "tinkerer-alchemy":
      return <SharedAlchemyCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "tinkerer-infusion":
      return <SharedInfusionCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    case "tinkerer-magitech":
      return <SharedMagitechCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
    default:
      return <SharedPlayerSpellCard item={item} variant={variant} imageMode={imageMode} showImageToggle={showImageToggle} actionContent={actionContent} />;
  }
}

function Spells({ variant = "equip" }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const stickyTop = useStickyTop();
  const secondary = theme.palette.secondary.main;

  const [formState, setFormState] = useState(buildInitialState);
  const [compendiumOpen, setCompendiumOpen] = useState(false);

  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [downloadImage, downloadSnackbar] = useDownloadImage(formState.name, cardRef);

  const { handleFileUpload } = useUploadJSON((data) => {
    if (!data) return;
    setFormState((prev) => ({
      ...prev,
      spellType: data.spellType ?? prev.spellType,
      fuid: data.fuid ?? prev.fuid,
      name: data.name ?? prev.name,
      class: data.class ?? prev.class,
      isOffensive: data.isOffensive ?? prev.isOffensive,
      "cost.amount": data.cost?.amount ?? prev["cost.amount"],
      "cost.perTarget": data.cost?.perTarget ?? prev["cost.perTarget"],
      maxTargets: data.maxTargets ?? prev.maxTargets,
      targetDescription: data.targetDescription ?? prev.targetDescription,
      duration: data.duration ?? prev.duration,
      "accuracy.attr1": data.accuracy?.attr1 ?? prev["accuracy.attr1"],
      "accuracy.attr2": data.accuracy?.attr2 ?? prev["accuracy.attr2"],
      "damage.value": data.damage?.value ?? prev["damage.value"],
      "damage.type": data.damage?.type ?? prev["damage.type"],
      "damage.hrZero": data.damage?.hrZero ?? prev["damage.hrZero"],
      description: data.description ?? prev.description,
      effect: data.effect ?? prev.effect,
      event: data.event ?? prev.event,
      genoclepsis: data.genoclepsis ?? prev.genoclepsis,
      wellspring: data.wellspring ?? prev.wellspring,
      type: data.type ?? prev.type,
      status: data.status ?? prev.status,
      attribute: data.attribute ?? prev.attribute,
      recovery: data.recovery ?? prev.recovery,
      category: data.category ?? prev.category,
      infusionRank: data.infusionRank ?? prev.infusionRank,
    }));
  });

  const handleSpellSelected = (item) => {
    setFormState((prev) => ({
      ...prev,
      spellType: item.spellType ?? prev.spellType,
      fuid: item.fuid ?? prev.fuid,
      name: item.name ?? prev.name,
      class: item.class ?? prev.class,
      isOffensive: item.isOffensive ?? prev.isOffensive,
      "cost.amount": item.cost?.amount ?? prev["cost.amount"],
      "cost.perTarget": item.cost?.perTarget ?? prev["cost.perTarget"],
      maxTargets: item.maxTargets ?? prev.maxTargets,
      targetDescription: item.targetDescription ?? prev.targetDescription,
      duration: item.duration ?? prev.duration,
      "accuracy.attr1": item.accuracy?.attr1 ?? prev["accuracy.attr1"],
      "accuracy.attr2": item.accuracy?.attr2 ?? prev["accuracy.attr2"],
      "damage.value": item.damage?.value ?? prev["damage.value"],
      "damage.type": item.damage?.type ?? prev["damage.type"],
      "damage.hrZero": item.damage?.hrZero ?? prev["damage.hrZero"],
      description: item.description ?? prev.description,
      effect: item.effect ?? prev.effect,
      event: item.event ?? prev.event,
      genoclepsis: item.genoclepsis ?? prev.genoclepsis,
      wellspring: item.wellspring ?? prev.wellspring,
      type: item.type ?? prev.type,
      status: item.status ?? prev.status,
      attribute: item.attribute ?? prev.attribute,
      recovery: item.recovery ?? prev.recovery,
      category: item.category ?? prev.category,
      infusionRank: item.infusionRank ?? prev.infusionRank,
    }));
    setCompendiumOpen(false);
  };

  const handleClearFields = () => setFormState(buildInitialState());

  const spellData = buildSpellData(formState);

  return (
    <>
      <Grid container spacing={2}>
        {/* Form */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={3}
            sx={{
              p: "14px",
              borderRadius: "8px",
              border: "2px solid",
              borderColor: secondary,
            }}
          >
            <CustomHeaderAlt
              headerText={t("Spells")}
              icon={<AutoFixHigh fontSize="large" />}
              actionIcon={<Search fontSize="large" />}
              onAction={() => setCompendiumOpen(true)}
            />
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="cost"
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="target"
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="accuracy"
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="damage"
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="description"
              />
            </Grid>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <SchemaFieldRenderer
                config={playerSpellFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="effect"
              />
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => fileInputRef.current.click()}
                >
                  {t("Upload JSON")}
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleClearFields}
                >
                  {t("Clear All Fields")}
                </Button>
              </Grid>
            </Grid>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </Paper>
        </Grid>
        {/* Preview */}
        <Grid
          size={{ xs: 12, sm: 6 }}
          sx={{ position: "sticky", top: stickyTop, alignSelf: "flex-start" }}
        >
          <div ref={cardRef}>
            <SpellCardRouter
              item={spellData}
              variant={variant}
              imageMode="slot"
              showImageToggle
              actionContent={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Tooltip title={t("Download as Image")}>
                    <IconButton onClick={downloadImage}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Export
                    name={formState.name}
                    dataType="player-spells"
                    data={spellData}
                  />
                  <AddToCompendiumButton
                    itemType="player-spell"
                    data={spellData}
                  />
                </div>
              }
            />
          </div>
        </Grid>
      </Grid>
      {downloadSnackbar}
      <CompendiumViewerModal
        open={compendiumOpen}
        onClose={() => setCompendiumOpen(false)}
        onAddItem={handleSpellSelected}
        initialType="player-spells"
      />
    </>
  );
}
export default Spells;
