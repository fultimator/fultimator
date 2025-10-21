import React, { useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Divider,
  Box,
  useTheme,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { AutoAwesome, Download, ExpandMore } from "@mui/icons-material";
import CustomHeaderAlt from "../../../components/common/CustomHeaderAlt";
import ChangeCategory from "./ChangeCategory";
import ChangeRange from "./ChangeRange";
import ChangeAccuracyCheck from "./ChangeAccuracyCheck";
import ChangeType from "./ChangeType";
import ChangeCustomizations from "./ChangeCustomizations";
import PrettyCustomWeapon from "./PrettyCustomWeapon";
import Export from "../../../components/Export";
import useDownloadImage from "../../../hooks/useDownloadImage";
import SelectQuality from "../weapons/SelectQuality";
import ChangeQuality from "../common/ChangeQuality";
import qualities from "../weapons/qualities";
import { categories, range, accuracyChecks, customizations, types } from "./libs.jsx";

function CustomWeapons() {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const weaponCardsRef = React.useRef();
  const fileInputRef = React.useRef();

  // Primary weapon state
  const [weaponName, setWeaponName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedRange, setSelectedRange] = useState(range[0]);
  const [selectedAccuracyCheck, setSelectedAccuracyCheck] = useState(accuracyChecks[0]);
  const [selectedType, setSelectedType] = useState(types[0]);
  const [currentCustomizations, setCurrentCustomizations] = useState([]);
  const [selectedCustomization, setSelectedCustomization] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [quality, setQuality] = useState("");
  const [qualityCost, setQualityCost] = useState(0);

  // Secondary weapon state (for transforming weapons)
  const [secondWeaponName, setSecondWeaponName] = useState("");
  const [secondSelectedCategory, setSecondSelectedCategory] = useState(categories[0]);
  const [secondSelectedRange, setSecondSelectedRange] = useState(range[0]);
  const [secondSelectedAccuracyCheck, setSecondSelectedAccuracyCheck] = useState(accuracyChecks[0]);
  const [secondSelectedType, setSecondSelectedType] = useState(types[0]);
  const [secondCurrentCustomizations, setSecondCurrentCustomizations] = useState([]);
  const [secondSelectedCustomization, setSecondSelectedCustomization] = useState("");
  const [secondSelectedQuality, setSecondSelectedQuality] = useState("");
  const [secondQuality, setSecondQuality] = useState("");
  const [secondQualityCost, setSecondQualityCost] = useState(0);

  // Override states for manual adjustments
  const [overrideAccuracy, setOverrideAccuracy] = useState(false);
  const [overrideDamage, setOverrideDamage] = useState(false);
  const [overrideType, setOverrideType] = useState(false);
  const [customAccuracyMod, setCustomAccuracyMod] = useState(0);
  const [customDamageMod, setCustomDamageMod] = useState(0);
  const [customDamageType, setCustomDamageType] = useState("physical");
  
  // Additional modifiers (matching player equipment)
  const [defModifier, setDefModifier] = useState(0);
  const [mDefModifier, setMDefModifier] = useState(0);
  const [modifiersExpanded, setModifiersExpanded] = useState(false);

  // Secondary weapon overrides
  const [secondOverrideAccuracy, setSecondOverrideAccuracy] = useState(false);
  const [secondOverrideDamage, setSecondOverrideDamage] = useState(false);
  const [secondOverrideType, setSecondOverrideType] = useState(false);
  const [secondCustomAccuracyMod, setSecondCustomAccuracyMod] = useState(0);
  const [secondCustomDamageMod, setSecondCustomDamageMod] = useState(0);
  const [secondCustomDamageType, setSecondCustomDamageType] = useState("physical");
  
  // Additional secondary modifiers (matching player equipment)
  const [secondDefModifier, setSecondDefModifier] = useState(0);
  const [secondMDefModifier, setSecondMDefModifier] = useState(0);
  const [secondModifiersExpanded, setSecondModifiersExpanded] = useState(false);

  // Check if weapon has transforming customization
  const hasTransforming = currentCustomizations.some(
    (c) => c.name === "weapon_customization_transforming"
  );

  // Check if weapon has elemental customization
  const hasElemental = currentCustomizations.some(
    (c) => c.name === "weapon_customization_elemental"
  );
  const secondHasElemental = secondCurrentCustomizations.some(
    (c) => c.name === "weapon_customization_elemental"
  );

  // Combined download for transforming weapons
  const [downloadCombinedImage, downloadSnackbar] = useDownloadImage(
    `${weaponName || "Custom Weapon"}_transforming`,
    weaponCardsRef
  );

  // Handle category change and remove invalid customizations
  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);

    // Remove 'powerful' customization if switching to arcane or dagger
    if (
      newCategory === "weapon_category_arcane" ||
      newCategory === "weapon_category_dagger"
    ) {
      setCurrentCustomizations((prev) =>
        prev.filter((c) => c.name !== "weapon_customization_powerful")
      );
    }
  };

  const handleSecondCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSecondSelectedCategory(newCategory);

    // Remove 'powerful' customization if switching to arcane or dagger
    if (
      newCategory === "weapon_category_arcane" ||
      newCategory === "weapon_category_dagger"
    ) {
      setSecondCurrentCustomizations((prev) =>
        prev.filter((c) => c.name !== "weapon_customization_powerful")
      );
    }
  };

  // Handle customization addition
  const handleCustomizationAdd = () => {
    if (selectedCustomization) {
      const customToAdd = customizations.find(
        (c) => c.name === selectedCustomization
      );
      if (customToAdd) {
        setCurrentCustomizations((prev) => [...prev, customToAdd]);
        setSelectedCustomization("");
      }
    }
  };

  const handleSecondCustomizationAdd = () => {
    if (secondSelectedCustomization) {
      const customToAdd = customizations.find(
        (c) => c.name === secondSelectedCustomization
      );
      if (customToAdd) {
        setSecondCurrentCustomizations((prev) => [...prev, customToAdd]);
        setSecondSelectedCustomization("");
      }
    }
  };

  // Handle customization removal
  const handleCustomizationRemove = (customizationToRemove) => {
    setCurrentCustomizations((prev) =>
      prev.filter((c) => c.name !== customizationToRemove.name)
    );
  };

  const handleSecondCustomizationRemove = (customizationToRemove) => {
    // Prevent removing transforming from second form
    if (customizationToRemove.name === "weapon_customization_transforming") {
      return;
    }
    setSecondCurrentCustomizations((prev) =>
      prev.filter((c) => c.name !== customizationToRemove.name)
    );
  };

  // Initialize second form with transforming customization when needed
  React.useEffect(() => {
    if (hasTransforming && secondCurrentCustomizations.length === 0) {
      const transformingCustom = customizations.find(
        (c) => c.name === "weapon_customization_transforming"
      );
      if (transformingCustom) {
        setSecondCurrentCustomizations([transformingCustom]);
      }
    }
  }, [hasTransforming, secondCurrentCustomizations.length]);

  // Clear all fields
  const handleClearFields = () => {
    setWeaponName("");
    setSelectedCategory(categories[0]);
    setSelectedRange(range[0]);
    setSelectedAccuracyCheck(accuracyChecks[0]);
    setSelectedType(types[0]);
    setCurrentCustomizations([]);
    setSelectedCustomization("");
    setSelectedQuality("");
    setQuality("");
    setQualityCost(0);

    setSecondWeaponName("");
    setSecondSelectedCategory(categories[0]);
    setSecondSelectedRange(range[0]);
    setSecondSelectedAccuracyCheck(accuracyChecks[0]);
    setSecondSelectedType(types[0]);
    setSecondCurrentCustomizations([]);
    setSecondSelectedCustomization("");
    setSecondSelectedQuality("");
    setSecondQuality("");
    setSecondQualityCost(0);

    // Reset override states
    setOverrideAccuracy(false);
    setOverrideDamage(false);
    setOverrideType(false);
    setCustomAccuracyMod(0);
    setCustomDamageMod(0);
    setCustomDamageType("physical");
    
    // Reset additional modifiers
    setDefModifier(0);
    setMDefModifier(0);
    setModifiersExpanded(false);

    // Reset secondary weapon overrides
    setSecondOverrideAccuracy(false);
    setSecondOverrideDamage(false);
    setSecondOverrideType(false);
    setSecondCustomAccuracyMod(0);
    setSecondCustomDamageMod(0);
    setSecondCustomDamageType("physical");
    
    // Reset additional secondary modifiers
    setSecondDefModifier(0);
    setSecondMDefModifier(0);
    setSecondModifiersExpanded(false);
  };

  const handleFileUpload = (data) => {
    if (data && data.dataType === "weapon") {
      // Clear all fields first
      setWeaponName("");
      setSelectedCategory("");
      setSelectedRange("");
      setSelectedAccuracyCheck(accuracyChecks[0]);
      setSelectedType("");
      setCurrentCustomizations([]);
      setSelectedQuality("");
      setQuality("");
      setQualityCost(0);
      setTimeout(() => {
        if (data.name) {
          setWeaponName(data.name);
        }
        if (data.category && categories.includes(data.category)) {
          setSelectedCategory(data.category);
        }
        if (data.range && range.includes(data.range)) {
          setSelectedRange(data.range);
        }
        if (data.accuracyCheck && data.accuracyCheck.att1 && data.accuracyCheck.att2) {
          const matchingCheck = accuracyChecks.find(
            check => check.att1 === data.accuracyCheck.att1 && check.att2 === data.accuracyCheck.att2
          );
          if (matchingCheck) {
            setSelectedAccuracyCheck(matchingCheck);
          }
        }
        if (data.type && types.includes(data.type)) {
          setSelectedType(data.type);
        }
        if (data.customizations && Array.isArray(data.customizations)) {
          const validCustomizations = data.customizations.filter(custom =>
            customizations.some(c => c.name === custom.name)
          );
          setCurrentCustomizations(validCustomizations);
        }
        if (data.quality) {
          setSelectedQuality("");
          setQuality(data.quality);
        }
        if (data.qualityCost !== undefined) {
          setQualityCost(data.qualityCost);
        }

        // Handle modifiers (map standard format to generator fields)
        if (data.damageModifier !== undefined) {
          setOverrideDamage(data.damageModifier !== 0);
          setCustomDamageMod(data.damageModifier);
        }
        if (data.precModifier !== undefined) {
          setOverrideAccuracy(data.precModifier !== 0);
          setCustomAccuracyMod(data.precModifier);
        }
        if (data.defModifier !== undefined) {
          setDefModifier(data.defModifier);
        }
        if (data.mDefModifier !== undefined) {
          setMDefModifier(data.mDefModifier);
        }
        if (data.overrideDamageType !== undefined) {
          setOverrideType(data.overrideDamageType);
        }
        if (data.customDamageType !== undefined) {
          setCustomDamageType(data.customDamageType);
        }
        
        // Auto-expand modifiers if any are set
        setModifiersExpanded(
          (data.damageModifier && data.damageModifier !== 0) ||
          (data.precModifier && data.precModifier !== 0) ||
          (data.defModifier && data.defModifier !== 0) ||
          (data.mDefModifier && data.mDefModifier !== 0) ||
          data.overrideDamageType
        );

        // Handle secondary weapon data for transforming weapons
        if (data.secondWeaponName) {
          setSecondWeaponName(data.secondWeaponName);
        }
        if (data.secondSelectedCategory && categories.includes(data.secondSelectedCategory)) {
          setSecondSelectedCategory(data.secondSelectedCategory);
        }
        if (data.secondSelectedRange && range.includes(data.secondSelectedRange)) {
          setSecondSelectedRange(data.secondSelectedRange);
        }
        if (data.secondSelectedAccuracyCheck) {
          const matchingCheck = accuracyChecks.find(
            check => check.att1 === data.secondSelectedAccuracyCheck.att1 && check.att2 === data.secondSelectedAccuracyCheck.att2
          );
          if (matchingCheck) {
            setSecondSelectedAccuracyCheck(matchingCheck);
          }
        }
        if (data.secondSelectedType && types.includes(data.secondSelectedType)) {
          setSecondSelectedType(data.secondSelectedType);
        }
        if (data.secondCurrentCustomizations && Array.isArray(data.secondCurrentCustomizations)) {
          const validCustomizations = data.secondCurrentCustomizations.filter(custom =>
            customizations.some(c => c.name === custom.name)
          );
          setSecondCurrentCustomizations(validCustomizations);
        }
        if (data.secondQuality) {
          setSecondSelectedQuality("");
          setSecondQuality(data.secondQuality);
        }
        if (data.secondQualityCost !== undefined) {
          setSecondQualityCost(data.secondQualityCost);
        }

        // Handle secondary weapon modifiers (map standard format to generator fields)
        if (data.secondDamageModifier !== undefined) {
          setSecondOverrideDamage(data.secondDamageModifier !== 0);
          setSecondCustomDamageMod(data.secondDamageModifier);
        }
        if (data.secondPrecModifier !== undefined) {
          setSecondOverrideAccuracy(data.secondPrecModifier !== 0);
          setSecondCustomAccuracyMod(data.secondPrecModifier);
        }
        if (data.secondDefModifier !== undefined) {
          setSecondDefModifier(data.secondDefModifier);
        }
        if (data.secondMDefModifier !== undefined) {
          setSecondMDefModifier(data.secondMDefModifier);
        }
        if (data.secondOverrideDamageType !== undefined) {
          setSecondOverrideType(data.secondOverrideDamageType);
        }
        if (data.secondCustomDamageType !== undefined) {
          setSecondCustomDamageType(data.secondCustomDamageType);
        }
        
        // Auto-expand secondary modifiers if any are set
        setSecondModifiersExpanded(
          (data.secondDamageModifier && data.secondDamageModifier !== 0) ||
          (data.secondPrecModifier && data.secondPrecModifier !== 0) ||
          (data.secondDefModifier && data.secondDefModifier !== 0) ||
          (data.secondMDefModifier && data.secondMDefModifier !== 0) ||
          data.secondOverrideDamageType
        );

      }, 100);
    }
  };

  const handleUploadJSON = () => {
    fileInputRef.current.click();
  };

  return (
    <Grid container spacing={2}>
      {/* Left side - Configuration Card */}
      <Grid item xs={12} md={6}>
        <Paper
          elevation={3}
          sx={{
            p: "14px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: secondary,
          }}
        >
          {/* Header */}
          <CustomHeaderAlt
            headerText={t("Custom Weapons")}
            icon={<AutoAwesome fontSize="large" />}
          />
          {/* Action Buttons */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleUploadJSON}
              >
                Upload JSON
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleClearFields}
              >
                Clear All Fields
              </Button>
            </Grid>
          </Grid>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const result = JSON.parse(reader.result);
                    handleFileUpload(result);
                  } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    alert('Invalid JSON file format');
                  }
                };
                reader.readAsText(file);
              }
            }}
            style={{ display: "none" }}
          />

          {/* Primary Weapon Form */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Primary Weapon
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weapon Name"
                value={weaponName}
                onChange={(e) => setWeaponName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <ChangeCategory
                value={selectedCategory}
                onChange={handleCategoryChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <ChangeRange
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <ChangeAccuracyCheck
                value={selectedAccuracyCheck}
                onChange={setSelectedAccuracyCheck}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <ChangeType
                value={overrideType ? customDamageType : selectedType}
                onChange={(e) => {
                  if (overrideType) {
                    setCustomDamageType(e.target.value);
                  } else {
                    setSelectedType(e.target.value);
                  }
                }}
                disabled={!hasElemental && !overrideType}
              />
            </Grid>

            <ChangeCustomizations
              selectedCustomization={selectedCustomization}
              setSelectedCustomization={setSelectedCustomization}
              onCustomizationAdd={handleCustomizationAdd}
              onCustomizationRemove={handleCustomizationRemove}
              currentCustomizations={currentCustomizations}
              selectedCategory={selectedCategory}
              isSecondForm={false}
            />

            {/* Quality Selection */}
            <Grid item xs={12} sm={5}>
              <SelectQuality
                quality={selectedQuality}
                setQuality={(e) => {
                  const quality = qualities.find(
                    (el) => el.name === e.target.value
                  );
                  setSelectedQuality(quality.name);
                  setQuality(quality.quality);
                  setQualityCost(quality.cost);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedQuality("");
                  setQuality("");
                  setQualityCost(0);
                }}
                disabled={!selectedQuality}
                sx={{ height: "100%", minWidth: "40px", px: 1 }}
              >
                ×
              </Button>
            </Grid>

            {/* Quality Text Area */}
            <Grid item xs={12}>
              <ChangeQuality
                quality={quality}
                setQuality={(e) => setQuality(e.target.value)}
                qualityCost={qualityCost}
                setQualityCost={(e) => setQualityCost(e.target.value)}
              />
            </Grid>

            {/* Advanced Overrides Section */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="overrides-content"
                  id="overrides-header"
                >
                  <Typography variant="h6">{t("Advanced Overrides")}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {/* Override Accuracy */}
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={overrideAccuracy}
                            onChange={(e) => setOverrideAccuracy(e.target.checked)}
                          />
                        }
                        label={t("Override Accuracy Mod")}
                      />
                      {overrideAccuracy && (
                        <TextField
                          fullWidth
                          type="number"
                          label={t("Accuracy Modifier")}
                          value={customAccuracyMod}
                          onChange={(e) => setCustomAccuracyMod(parseInt(e.target.value) || 0)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>

                    {/* Override Damage */}
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={overrideDamage}
                            onChange={(e) => setOverrideDamage(e.target.checked)}
                          />
                        }
                        label={t("Override Damage Mod")}
                      />
                      {overrideDamage && (
                        <TextField
                          fullWidth
                          type="number"
                          label={t("Damage Modifier")}
                          value={customDamageMod}
                          onChange={(e) => setCustomDamageMod(parseInt(e.target.value) || 0)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>

                    {/* Override Type */}
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={overrideType}
                            onChange={(e) => setOverrideType(e.target.checked)}
                          />
                        }
                        label={t("Override Damage Type")}
                      />
                      {overrideType && (
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <InputLabel>{t("Damage Type")}</InputLabel>
                          <Select
                            value={customDamageType}
                            onChange={(e) => setCustomDamageType(e.target.value)}
                            label={t("Damage Type")}
                          >
                            {types.map((type) => (
                              <MenuItem key={type} value={type}>
                                {t(type)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>

                    {/* DEF Modifier */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label={t("DEF Modifier")}
                        value={defModifier}
                        onChange={(e) => setDefModifier(parseInt(e.target.value) || 0)}
                        size="small"
                      />
                    </Grid>

                    {/* MDEF Modifier */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label={t("MDEF Modifier")}
                        value={mDefModifier}
                        onChange={(e) => setMDefModifier(parseInt(e.target.value) || 0)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {/* Secondary Weapon Form (shown when transforming is selected) */}
          {hasTransforming && (
            <>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Transforming Form
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Second Form Name"
                    value={secondWeaponName}
                    onChange={(e) => setSecondWeaponName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ChangeCategory
                    value={secondSelectedCategory}
                    onChange={handleSecondCategoryChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ChangeRange
                    value={secondSelectedRange}
                    onChange={(e) => setSecondSelectedRange(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ChangeAccuracyCheck
                    value={secondSelectedAccuracyCheck}
                    onChange={setSecondSelectedAccuracyCheck}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ChangeType
                    value={secondOverrideType ? secondCustomDamageType : secondSelectedType}
                    onChange={(e) => {
                      if (secondOverrideType) {
                        setSecondCustomDamageType(e.target.value);
                      } else {
                        setSecondSelectedType(e.target.value);
                      }
                    }}
                    disabled={!secondHasElemental && !secondOverrideType}
                  />
                </Grid>

                <ChangeCustomizations
                  selectedCustomization={secondSelectedCustomization}
                  setSelectedCustomization={setSecondSelectedCustomization}
                  onCustomizationAdd={handleSecondCustomizationAdd}
                  onCustomizationRemove={handleSecondCustomizationRemove}
                  currentCustomizations={secondCurrentCustomizations}
                  selectedCategory={secondSelectedCategory}
                  isSecondForm={true}
                />

                {/* Quality Selection */}
                <Grid item xs={12} sm={5}>
                  <SelectQuality
                    quality={secondSelectedQuality}
                    setQuality={(e) => {
                      const quality = qualities.find(
                        (el) => el.name === e.target.value
                      );
                      setSecondSelectedQuality(quality.name);
                      setSecondQuality(quality.quality);
                      setSecondQualityCost(quality.cost);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSecondSelectedQuality("");
                      setSecondQuality("");
                      setSecondQualityCost(0);
                    }}
                    disabled={!secondSelectedQuality}
                    sx={{ height: "100%", minWidth: "40px", px: 1 }}
                  >
                    ×
                  </Button>
                </Grid>

                {/* Quality Text Area */}
                <Grid item xs={12}>
                  <ChangeQuality
                    quality={secondQuality}
                    setQuality={(e) => setSecondQuality(e.target.value)}
                    qualityCost={secondQualityCost}
                    setQualityCost={(e) => setSecondQualityCost(e.target.value)}
                  />
                </Grid>

                {/* Advanced Overrides Section for Transforming Form */}
                <Grid item xs={12}>
                  <Accordion>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      aria-controls="second-overrides-content"
                      id="second-overrides-header"
                    >
                      <Typography variant="h6">{t("Advanced Overrides - Transforming Form")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {/* Override Accuracy */}
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={secondOverrideAccuracy}
                                onChange={(e) => setSecondOverrideAccuracy(e.target.checked)}
                              />
                            }
                            label={t("Override Accuracy Mod")}
                          />
                          {secondOverrideAccuracy && (
                            <TextField
                              fullWidth
                              type="number"
                              label={t("Accuracy Modifier")}
                              value={secondCustomAccuracyMod}
                              onChange={(e) => setSecondCustomAccuracyMod(parseInt(e.target.value) || 0)}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Grid>

                        {/* Override Damage */}
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={secondOverrideDamage}
                                onChange={(e) => setSecondOverrideDamage(e.target.checked)}
                              />
                            }
                            label={t("Override Damage Mod")}
                          />
                          {secondOverrideDamage && (
                            <TextField
                              fullWidth
                              type="number"
                              label={t("Damage Modifier")}
                              value={secondCustomDamageMod}
                              onChange={(e) => setSecondCustomDamageMod(parseInt(e.target.value) || 0)}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Grid>

                        {/* Override Type */}
                        <Grid item xs={12} sm={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={secondOverrideType}
                                onChange={(e) => setSecondOverrideType(e.target.checked)}
                              />
                            }
                            label={t("Override Damage Type")}
                          />
                          {secondOverrideType && (
                            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                              <InputLabel>{t("Damage Type")}</InputLabel>
                              <Select
                                value={secondCustomDamageType}
                                onChange={(e) => setSecondCustomDamageType(e.target.value)}
                                label={t("Damage Type")}
                              >
                                {types.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {t(type)}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Grid>

                        {/* Secondary DEF Modifier */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label={t("DEF Modifier")}
                            value={secondDefModifier}
                            onChange={(e) => setSecondDefModifier(parseInt(e.target.value) || 0)}
                            size="small"
                          />
                        </Grid>

                        {/* Secondary MDEF Modifier */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            label={t("MDEF Modifier")}
                            value={secondMDefModifier}
                            onChange={(e) => setSecondMDefModifier(parseInt(e.target.value) || 0)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </Grid>
            </>
          )}

        </Paper>
      </Grid>

      {/* Right side - Weapon Preview */}
      <Grid item xs={12} md={6}>
        <Box>
          <Box ref={weaponCardsRef}>
            <Typography variant="h6" gutterBottom>
              Primary Weapon Preview
            </Typography>
            <PrettyCustomWeapon
              weaponData={{
                name: weaponName,
                category: selectedCategory,
                range: selectedRange,
                accuracyCheck: selectedAccuracyCheck,
                type: selectedType,
                customizations: currentCustomizations,
                quality: quality,
                qualityCost: qualityCost,
                // Map to standard format
                damageModifier: customDamageMod,
                precModifier: customAccuracyMod,
                defModifier: defModifier,
                mDefModifier: mDefModifier,
                overrideDamageType: overrideType,
                customDamageType: customDamageType
              }}
              showActions={!hasTransforming}
            />

            {hasTransforming && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Transforming Form Preview
                </Typography>
                <PrettyCustomWeapon
                  weaponData={{
                    name: secondWeaponName,
                    category: secondSelectedCategory,
                    range: secondSelectedRange,
                    accuracyCheck: secondSelectedAccuracyCheck,
                    type: secondSelectedType,
                    customizations: secondCurrentCustomizations,
                    quality: secondQuality,
                    qualityCost: secondQualityCost,
                    // Map to standard format for transforming form
                    damageModifier: secondCustomDamageMod,
                    precModifier: secondCustomAccuracyMod,
                    defModifier: secondDefModifier,
                    mDefModifier: secondMDefModifier,
                    overrideDamageType: secondOverrideType,
                    customDamageType: secondCustomDamageType
                  }}
                  showActions={false}
                />
              </>
            )}
          </Box>

          {hasTransforming && (
            /* Combined Download Actions for Transforming Weapons */
            <Box sx={{ display: "flex", mt: 2 }}>
              <Tooltip title={t("Download Combined as Image")}>
                <IconButton onClick={downloadCombinedImage}>
                  <Download />
                </IconButton>
              </Tooltip>
              <Export
                name={`${weaponName || "Custom Weapon"}_combined`}
                dataType="weapon"
                data={{
                  primary: {
                    name: weaponName,
                    category: selectedCategory,
                    range: selectedRange,
                    accuracyCheck: selectedAccuracyCheck,
                    type: selectedType,
                    customizations: currentCustomizations,
                    quality: quality,
                    qualityCost: qualityCost
                  },
                  transforming: {
                    name: secondWeaponName,
                    category: secondSelectedCategory,
                    range: secondSelectedRange,
                    accuracyCheck: secondSelectedAccuracyCheck,
                    type: secondSelectedType,
                    customizations: secondCurrentCustomizations,
                    quality: secondQuality,
                    qualityCost: secondQualityCost
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Grid>
      {downloadSnackbar}
    </Grid>
  );
}

export default CustomWeapons;