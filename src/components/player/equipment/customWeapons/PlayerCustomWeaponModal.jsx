import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { Close, ExpandMore } from "@mui/icons-material";
import { globalConfirm } from "../../../../utility/globalConfirm";
import PrettyCustomWeapon from "../../../../routes/equip/customWeapons/PrettyCustomWeapon";
import ChangeCategory from "../../../../routes/equip/customWeapons/ChangeCategory";
import ChangeRange from "../../../../routes/equip/customWeapons/ChangeRange";
import ChangeAccuracyCheck from "../../../../routes/equip/customWeapons/ChangeAccuracyCheck";
import ChangeType from "../../../../routes/equip/customWeapons/ChangeType";
import ChangeCustomizations from "../../../../routes/equip/customWeapons/ChangeCustomizations";
import SelectQuality from "../../../../routes/equip/weapons/SelectQuality";
import ChangeQuality from "../../../../routes/equip/common/ChangeQuality";
import ChangeModifiers from "../ChangeModifiers";
import qualities from "../../../../routes/equip/weapons/qualities";
import { categories, range, accuracyChecks, customizations, types } from "../../../../routes/equip/customWeapons/libs";

export default function PlayerCustomWeaponModal({
  open,
  onClose,
  editCustomWeaponIndex,
  customWeapon,
  onAddCustomWeapon,
  onDeleteCustomWeapon,
}) {
  const { t } = useTranslate();
  const fileInputRef = useRef();

  // Initialize state from customWeapon prop or defaults
  const [weaponName, setWeaponName] = useState(customWeapon?.name || "");
  const [selectedCategory, setSelectedCategory] = useState(customWeapon?.category || categories[0]);
  const [selectedRange, setSelectedRange] = useState(customWeapon?.range || range[0]);
  const [selectedAccuracyCheck, setSelectedAccuracyCheck] = useState(customWeapon?.accuracyCheck || accuracyChecks[0]);
  const [selectedType, setSelectedType] = useState(customWeapon?.type || types[0]);
  const [currentCustomizations, setCurrentCustomizations] = useState(customWeapon?.customizations || []);
  const [selectedCustomization, setSelectedCustomization] = useState("");
  const [selectedQuality, setSelectedQuality] = useState(customWeapon?.selectedQuality || "");
  const [quality, setQuality] = useState(customWeapon?.quality || "");
  const [qualityCost, setQualityCost] = useState(customWeapon?.qualityCost || 0);
  const [isEquipped, setIsEquipped] = useState(customWeapon?.isEquipped || false);
  
  // Modifier states
  const [damageModifier, setDamageModifier] = useState(customWeapon?.damageModifier || 0);
  const [precModifier, setPrecModifier] = useState(customWeapon?.precModifier || 0);
  const [defModifier, setDefModifier] = useState(customWeapon?.defModifier || 0);
  const [mDefModifier, setMDefModifier] = useState(customWeapon?.mDefModifier || 0);
  const [modifiersExpanded, setModifiersExpanded] = useState(false);
  
  // Override states
  const [overrideDamageType, setOverrideDamageType] = useState(customWeapon?.overrideDamageType || false);
  const [customDamageType, setCustomDamageType] = useState(customWeapon?.customDamageType || "physical");

  // Secondary weapon state (for transforming weapons)
  const [secondWeaponName, setSecondWeaponName] = useState(customWeapon?.secondWeaponName || "");
  const [secondSelectedCategory, setSecondSelectedCategory] = useState(customWeapon?.secondSelectedCategory || categories[0]);
  const [secondSelectedRange, setSecondSelectedRange] = useState(customWeapon?.secondSelectedRange || range[0]);
  const [secondSelectedAccuracyCheck, setSecondSelectedAccuracyCheck] = useState(customWeapon?.secondSelectedAccuracyCheck || accuracyChecks[0]);
  const [secondSelectedType, setSecondSelectedType] = useState(customWeapon?.secondSelectedType || types[0]);
  const [secondCurrentCustomizations, setSecondCurrentCustomizations] = useState(customWeapon?.secondCurrentCustomizations || []);
  const [secondSelectedCustomization, setSecondSelectedCustomization] = useState("");
  const [secondSelectedQuality, setSecondSelectedQuality] = useState(customWeapon?.secondSelectedQuality || "");
  const [secondQuality, setSecondQuality] = useState(customWeapon?.secondQuality || "");
  const [secondQualityCost, setSecondQualityCost] = useState(customWeapon?.secondQualityCost || 0);

  // Secondary weapon modifier states
  const [secondDamageModifier, setSecondDamageModifier] = useState(customWeapon?.secondDamageModifier || 0);
  const [secondPrecModifier, setSecondPrecModifier] = useState(customWeapon?.secondPrecModifier || 0);
  const [secondDefModifier, setSecondDefModifier] = useState(customWeapon?.secondDefModifier || 0);
  const [secondMDefModifier, setSecondMDefModifier] = useState(customWeapon?.secondMDefModifier || 0);
  const [secondModifiersExpanded, setSecondModifiersExpanded] = useState(false);
  
  // Secondary weapon override states
  const [secondOverrideDamageType, setSecondOverrideDamageType] = useState(customWeapon?.secondOverrideDamageType || false);
  const [secondCustomDamageType, setSecondCustomDamageType] = useState(customWeapon?.secondCustomDamageType || "physical");

  // Check if weapon has transforming customization
  const hasTransforming = currentCustomizations.some(
    (c) => c.name === "weapon_customization_transforming"
  );

  // Update state when customWeapon prop changes
  useEffect(() => {
    if (customWeapon) {
      setWeaponName(customWeapon.name || "");
      setSelectedCategory(customWeapon.category || categories[0]);
      setSelectedRange(customWeapon.range || range[0]);
      setSelectedAccuracyCheck(customWeapon.accuracyCheck || accuracyChecks[0]);
      setSelectedType(customWeapon.type || types[0]);
      setCurrentCustomizations(customWeapon.customizations || []);
      setSelectedCustomization("");
      setSelectedQuality(customWeapon.selectedQuality || "");
      setQuality(customWeapon.quality || "");
      setQualityCost(customWeapon.qualityCost || 0);
      setIsEquipped(customWeapon.isEquipped || false);
      setDamageModifier(customWeapon.damageModifier || 0);
      setPrecModifier(customWeapon.precModifier || 0);
      setDefModifier(customWeapon.defModifier || 0);
      setMDefModifier(customWeapon.mDefModifier || 0);
      setOverrideDamageType(customWeapon.overrideDamageType || false);
      setCustomDamageType(customWeapon.customDamageType || "physical");
      
      // Update secondary weapon states
      setSecondWeaponName(customWeapon.secondWeaponName || "");
      setSecondSelectedCategory(customWeapon.secondSelectedCategory || categories[0]);
      setSecondSelectedRange(customWeapon.secondSelectedRange || range[0]);
      setSecondSelectedAccuracyCheck(customWeapon.secondSelectedAccuracyCheck || accuracyChecks[0]);
      setSecondSelectedType(customWeapon.secondSelectedType || types[0]);
      setSecondCurrentCustomizations(customWeapon.secondCurrentCustomizations || []);
      setSecondSelectedCustomization("");
      setSecondSelectedQuality(customWeapon.secondSelectedQuality || "");
      setSecondQuality(customWeapon.secondQuality || "");
      setSecondQualityCost(customWeapon.secondQualityCost || 0);
      
      // Set secondary weapon modifiers
      setSecondDamageModifier(customWeapon.secondDamageModifier || 0);
      setSecondPrecModifier(customWeapon.secondPrecModifier || 0);
      setSecondDefModifier(customWeapon.secondDefModifier || 0);
      setSecondMDefModifier(customWeapon.secondMDefModifier || 0);
      setSecondOverrideDamageType(customWeapon.secondOverrideDamageType || false);
      setSecondCustomDamageType(customWeapon.secondCustomDamageType || "physical");
      
      setModifiersExpanded(
        (customWeapon?.damageModifier && customWeapon?.damageModifier !== 0) ||
        (customWeapon?.precModifier && customWeapon?.precModifier !== 0) ||
        (customWeapon?.defModifier && customWeapon?.defModifier !== 0) ||
        (customWeapon?.mDefModifier && customWeapon?.mDefModifier !== 0) ||
        customWeapon?.overrideDamageType
      );
      
      setSecondModifiersExpanded(
        (customWeapon?.secondDamageModifier && customWeapon?.secondDamageModifier !== 0) ||
        (customWeapon?.secondPrecModifier && customWeapon?.secondPrecModifier !== 0) ||
        (customWeapon?.secondDefModifier && customWeapon?.secondDefModifier !== 0) ||
        (customWeapon?.secondMDefModifier && customWeapon?.secondMDefModifier !== 0) ||
        customWeapon?.secondOverrideDamageType
      );
    } else {
      // Reset to defaults when creating new weapon
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
      setIsEquipped(false);
      setDamageModifier(0);
      setPrecModifier(0);
      setDefModifier(0);
      setMDefModifier(0);
      setOverrideDamageType(false);
      setCustomDamageType("physical");
      
      // Reset secondary weapon states
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
      
      // Reset secondary modifiers
      setSecondDamageModifier(0);
      setSecondPrecModifier(0);
      setSecondDefModifier(0);
      setSecondMDefModifier(0);
      setSecondOverrideDamageType(false);
      setSecondCustomDamageType("physical");
      
      setModifiersExpanded(false);
      setSecondModifiersExpanded(false);
    }
  }, [customWeapon]);

  // Initialize second form with transforming customization when needed
  useEffect(() => {
    if (hasTransforming && secondCurrentCustomizations.length === 0) {
      const transformingCustom = customizations.find(
        (c) => c.name === "weapon_customization_transforming"
      );
      if (transformingCustom) {
        setSecondCurrentCustomizations([transformingCustom]);
      }
    }
  }, [hasTransforming, secondCurrentCustomizations.length]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    
    // Reset type when category changes since some types are only valid for certain categories
    setSelectedType(types[0]);
  };

  const handleCustomizationAdd = (customization) => {
    if (!currentCustomizations.find(c => c.name === customization.name)) {
      setCurrentCustomizations([...currentCustomizations, customization]);
    }
  };

  const handleCustomizationRemove = (customizationName) => {
    setCurrentCustomizations(currentCustomizations.filter(c => c.name !== customizationName));
  };

  // Secondary weapon handlers
  const handleSecondCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSecondSelectedCategory(newCategory);
    setSecondSelectedType(types[0]);
  };

  const handleSecondCustomizationAdd = (customization) => {
    if (!secondCurrentCustomizations.find(c => c.name === customization.name)) {
      setSecondCurrentCustomizations([...secondCurrentCustomizations, customization]);
    }
  };

  const handleSecondCustomizationRemove = (customizationName) => {
    setSecondCurrentCustomizations(secondCurrentCustomizations.filter(c => c.name !== customizationName));
  };

  // Check if elemental customization is present
  const hasElementalCustomization = () => {
    return currentCustomizations.some(c => c.name === "weapon_customization_elemental");
  };

  // Check if damage type field should be enabled
  const isDamageTypeEnabled = () => {
    return hasElementalCustomization() || overrideDamageType;
  };

  const calculateTotalCost = () => {
    const baseCost = 300; // Custom weapons have base cost of 300
    const customizationCost = currentCustomizations.reduce((total, c) => total + (c.customCost || 0), 0) * 100;
    const qualityCostValue = parseInt(qualityCost) || 0;
    
    // For transforming weapons, add secondary quality cost as well
    const secondQualityCostValue = hasTransforming ? (parseInt(secondQualityCost) || 0) : 0;
    
    return baseCost + customizationCost + qualityCostValue + secondQualityCostValue;
  };

  const isMartial = () => {
    const martialCustomizations = ['weapon_customization_quick', 'weapon_customization_magicdefenseboost', 'weapon_customization_powerful'];
    return currentCustomizations.some(c => martialCustomizations.includes(c.name));
  };

  const handleSave = () => {
    const weaponData = {
      name: weaponName,
      category: selectedCategory,
      range: selectedRange,
      accuracyCheck: selectedAccuracyCheck,
      type: selectedType,
      customizations: currentCustomizations,
      selectedQuality,
      quality,
      qualityCost: parseInt(qualityCost) || 0,
      cost: calculateTotalCost(),
      hands: 2, // Custom weapons are always two-handed
      martial: isMartial(),
      isEquipped: editCustomWeaponIndex !== null ? isEquipped : false,
      damageModifier: parseInt(damageModifier) || 0,
      precModifier: parseInt(precModifier) || 0,
      defModifier: parseInt(defModifier) || 0,
      mDefModifier: parseInt(mDefModifier) || 0,
      overrideDamageType,
      customDamageType,
      // Secondary weapon data (for transforming weapons)
      secondWeaponName,
      secondSelectedCategory,
      secondSelectedRange,
      secondSelectedAccuracyCheck,
      secondSelectedType,
      secondCurrentCustomizations,
      secondSelectedQuality,
      secondQuality,
      secondQualityCost: parseInt(secondQualityCost) || 0,
      // Secondary weapon modifiers
      secondDamageModifier: parseInt(secondDamageModifier) || 0,
      secondPrecModifier: parseInt(secondPrecModifier) || 0,
      secondDefModifier: parseInt(secondDefModifier) || 0,
      secondMDefModifier: parseInt(secondMDefModifier) || 0,
      secondOverrideDamageType,
      secondCustomDamageType,
      dataType: "weapon"
    };

    onAddCustomWeapon(weaponData);
    onClose();
  };

  const handleDelete = async () => {
    if (editCustomWeaponIndex !== null) {
      const confirmDelete = await globalConfirm(
        "Are you sure you want to delete?"
      );
      if (confirmDelete) {
        onDeleteCustomWeapon(editCustomWeaponIndex);
        onClose();
      }
    }
  };

  const handleFileUpload = (data) => {
    if (data && data.dataType === "weapon") {
      setWeaponName(data.name || "");
      setSelectedCategory(data.category && categories.includes(data.category) ? data.category : categories[0]);
      setSelectedRange(data.range && range.includes(data.range) ? data.range : range[0]);
      
      // Handle accuracy check
      if (data.accuracyCheck) {
        const matchingCheck = accuracyChecks.find(
          check => check.att1 === data.accuracyCheck.att1 && check.att2 === data.accuracyCheck.att2
        );
        setSelectedAccuracyCheck(matchingCheck || accuracyChecks[0]);
      }
      
      setSelectedType(data.type && types.includes(data.type) ? data.type : types[0]);
      
      // Handle customizations
      if (data.customizations && Array.isArray(data.customizations)) {
        const validCustomizations = data.customizations.filter(custom =>
          customizations.some(c => c.name === custom.name)
        );
        setCurrentCustomizations(validCustomizations);
      }
      
      setQuality(data.quality || "");
      setQualityCost(data.qualityCost || 0);
      setSelectedQuality("");
      
      // Handle modifiers
      setDamageModifier(data.damageModifier || 0);
      setPrecModifier(data.precModifier || 0);
      setDefModifier(data.defModifier || 0);
      setMDefModifier(data.mDefModifier || 0);
      
      // Handle override_damage_type
      setOverrideDamageType(data.overrideDamageType || false);
      setCustomDamageType(data.customDamageType || "physical");
      
      // Handle secondary weapon data
      setSecondWeaponName(data.secondWeaponName || "");
      setSecondSelectedCategory(data.secondSelectedCategory && categories.includes(data.secondSelectedCategory) ? data.secondSelectedCategory : categories[0]);
      setSecondSelectedRange(data.secondSelectedRange && range.includes(data.secondSelectedRange) ? data.secondSelectedRange : range[0]);
      
      if (data.secondSelectedAccuracyCheck) {
        const matchingCheck = accuracyChecks.find(
          check => check.att1 === data.secondSelectedAccuracyCheck.att1 && check.att2 === data.secondSelectedAccuracyCheck.att2
        );
        setSecondSelectedAccuracyCheck(matchingCheck || accuracyChecks[0]);
      }
      
      setSecondSelectedType(data.secondSelectedType && types.includes(data.secondSelectedType) ? data.secondSelectedType : types[0]);
      
      if (data.secondCurrentCustomizations && Array.isArray(data.secondCurrentCustomizations)) {
        const validCustomizations = data.secondCurrentCustomizations.filter(custom =>
          customizations.some(c => c.name === custom.name)
        );
        setSecondCurrentCustomizations(validCustomizations);
      }
      
      setSecondQuality(data.secondQuality || "");
      setSecondQualityCost(data.secondQualityCost || 0);
      setSecondSelectedQuality("");
      
      // Handle secondary weapon modifiers
      setSecondDamageModifier(data.secondDamageModifier || 0);
      setSecondPrecModifier(data.secondPrecModifier || 0);
      setSecondDefModifier(data.secondDefModifier || 0);
      setSecondMDefModifier(data.secondMDefModifier || 0);
      setSecondOverrideDamageType(data.secondOverrideDamageType || false);
      setSecondCustomDamageType(data.secondCustomDamageType || "physical");
      
      // Expand modifiers section if any modifiers are set
      setModifiersExpanded(
        (data.damageModifier && data.damageModifier !== 0) ||
        (data.precModifier && data.precModifier !== 0) ||
        (data.defModifier && data.defModifier !== 0) ||
        (data.mDefModifier && data.mDefModifier !== 0) ||
        data.overrideDamageType
      );
      
      setSecondModifiersExpanded(
        (data.secondDamageModifier && data.secondDamageModifier !== 0) ||
        (data.secondPrecModifier && data.secondPrecModifier !== 0) ||
        (data.secondDefModifier && data.secondDefModifier !== 0) ||
        (data.secondMDefModifier && data.secondMDefModifier !== 0) ||
        data.secondOverrideDamageType
      );
    }
  };

  const handleUploadJSON = () => {
    fileInputRef.current.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle variant="h4" sx={{ fontWeight: "bold" }}>
        {editCustomWeaponIndex !== null ? t("Edit") : t("Add Custom Weapon")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Left side - Configuration */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {/* Weapon Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t("weapon_name")}
                  value={weaponName}
                  onChange={(e) => setWeaponName(e.target.value)}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <ChangeCategory
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                />
              </Grid>

              {/* Range */}
              <Grid item xs={12} sm={6}>
                <ChangeRange
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                />
              </Grid>

              {/* Accuracy Check */}
              <Grid item xs={12} sm={6}>
                <ChangeAccuracyCheck
                  value={selectedAccuracyCheck}
                  onChange={setSelectedAccuracyCheck}
                />
              </Grid>

              {/* Type */}
              <Grid item xs={12} sm={6}>
                <ChangeType
                  value={isDamageTypeEnabled() ? (overrideDamageType ? customDamageType : selectedType) : "physical"}
                  onChange={(e) => {
                    if (overrideDamageType) {
                      setCustomDamageType(e.target.value);
                    } else {
                      setSelectedType(e.target.value);
                    }
                  }}
                  selectedCategory={selectedCategory}
                  disabled={!isDamageTypeEnabled()}
                />
              </Grid>

              {/* Customizations */}
              <Grid item xs={12}>
                <ChangeCustomizations
                  selectedCustomization={selectedCustomization}
                  setSelectedCustomization={setSelectedCustomization}
                  onCustomizationAdd={handleCustomizationAdd}
                  onCustomizationRemove={handleCustomizationRemove}
                  currentCustomizations={currentCustomizations}
                  selectedCategory={selectedCategory}
                  isSecondForm={false}
                />
              </Grid>

              {/* Quality Section */}
              <Grid item xs={12} sm={8}>
                <SelectQuality
                  quality={selectedQuality}
                  setQuality={(e) => {
                    const qualityData = qualities.find(q => q.name === e.target.value);
                    if (qualityData) {
                      setSelectedQuality(qualityData.name);
                      setQuality(qualityData.quality);
                      setQualityCost(qualityData.cost);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedQuality("");
                    setQuality("");
                    setQualityCost(0);
                  }}
                  disabled={!selectedQuality}
                  sx={{ height: "100%", minWidth: "40px" }}
                >
                  ×
                </Button>
              </Grid>

              <Grid item xs={12}>
                <ChangeQuality
                  quality={quality}
                  setQuality={(e) => setQuality(e.target.value)}
                  qualityCost={qualityCost}
                  setQualityCost={(e) => setQualityCost(e.target.value)}
                />
              </Grid>

              {/* Modifiers Section */}
              <Grid item xs={12}>
                <Accordion
                  sx={{ width: "100%" }}
                  expanded={modifiersExpanded}
                  onChange={() => setModifiersExpanded(!modifiersExpanded)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="modifiers-content"
                    id="modifiers-header"
                  >
                    <Typography>{t("Modifiers")}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <ChangeModifiers
                          label={"Damage Modifier"}
                          value={damageModifier}
                          onChange={(e) => setDamageModifier(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <ChangeModifiers
                          label={"Precision Modifier"}
                          value={precModifier}
                          onChange={(e) => setPrecModifier(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <ChangeModifiers
                          label={"DEF Modifier"}
                          value={defModifier}
                          onChange={(e) => setDefModifier(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <ChangeModifiers
                          label={"MDEF Modifier"}
                          value={mDefModifier}
                          onChange={(e) => setMDefModifier(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={overrideDamageType}
                              onChange={(e) => setOverrideDamageType(e.target.checked)}
                            />
                          }
                          label={t("override_damage_type")}
                        />
                      </Grid>
                      {overrideDamageType && (
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>{t("weapon_damage_type")}</InputLabel>
                            <Select
                              value={customDamageType}
                              onChange={(e) => setCustomDamageType(e.target.value)}
                              label={t("weapon_damage_type")}
                            >
                              {types.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {t(type)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Upload JSON */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Button
                  variant="outlined"
                  onClick={handleUploadJSON}
                  sx={{ mr: 2 }}
                >
                  {t("Upload JSON")}
                </Button>
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
              </Grid>
            </Grid>
            
            {/* Secondary Weapon Form (shown when transforming is selected) */}
            {hasTransforming && (
              <>
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {t("weapon_customization_transforming_form")}
                    </Typography>
                  </Grid>
                  
                  {/* Secondary Weapon Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t("weapon_customization_transforming_form_name")}
                      value={secondWeaponName}
                      onChange={(e) => setSecondWeaponName(e.target.value)}
                    />
                  </Grid>

                  {/* Secondary Category */}
                  <Grid item xs={12} sm={6}>
                    <ChangeCategory
                      value={secondSelectedCategory}
                      onChange={handleSecondCategoryChange}
                    />
                  </Grid>

                  {/* Secondary Range */}
                  <Grid item xs={12} sm={6}>
                    <ChangeRange
                      value={secondSelectedRange}
                      onChange={(e) => setSecondSelectedRange(e.target.value)}
                    />
                  </Grid>

                  {/* Secondary Accuracy Check */}
                  <Grid item xs={12} sm={6}>
                    <ChangeAccuracyCheck
                      value={secondSelectedAccuracyCheck}
                      onChange={setSecondSelectedAccuracyCheck}
                    />
                  </Grid>

                  {/* Secondary Type */}
                  <Grid item xs={12} sm={6}>
                    <ChangeType
                      value={secondSelectedType}
                      onChange={(e) => setSecondSelectedType(e.target.value)}
                      selectedCategory={secondSelectedCategory}
                      disabled={!secondCurrentCustomizations.some(c => c.name === "weapon_customization_elemental")}
                    />
                  </Grid>

                  {/* Secondary Customizations */}
                  <Grid item xs={12}>
                    <ChangeCustomizations
                      selectedCustomization={secondSelectedCustomization}
                      setSelectedCustomization={setSecondSelectedCustomization}
                      onCustomizationAdd={handleSecondCustomizationAdd}
                      onCustomizationRemove={handleSecondCustomizationRemove}
                      currentCustomizations={secondCurrentCustomizations}
                      selectedCategory={secondSelectedCategory}
                      isSecondForm={true}
                    />
                  </Grid>

                  {/* Secondary Quality Section */}
                  <Grid item xs={12} sm={8}>
                    <SelectQuality
                      quality={secondSelectedQuality}
                      setQuality={(e) => {
                        const qualityData = qualities.find(q => q.name === e.target.value);
                        if (qualityData) {
                          setSecondSelectedQuality(qualityData.name);
                          setSecondQuality(qualityData.quality);
                          setSecondQualityCost(qualityData.cost);
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSecondSelectedQuality("");
                        setSecondQuality("");
                        setSecondQualityCost(0);
                      }}
                      disabled={!secondSelectedQuality}
                      sx={{ height: "100%", minWidth: "40px" }}
                    >
                      ×
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <ChangeQuality
                      quality={secondQuality}
                      setQuality={(e) => setSecondQuality(e.target.value)}
                      qualityCost={secondQualityCost}
                      setQualityCost={(e) => setSecondQualityCost(e.target.value)}
                    />
                  </Grid>
                  
                  {/* Secondary Modifiers Section */}
                  <Grid item xs={12}>
                    <Accordion
                      sx={{ width: "100%" }}
                      expanded={secondModifiersExpanded}
                      onChange={() => setSecondModifiersExpanded(!secondModifiersExpanded)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls="second-modifiers-content"
                        id="second-modifiers-header"
                      >
                        <Typography>{t("weapon_customization_transforming_form_modifiers")}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <ChangeModifiers
                              label={"Damage Modifier"}
                              value={secondDamageModifier}
                              onChange={(e) => setSecondDamageModifier(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <ChangeModifiers
                              label={"Precision Modifier"}
                              value={secondPrecModifier}
                              onChange={(e) => setSecondPrecModifier(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <ChangeModifiers
                              label={"DEF Modifier"}
                              value={secondDefModifier}
                              onChange={(e) => setSecondDefModifier(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <ChangeModifiers
                              label={"MDEF Modifier"}
                              value={secondMDefModifier}
                              onChange={(e) => setSecondMDefModifier(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={secondOverrideDamageType}
                                  onChange={(e) => setSecondOverrideDamageType(e.target.checked)}
                                />
                              }
                              label={t("override_damage_type")}
                            />
                            {secondOverrideDamageType && (
                              <ChangeType
                                value={secondCustomDamageType}
                                onChange={(e) => setSecondCustomDamageType(e.target.value)}
                                disabled={false}
                              />
                            )}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>

          {/* Right side - Preview */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t("weapon_customization_transforming_form_preview")}
            </Typography>
            <PrettyCustomWeapon
              weaponData={{
                name: weaponName,
                category: selectedCategory,
                range: selectedRange,
                accuracyCheck: selectedAccuracyCheck,
                type: selectedType,
                customizations: currentCustomizations,
                quality,
                cost: calculateTotalCost(),
                hands: 2,
                martial: isMartial(),
                damageModifier: parseInt(damageModifier) || 0,
                precModifier: parseInt(precModifier) || 0,
                defModifier: parseInt(defModifier) || 0,
                mDefModifier: parseInt(mDefModifier) || 0,
                overrideDamageType,
                customDamageType,
              }}
              showActions={!hasTransforming}
            />
            
            {hasTransforming && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  {t("weapon_customization_transforming_form_preview")}
                </Typography>
                <PrettyCustomWeapon
                  weaponData={{
                    name: secondWeaponName || `${weaponName} (Transforming)`,
                    category: secondSelectedCategory,
                    range: secondSelectedRange,
                    accuracyCheck: secondSelectedAccuracyCheck,
                    type: secondSelectedType,
                    customizations: secondCurrentCustomizations,
                    quality: secondQuality,
                    cost: calculateTotalCost(),
                    hands: 2,
                    martial: isMartial(),
                    damageModifier: parseInt(secondDamageModifier) || 0,
                    precModifier: parseInt(secondPrecModifier) || 0,
                    defModifier: parseInt(secondDefModifier) || 0,
                    mDefModifier: parseInt(secondMDefModifier) || 0,
                    overrideDamageType: secondOverrideDamageType,
                    customDamageType: secondCustomDamageType,
                  }}
                  showActions={false}
                />
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        {editCustomWeaponIndex !== null && (
          <Button onClick={handleDelete} color="error" variant="contained">
            {t("Delete")}
          </Button>
        )}
        <Button onClick={onClose} color="secondary">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}