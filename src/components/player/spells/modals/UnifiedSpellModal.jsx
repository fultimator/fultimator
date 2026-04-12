import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../../translation/translate";
import DeleteConfirmationDialog from "../../../common/DeleteConfirmationDialog";
import { buildInvokerAvailableInvocations } from "../invokerUtils";
import { availableFrames } from "../../../../libs/pilotVehicleData";

function isPilotConfigurationIllegal(formState) {
  const vehicles = formState?.vehicles || formState?.currentVehicles || [];
  if (!Array.isArray(vehicles) || vehicles.length === 0) return false;

  const getFrameLimits = (frameName) => {
    const frame = availableFrames.find((f) => f.name === frameName);
    return frame ? frame.limits : { weapon: 2, armor: 1, support: -1 };
  };

  const getModuleTypeForLimits = (module) => {
    if (module?.type === "pilot_module_armor") return "armor";
    if (module?.type === "pilot_module_weapon") return "weapon";
    if (module?.type === "pilot_module_support") return "support";
    return "custom";
  };

  const getEquippedCount = (vehicle, moduleType) => {
    if (!vehicle?.modules) return 0;
    return vehicle.modules
      .filter((m) => m.equipped && getModuleTypeForLimits(m) === moduleType)
      .reduce((count, module) => count + (moduleType === "support" && module.isComplex ? 2 : 1), 0);
  };

  return vehicles.some((vehicle) => {
    const frameLimits = getFrameLimits(vehicle.frame || "pilot_frame_exoskeleton");
    const totalSlots = (vehicle.modules || []).reduce((count, module) => {
      if (!module.equipped) return count;
      const moduleType = getModuleTypeForLimits(module);
      return count + (moduleType === "support" && module.isComplex ? 2 : 1);
    }, 0);
    if (totalSlots > (vehicle.maxEnabledModules || 3)) return true;

    return ["armor", "weapon", "support"].some((moduleType) => {
      const used = getEquippedCount(vehicle, moduleType);
      const limit = frameLimits[moduleType];
      return limit !== -1 && used > limit;
    });
  });
}

export default function UnifiedSpellModal({
  open,
  onClose,
  onSave,
  onDelete,
  spellType,
  spell,
  sections,
  title,
  initialSectionId,
}) {
  const { t } = useTranslate();
  const getResolvedTitle = () => {
    if (title) return title;
    if (spell?.spellName) return spell.spellName;

    const tryTranslate = (key) => {
      if (!key) return "";
      const translated = t(key);
      return translated !== key ? translated : "";
    };

    const typeSpecificTitleKeys = {
      arcanist: "arcanist_arcanum",
      cooking: "gourmet_cookbook",
      dance: "dance_dance",
      deck: "ace_deck",
      gamble: "Gamble",
      gift: "esper_gift",
      gourmet: "gourmet_cookbook",
      invocation: "invoker_invocation",
      magichant: "magichant",
      magiseed: "magiseed_garden",
      mutant: "mutant_therioforms",
      "vehicles": "pilot_vehicle",
      symbol: "symbol_symbols",
      therioform: "mutant_therioforms",
      "tinkerer-alchemy": "Alchemy",
      "tinkerer-infusion": "Infusion",
      "tinkerer-magitech": "Magitech",
    };

    return (
      tryTranslate(typeSpecificTitleKeys[spellType]) ||
      tryTranslate(`${spellType}_settings_button`) ||
      tryTranslate(`${spellType}_edit_${spellType}_button`) ||
      spellType
    );
  };
  const resolveInitialSectionId = (sectionList) => {
    if (!sectionList || sectionList.length === 0) return "general";
    if (initialSectionId && sectionList.some((section) => section.id === initialSectionId)) {
      return initialSectionId;
    }
    // Prefer the editable content tab by default when available.
    if (sectionList.some((section) => section.id === "content")) {
      return "content";
    }
    // Otherwise, default to the first defined section (e.g. cookbook for gourmet).
    return sectionList[0].id;
  };

  const [activeSectionId, setActiveSectionId] = useState(resolveInitialSectionId(sections));
  const [formState, setFormState] = useState(spell || {});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (spell) {
      setFormState(spell);
    }
  }, [spell, open]);

  // Reset to first section when modal opens
  useEffect(() => {
    if (open && sections?.length > 0) {
      setActiveSectionId(resolveInitialSectionId(sections));
    }
  }, [open, sections, initialSectionId]);

  const handleSave = () => {
    if (!onSave || !spell) return;

    if (spellType === "pilot" && isPilotConfigurationIllegal(formState)) {
      return;
    }

    const payload =
      spellType === "invoker"
        ? {
            ...formState,
            availableInvocations: buildInvokerAvailableInvocations(formState?.skillLevel),
          }
        : formState;

    if (onSave.length >= 2 && spell.index !== undefined) {
      onSave(spell.index, payload);
    } else {
      onSave(payload);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && spell) {
      onDelete(spell.index);
    }
    setDeleteConfirmOpen(false);
  };

  const activeSection = sections?.find(s => s.id === activeSectionId);
  const saveDisabled = spellType === "pilot" && isPilotConfigurationIllegal(formState);

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: "85%", maxWidth: "lg" } }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {getResolvedTitle()}
        </DialogTitle>

        <Button
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
        </Button>

        {/* Section tabs */}
        {sections.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeSectionId}
              onChange={(e, newValue) => setActiveSectionId(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {sections.map((section) => (
                <Tab
                  key={section.id}
                  label={t(section.title)}
                  value={section.id}
                />
              ))}
            </Tabs>
          </Box>
        )}

        <DialogContent>
          {activeSection && (
            <activeSection.component
              {...activeSection.props}
              formState={formState}
              setFormState={setFormState}
              t={t}
            />
          )}
        </DialogContent>

        <DialogActions>
          {activeSectionId === "general" && onDelete && (
            <Button
              onClick={handleDeleteClick}
              variant="contained"
              color="error"
            >
              {t("Delete")}
            </Button>
          )}
          <Button onClick={onClose} variant="outlined">
            {t("Cancel")}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saveDisabled}>
            {t("Save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <DeleteConfirmationDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={t("Delete")}
          message={
            t(`${spellType}_delete_confirmation_message`) ||
            t("Are you sure you want to delete this spell?")
          }
          itemPreview={
            spell?.spellName ||
            spell?.name ||
            spell?.customName ||
            spellType
          }
        />
      )}
    </>
  );
}
