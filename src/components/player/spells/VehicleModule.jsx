import { memo } from "react";
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ExpandMore, Delete, ContentCopy } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import CustomTextarea from "../../common/CustomTextarea";
import attributes from "../../../libs/attributes";
import weaponCategories from "../../../libs/weaponCategories";
import { moduleTypes } from "../../../libs/pilotVehicleData";
import ModuleDropdown from "./ModuleDropdown";

const VehicleModule = memo(({ 
  module, 
  moduleIndex, 
  vehicleIndex, 
  canEquip,
  onModuleChange, 
  onDeleteModule,
  onCloneModule,
  vehicle
}) => {
  const { t } = useTranslate();

  const handleEquipToggle = (e) => {
    e.stopPropagation();
    onModuleChange(vehicleIndex, moduleIndex, "equipped", !module.equipped);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteModule(vehicleIndex, moduleIndex);
  };

  const handleClone = (e) => {
    e.stopPropagation();
    if (onCloneModule) {
      onCloneModule(vehicleIndex, moduleIndex);
    }
  };

  const handleModuleDropdownChange = (e) => {
    onModuleChange(vehicleIndex, moduleIndex, "name", e.target.value);
  };

  const isCustomModule = module.name === "pilot_custom_armor" || 
                        module.name === "pilot_custom_weapon" || 
                        module.name === "pilot_custom_support";

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
          <Grid item xs={12} sm={2}>
            <Button
              variant={module.equipped ? "contained" : "outlined"}
              color={module.equipped ? "success" : "primary"}
              disabled={!module.equipped && !canEquip}
              onClick={handleEquipToggle}
              sx={{ minWidth: 80 }}
            >
              {module.equipped ? t("Equipped") : t("Equip")}
            </Button>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Typography variant="h6">
              {isCustomModule
                ? module.customName || t("pilot_custom")
                : t(module.name)}
              {module.cumbersome && " ⚠"}
              {module.isShield && " 🛡"}
              {module.isComplex && " ⚙⚙"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {t(module.type)} 
              {module.equipped && module.type === "pilot_module_weapon" && (
                <> | {module.cumbersome ? t("both_hand") : (module.equippedSlot === "main" ? t("main_hand") : t("off_hand"))}</>
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {module.equipped && module.type === "pilot_module_weapon" && (
              module.isShield ? (
                <ToggleButtonGroup
                  value={module.equippedSlot || "off"}
                  exclusive
                  onChange={(e, newValue) => {
                    e.stopPropagation();
                    if (newValue !== null) {
                      onModuleChange(vehicleIndex, moduleIndex, "equippedSlot", newValue);
                    }
                  }}
                  size="small"
                >
                  <ToggleButton 
                    value="main" 
                    disabled={!vehicle.modules.some(m => m.equipped && m.isShield && (m.equippedSlot === "off" || !m.equippedSlot) && m !== module)}
                    sx={{ minWidth: 35 }}
                  >
                    {t("m_abbr")}
                  </ToggleButton>
                  <ToggleButton value="off" sx={{ minWidth: 35 }}>{t("o_abbr")}</ToggleButton>
                </ToggleButtonGroup>
              ) : module.cumbersome ? (
                <Button variant="contained" size="small" disabled sx={{ minWidth: 35 }}>
                  {t("mo_abbr")}
                </Button>
              ) : (
                <ToggleButtonGroup
                  value={module.equippedSlot || "main"}
                  exclusive
                  onChange={(e, newValue) => {
                    e.stopPropagation();
                    if (newValue !== null) {
                      onModuleChange(vehicleIndex, moduleIndex, "equippedSlot", newValue);
                    }
                  }}
                  size="small"
                >
                  <ToggleButton value="main" sx={{ minWidth: 35 }}>{t("m_abbr")}</ToggleButton>
                  <ToggleButton 
                    value="off" 
                    disabled={vehicle.modules.some(m => m.equipped && m.isShield && m.equippedSlot === "off")}
                    sx={{ minWidth: 35 }}
                  >
                    {t("o_abbr")}
                  </ToggleButton>
                </ToggleButtonGroup>
              )
            )}
          </Grid>

          <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={handleDelete}
                variant="outlined"
                color="error"
                size="small"
                sx={{ minWidth: "auto", padding: 1 }}
              >
                <Delete />
              </Button>
              {onCloneModule && (
                <Button
                  onClick={handleClone}
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: "auto", padding: 1 }}
                  title={t("Clone to Custom")}
                >
                  <ContentCopy />
                </Button>
              )}
            </div>
          </Grid>
        </Grid>
      </AccordionSummary>
      
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <ModuleDropdown
              value={module.name}
              onChange={handleModuleDropdownChange}
            />
          </Grid>

          {isCustomModule && (
            <>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("pilot_custom")}
                  value={module.customName || ""}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "customName", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("Type")}</InputLabel>
                  <Select
                    value={module.type || ""}
                    onChange={(e) =>
                      onModuleChange(vehicleIndex, moduleIndex, "type", e.target.value)
                    }
                  >
                    {moduleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {t(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Equipment Slot Selection for Weapons */}
          {module.equipped && module.type === "pilot_module_weapon" && (
            <Grid item xs={12} sm={2}>
              <div style={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                  {t("Hand")}
                </Typography>
                <ToggleButtonGroup
                  value={module.equippedSlot || (module.isShield ? "off" : "main")}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      onModuleChange(vehicleIndex, moduleIndex, "equippedSlot", newValue);
                    }
                  }}
                  size="small"
                >
                  <ToggleButton value="main">{t("m_abbr")}</ToggleButton>
                  <ToggleButton 
                    value="off" 
                    disabled={!module.isShield && vehicle.modules.some(m => m.equipped && m.isShield && m.equippedSlot === "off")}
                  >
                    {t("o_abbr")}
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" display="block" sx={{ mt: 0.5, color: "text.secondary" }}>
                  {module.equippedSlot === "off" ? t("off_hand") : t("main_hand")}
                </Typography>
              </div>
            </Grid>
          )}

          {/* Weapon Module Checkboxes */}
          {module.type === "pilot_module_weapon" && (
            <>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={module.isShield || false}
                      onChange={(e) =>
                        onModuleChange(vehicleIndex, moduleIndex, "isShield", e.target.checked)
                      }
                    />
                  }
                  label={
                    <div>
                      <Typography component="span">
                        {t("pilot_shield")}
                      </Typography>
                      <Typography variant="body2" display="block" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                        {t("pilot_defensive_equipment")}
                      </Typography>
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={module.cumbersome || false}
                      onChange={(e) =>
                        onModuleChange(vehicleIndex, moduleIndex, "cumbersome", e.target.checked)
                      }
                    />
                  }
                  label={
                    <div>
                      <Typography component="span">
                        {t("pilot_cumbersome")}
                      </Typography>
                      <Typography variant="body2" display="block" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                        {t("pilot_prevents_other_weapons")}
                      </Typography>
                    </div>
                  }
                />
              </Grid>
            </>
          )}

          {/* Support Module Checkboxes */}
          {module.type === "pilot_module_support" && (
            <>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={module.isComplex || false}
                      onChange={(e) =>
                        onModuleChange(vehicleIndex, moduleIndex, "isComplex", e.target.checked)
                      }
                      disabled={!isCustomModule}
                    />
                  }
                  label={
                    <div>
                      <Typography component="span">
                        {t("pilot_complex")}
                      </Typography>
                      <Typography variant="body2" display="block" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                        {t("pilot_takes_two_slots")}
                      </Typography>
                    </div>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("Cost")}
                  type="number"
                  value={module.cost || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "cost", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
            </>
          )}

          {/* Module Description */}
          <Grid item xs={12}>
            {isCustomModule ? (
              <CustomTextarea
                fullWidth
                label={t("Description")}
                value={module.description || ""}
                onChange={(e) =>
                  onModuleChange(vehicleIndex, moduleIndex, "description", e.target.value)
                }
              />
            ) : (
              <div style={{ padding: '8px', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: 'block' }}>
                  {t("Description")}
                </Typography>
                <div style={{ fontSize: "0.95em" }}>
                  <ReactMarkdown
                    components={{
                      p: (props) => <p style={{ margin: 0 }} {...props} />,
                    }}
                  >
                    {t(module.description)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </Grid>

          {/* Weapon Stats */}
          {module.type === "pilot_module_weapon" && (
            <>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("Category")}</InputLabel>
                  <Select
                    value={module.category || ""}
                    onChange={(e) =>
                      onModuleChange(vehicleIndex, moduleIndex, "category", e.target.value)
                    }
                    disabled={!isCustomModule}
                  >
                    {weaponCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {t(category)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("First Attribute")}</InputLabel>
                  <Select
                    value={module.att1 || "might"}
                    onChange={(e) =>
                      onModuleChange(vehicleIndex, moduleIndex, "att1", e.target.value)
                    }
                    disabled={!isCustomModule}
                  >
                    {Object.keys(attributes).map((attr) => (
                      <MenuItem key={attr} value={attr}>
                        {t(attributes[attr].long)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("Second Attribute")}</InputLabel>
                  <Select
                    value={module.att2 || "dexterity"}
                    onChange={(e) =>
                      onModuleChange(vehicleIndex, moduleIndex, "att2", e.target.value)
                    }
                    disabled={!isCustomModule}
                  >
                    {Object.keys(attributes).map((attr) => (
                      <MenuItem key={attr} value={attr}>
                        {t(attributes[attr].long)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("Precision Modifier")}
                  type="number"
                  value={module.prec || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "prec", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("Damage Modifier")}
                  type="number"
                  value={module.damage || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "damage", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("Range")}</InputLabel>
                  <Select
                    value={module.range || "Melee"}
                    onChange={(e) =>
                      onModuleChange(vehicleIndex, moduleIndex, "range", e.target.value)
                    }
                    disabled={!isCustomModule}
                  >
                    <MenuItem value="Melee">{t("Melee")}</MenuItem>
                    <MenuItem value="Ranged">{t("Ranged")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("Type")}</InputLabel>
                  <Select
                    value={module.damageType || "Physical"}
                    onChange={(e) =>
                      onModuleChange(vehicleIndex, moduleIndex, "damageType", e.target.value)
                    }
                    disabled={!isCustomModule}
                  >
                    <MenuItem value="Physical">{t("Physical")}</MenuItem>
                    <MenuItem value="Air">{t("Air")}</MenuItem>
                    <MenuItem value="Bolt">{t("Bolt")}</MenuItem>
                    <MenuItem value="Dark">{t("Dark")}</MenuItem>
                    <MenuItem value="Earth">{t("Earth")}</MenuItem>
                    <MenuItem value="Fire">{t("Fire")}</MenuItem>
                    <MenuItem value="Ice">{t("Ice")}</MenuItem>
                    <MenuItem value="Light">{t("Light")}</MenuItem>
                    <MenuItem value="Poison">{t("Poison")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("Cost")}
                  type="number"
                  value={module.cost || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "cost", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <CustomTextarea
                  fullWidth
                  label={t("Quality")}
                  value={module.quality || ""}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "quality", e.target.value)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label={t("Cost of Quality")}
                  type="number"
                  value={module.qualityCost || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "qualityCost", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
            </>
          )}

          {/* Armor Stats */}
          {module.type === "pilot_module_armor" && (
            <>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={module.martial || false}
                      onChange={(e) =>
                        onModuleChange(vehicleIndex, moduleIndex, "martial", e.target.checked)
                      }
                      disabled={!isCustomModule}
                    />
                  }
                  label={t("Martial")}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("Defense")}
                  type="number"
                  value={module.def || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "def", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("M. Defense")}
                  type="number"
                  value={module.mdef || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "mdef", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label={t("Cost")}
                  type="number"
                  value={module.cost || 0}
                  onChange={(e) =>
                    onModuleChange(vehicleIndex, moduleIndex, "cost", parseInt(e.target.value) || 0)
                  }
                  disabled={!isCustomModule}
                />
              </Grid>
            </>
          )}

        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

VehicleModule.displayName = 'VehicleModule';

export default VehicleModule;
