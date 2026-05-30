import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import { SchemaFieldRenderer } from "../../../forms/rendering/SchemaFieldRenderer";
import { classFieldConfig } from "../../../forms/rendering/config/itemConfigs/class";
import { createDefaultStateFromFields } from "../../../forms/registry/helpers";
import { SharedClassCard } from "../../shared/itemCards/class/SharedClassCards";
import PanelLayout from "../../../forms/ui/PanelLayout";

// Map player class object → schema form state
function playerClassToFormState(cls) {
  const defaults = createDefaultStateFromFields(classFieldConfig);
  const BLANK_SKILL = { name: "", fuid: undefined, maxLvl: 1, description: "", specialSkill: "" };
  const skills = Array.from({ length: 5 }, (_, i) => {
    const s = cls.skills?.[i];
    if (!s) return { ...BLANK_SKILL };
    return {
      name: s.skillName ?? s.name ?? "",
      fuid: s.fuid ?? undefined,
      maxLvl: s.maxLvl ?? 1,
      description: s.description ?? "",
      specialSkill: s.specialSkill ?? "",
    };
  });
  return {
    ...defaults,
    name: cls.name ?? "",
    fuid: cls.fuid ?? undefined,
    benefits: {
      hpplus: cls.benefits?.hpplus ?? 0,
      mpplus: cls.benefits?.mpplus ?? 0,
      ipplus: cls.benefits?.ipplus ?? 0,
      martials: cls.benefits?.martials ?? { armor: false, shields: false, melee: false, ranged: false },
      rituals: cls.benefits?.rituals ?? { ritualism: false },
      custom: (cls.benefits?.custom ?? []).map((v) => (typeof v === "string" ? { value: v } : v)),
      spellClasses: cls.benefits?.spellClasses ?? [],
    },
    skills,
  };
}

// Map schema form state → player class patch (only fields the form owns)
function formStateToClassPatch(formState) {
  const normalizedCustom = Array.isArray(formState.benefits?.custom)
    ? formState.benefits.custom
        .map((e) => (typeof e === "string" ? e : e?.value ?? ""))
        .filter((e) => e.trim())
    : [];

  const skills = (formState.skills ?? [])
    .filter((s) => s.name?.trim())
    .map((s) => ({
      skillName: s.name,
      fuid: s.fuid ?? undefined,
      maxLvl: s.maxLvl ?? 1,
      currentLvl: 0,
      description: s.description ?? "",
      specialSkill: s.specialSkill ?? "",
    }));

  return {
    name: String(formState.name ?? "").trim(),
    fuid: formState.fuid ?? undefined,
    benefits: {
      hpplus: formState.benefits?.hpplus ?? 0,
      mpplus: formState.benefits?.mpplus ?? 0,
      ipplus: formState.benefits?.ipplus ?? 0,
      martials: formState.benefits?.martials ?? {},
      rituals: formState.benefits?.rituals ?? {},
      custom: normalizedCustom,
      isCustomBenefit: normalizedCustom.length > 0,
      spellClasses: formState.benefits?.spellClasses ?? [],
    },
    skills,
  };
}

export default function EditPlayerClassModal({ open, onClose, cls, onSave }) {
  const { t } = useTranslate();
  const [formState, setFormState] = useState(() => createDefaultStateFromFields(classFieldConfig));

  useEffect(() => {
    if (open && cls) {
      setFormState(playerClassToFormState(cls));
    }
  }, [open, cls]);

  const normalizedCustomBenefits = Array.isArray(formState.benefits?.custom)
    ? formState.benefits.custom
        .map((e) => (typeof e === "string" ? e : e?.value ?? ""))
        .filter((e) => e.trim())
    : [];

  const previewItem = {
    ...formState,
    name: String(formState.name ?? "").trim(),
    fuid: formState.fuid || undefined,
    benefits: {
      ...(formState.benefits ?? {}),
      custom: normalizedCustomBenefits,
      isCustomBenefit: normalizedCustomBenefits.length > 0,
    },
    skills: (formState.skills ?? []).filter((s) => s.name?.trim?.()),
  };

  const handleSave = () => {
    onSave(formStateToClassPatch(formState));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {formState.name ? t(formState.name) : t("Edit Class")}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <PanelLayout
          formContent={
            <Grid container spacing={1}>
              <SchemaFieldRenderer
                config={classFieldConfig}
                state={formState}
                onChange={setFormState}
                surface="edit"
                group="core"
                cols={2}
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
            </Grid>
          }
          previewContent={<SharedClassCard item={previewItem} />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" onClick={handleSave}>{t("Save Changes")}</Button>
      </DialogActions>
    </Dialog>
  );
}
