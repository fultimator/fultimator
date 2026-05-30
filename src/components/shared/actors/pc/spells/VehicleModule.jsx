import { memo, forwardRef } from "react";

const AccordionSummaryDiv = forwardRef(function AccordionSummaryDiv(
  {
    focusRipple: _focusRipple,
    disableRipple: _disableRipple,
    internalNativeButton: _internalNativeButton,
    focusVisibleClassName: _focusVisibleClassName,
    ...props
  },
  ref,
) {
  return <div ref={ref} {...props} />;
});
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
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import CustomTextarea from "/src/components/common/CustomTextarea";
import attributes from "/src/libs/attributes";
import { Martial } from "/src/components/icons";
import weaponCategories from "/src/libs/weaponCategories";
import { moduleTypes } from "/src/libs/pilotVehicleData";
import ModuleDropdown from "/src/components/shared/actors/pc/spells/ModuleDropdown";
import { useDeleteConfirmation } from "/src/hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "/src/components/common/DeleteConfirmationDialog";

const VehicleModule = memo(
  ({
    module,
    moduleIndex,
    vehicleIndex,
    canEquip,
    onModuleChange,
    onDeleteModule,
    onCloneModule,
    vehicle,
  }) => {
    const { t } = useTranslate();
    const {
      isOpen: deleteDialogOpen,
      closeDialog: setDeleteDialogOpen,
      handleDelete,
    } = useDeleteConfirmation({
      onConfirm: () => onDeleteModule(vehicleIndex, moduleIndex),
    });

    // Derive equipped state from vehicle.slots
    const moduleKey = module.key ?? module.name;
    const vehicleSlots = vehicle?.slots ?? {};
    const isEquipped =
      vehicleSlots.main === moduleKey ||
      vehicleSlots.off === moduleKey ||
      vehicleSlots.armor === moduleKey ||
      (vehicleSlots.support ?? []).includes(moduleKey);
    const moduleSlot =
      vehicleSlots.main === moduleKey && vehicleSlots.off === moduleKey
        ? "both"
        : vehicleSlots.main === moduleKey
          ? "main"
          : vehicleSlots.off === moduleKey
            ? "off"
            : vehicleSlots.armor === moduleKey
              ? "armor"
              : (vehicleSlots.support ?? []).includes(moduleKey)
                ? "support"
                : null;

    const handleEquipToggle = (e) => {
      e.stopPropagation();
      onModuleChange(vehicleIndex, moduleIndex, "equipped", !isEquipped);
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

    const isGenericModuleTypeName = (name) =>
      name === "pilot_module_armor" ||
      name === "pilot_module_weapon" ||
      name === "pilot_module_support";

    const moduleName = module.name ?? module.key;
    const resolvedModuleName =
      isGenericModuleTypeName(moduleName) &&
      module.key &&
      !isGenericModuleTypeName(module.key)
        ? module.key
        : moduleName;

    const isCustomModule =
      resolvedModuleName === "pilot_custom_armor" ||
      resolvedModuleName === "pilot_custom_weapon" ||
      resolvedModuleName === "pilot_custom_support";

    const moduleDisplayName = isCustomModule
      ? module.customName || t("pilot_custom")
      : t(resolvedModuleName);

    return (
      <>
        <Accordion>
          <AccordionSummary
            slots={{ root: AccordionSummaryDiv }}
            expandIcon={<ExpandMore />}
          >
            <Grid
              container
              spacing={2}
              sx={{ alignItems: "center", width: "100%" }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 2,
                }}
              >
                <Button
                  variant={isEquipped ? "contained" : "outlined"}
                  color={isEquipped ? "success" : "primary"}
                  disabled={!isEquipped && !canEquip}
                  onClick={handleEquipToggle}
                  sx={{ minWidth: 80 }}
                >
                  {isEquipped ? t("Equipped") : t("Equip")}
                </Button>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 5,
                }}
              >
                <Typography variant="h6">
                  {moduleDisplayName}
                  {module.cumbersome && " ⚠"}
                  {module.isShield && " 🛡"}
                  {module.isComplex && " ⚙⚙"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t(module.type)}
                  {isEquipped && module.type === "pilot_module_weapon" && (
                    <>
                      {" "}
                      |{" "}
                      {module.cumbersome
                        ? t("both_hand")
                        : moduleSlot === "main"
                          ? t("main_hand")
                          : t("off_hand")}
                    </>
                  )}
                </Typography>
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "flex-end" }}
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                {isEquipped &&
                  module.type === "pilot_module_weapon" &&
                  (module.isShield ? (
                    <ToggleButtonGroup
                      value={moduleSlot || "off"}
                      exclusive
                      onChange={(e, newValue) => {
                        e.stopPropagation();
                        if (newValue !== null) {
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "equippedSlot",
                            newValue,
                          );
                        }
                      }}
                      size="small"
                    >
                      <ToggleButton
                        value="main"
                        disabled={
                          !vehicle.modules.some((m) => {
                            const mk = m.key ?? m.name;
                            return (
                              m.isShield &&
                              vehicleSlots.off === mk &&
                              mk !== moduleKey
                            );
                          })
                        }
                        sx={{ minWidth: 35 }}
                      >
                        {t("m_abbr")}
                      </ToggleButton>
                      <ToggleButton value="off" sx={{ minWidth: 35 }}>
                        {t("o_abbr")}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : module.cumbersome ? (
                    <Button
                      variant="contained"
                      size="small"
                      disabled
                      sx={{ minWidth: 35 }}
                    >
                      {t("mo_abbr")}
                    </Button>
                  ) : (
                    <ToggleButtonGroup
                      value={moduleSlot || "main"}
                      exclusive
                      onChange={(e, newValue) => {
                        e.stopPropagation();
                        if (newValue !== null) {
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "equippedSlot",
                            newValue,
                          );
                        }
                      }}
                      size="small"
                    >
                      <ToggleButton value="main" sx={{ minWidth: 35 }}>
                        {t("m_abbr")}
                      </ToggleButton>
                      <ToggleButton
                        value="off"
                        disabled={vehicle.modules.some((m) => {
                          const mk = m.key ?? m.name;
                          return (
                            m.isShield &&
                            vehicleSlots.off === mk &&
                            mk !== moduleKey
                          );
                        })}
                        sx={{ minWidth: 35 }}
                      >
                        {t("o_abbr")}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ))}
              </Grid>

              <Grid
                sx={{ display: "flex", justifyContent: "flex-end" }}
                size={{
                  xs: 12,
                  sm: 2,
                }}
              >
                <div
                  style={{ display: "flex", gap: 8 }}
                  onClick={(e) => e.stopPropagation()}
                >
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
              <Grid
                size={{
                  xs: 12,
                  sm: 3,
                }}
              >
                <ModuleDropdown
                  value={resolvedModuleName || ""}
                  onChange={handleModuleDropdownChange}
                />
              </Grid>

              {isCustomModule && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("pilot_custom")}
                      value={module.customName || ""}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "customName",
                          e.target.value,
                        )
                      }
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>{t("Type")}</InputLabel>
                      <Select
                        value={module.type || ""}
                        onChange={(e) =>
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "type",
                            e.target.value,
                          )
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
              {isEquipped && module.type === "pilot_module_weapon" && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 2,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 1,
                      }}
                    >
                      {t("Hand")}
                    </Typography>
                    <ToggleButtonGroup
                      value={moduleSlot || (module.isShield ? "off" : "main")}
                      exclusive
                      onChange={(e, newValue) => {
                        if (newValue !== null) {
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "equippedSlot",
                            newValue,
                          );
                        }
                      }}
                      size="small"
                    >
                      <ToggleButton value="main">{t("m_abbr")}</ToggleButton>
                      <ToggleButton
                        value="off"
                        disabled={
                          !module.isShield &&
                          vehicle.modules.some((m) => {
                            const mk = m.key ?? m.name;
                            return (
                              m.isShield &&
                              vehicleSlots.off === mk &&
                              mk !== moduleKey
                            );
                          })
                        }
                      >
                        {t("o_abbr")}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        color: "text.secondary",
                      }}
                    >
                      {moduleSlot === "off" ? t("off_hand") : t("main_hand")}
                    </Typography>
                  </div>
                </Grid>
              )}

              {/* Weapon Module Checkboxes */}
              {module.type === "pilot_module_weapon" && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={module.isShield || false}
                          onChange={(e) =>
                            onModuleChange(
                              vehicleIndex,
                              moduleIndex,
                              "isShield",
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <div>
                          <Typography component="span">
                            {t("pilot_shield")}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            {t("pilot_defensive_equipment")}
                          </Typography>
                        </div>
                      }
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={module.cumbersome || false}
                          onChange={(e) =>
                            onModuleChange(
                              vehicleIndex,
                              moduleIndex,
                              "cumbersome",
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label={
                        <div>
                          <Typography component="span">
                            {t("pilot_cumbersome")}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
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
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={module.isComplex || false}
                          onChange={(e) =>
                            onModuleChange(
                              vehicleIndex,
                              moduleIndex,
                              "isComplex",
                              e.target.checked,
                            )
                          }
                          disabled={!isCustomModule}
                        />
                      }
                      label={
                        <div>
                          <Typography component="span">
                            {t("pilot_complex")}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontSize: "0.875rem",
                            }}
                          >
                            {t("pilot_takes_two_slots")}
                          </Typography>
                        </div>
                      }
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Cost")}
                      type="number"
                      value={module.cost || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "cost",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>
                </>
              )}

              {/* Module Description */}
              <Grid size={12}>
                {isCustomModule ? (
                  <CustomTextarea
                    fullWidth
                    label={t("Description")}
                    value={module.description || ""}
                    onChange={(e) =>
                      onModuleChange(
                        vehicleIndex,
                        moduleIndex,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                ) : (
                  <div
                    style={{
                      padding: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "4px",
                      backgroundColor: "rgba(0, 0, 0, 0.03)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", mb: 1, display: "block" }}
                    >
                      {t("Description")}
                    </Typography>
                    <div style={{ fontSize: "0.95em" }}>
                      <ReactMarkdown
                        components={{
                          p: ({ _node, ...props }) => (
                            <p style={{ margin: 0 }} {...props} />
                          ),
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
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>{t("Category")}</InputLabel>
                      <Select
                        value={module.category || ""}
                        onChange={(e) =>
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "category",
                            e.target.value,
                          )
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

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>{t("First Attribute")}</InputLabel>
                      <Select
                        value={module.accuracy?.attr1 || "might"}
                        onChange={(e) =>
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "accuracy.attr1",
                            e.target.value,
                          )
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

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>{t("Second Attribute")}</InputLabel>
                      <Select
                        value={module.accuracy?.attr2 || "dexterity"}
                        onChange={(e) =>
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "accuracy.attr2",
                            e.target.value,
                          )
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

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Precision Modifier")}
                      type="number"
                      value={module.accuracy?.value || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "accuracy.value",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Damage Modifier")}
                      type="number"
                      value={module.damage?.value || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "damage.value",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>{t("Range")}</InputLabel>
                      <Select
                        value={module.range || "Melee"}
                        onChange={(e) =>
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "range",
                            e.target.value,
                          )
                        }
                        disabled={!isCustomModule}
                      >
                        <MenuItem value="Melee">{t("Melee")}</MenuItem>
                        <MenuItem value="Ranged">{t("Ranged")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <FormControl fullWidth>
                      <InputLabel>{t("Type")}</InputLabel>
                      <Select
                        value={module.damage?.type || "physical"}
                        onChange={(e) =>
                          onModuleChange(
                            vehicleIndex,
                            moduleIndex,
                            "damage.type",
                            e.target.value,
                          )
                        }
                        disabled={!isCustomModule}
                      >
                        <MenuItem value="physical">{t("Physical")}</MenuItem>
                        <MenuItem value="air">{t("Air")}</MenuItem>
                        <MenuItem value="bolt">{t("Bolt")}</MenuItem>
                        <MenuItem value="dark">{t("Dark")}</MenuItem>
                        <MenuItem value="earth">{t("Earth")}</MenuItem>
                        <MenuItem value="fire">{t("Fire")}</MenuItem>
                        <MenuItem value="ice">{t("Ice")}</MenuItem>
                        <MenuItem value="light">{t("Light")}</MenuItem>
                        <MenuItem value="poison">{t("Poison")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Cost")}
                      type="number"
                      value={module.cost || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "cost",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 8,
                    }}
                  >
                    <CustomTextarea
                      fullWidth
                      label={t("Quality")}
                      value={module.quality || ""}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "quality",
                          e.target.value,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Cost of Quality")}
                      type="number"
                      value={module.qualityCost || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "qualityCost",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>
                </>
              )}

              {/* Armor Stats */}
              {module.type === "pilot_module_armor" && (
                <>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <ToggleButton
                      value="martial"
                      selected={module.martial || false}
                      onChange={() =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "martial",
                          !(module.martial || false),
                        )
                      }
                      size="small"
                      disabled={!isCustomModule}
                      sx={{
                        minWidth: 56,
                        height: 40,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Martial />
                    </ToggleButton>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Defense")}
                      type="number"
                      value={module.def || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "def",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("M. Defense")}
                      type="number"
                      value={module.mdef || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "mdef",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={t("Cost")}
                      type="number"
                      value={module.cost || 0}
                      onChange={(e) =>
                        onModuleChange(
                          vehicleIndex,
                          moduleIndex,
                          "cost",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!isCustomModule}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onClose={setDeleteDialogOpen}
          onConfirm={() => onDeleteModule(vehicleIndex, moduleIndex)}
          title={t("Delete")}
          message={t("Are you sure you want to delete this module?")}
          itemPreview={
            <Typography variant="h4">{moduleDisplayName}</Typography>
          }
        />
      </>
    );
  },
);

VehicleModule.displayName = "VehicleModule";

export default VehicleModule;
