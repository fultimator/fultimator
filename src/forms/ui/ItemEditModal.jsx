import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Close } from "@mui/icons-material";
import { useTranslate } from "../../translation/translate";
import { SchemaFieldRenderer } from "../rendering/SchemaFieldRenderer";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import PanelLayout from "./PanelLayout";
import { ITEM_TYPE_REGISTRY } from "./itemTypeRegistry";
import CompendiumViewerModal from "../../components/compendium/CompendiumViewerModal";

export default function ItemEditModal({
  open,
  onClose,
  itemType,
  item,
  editIndex,
  onSave,
  onDelete,
  ctx,
}) {
  const { t } = useTranslate();
  const reg = ITEM_TYPE_REGISTRY[itemType];
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState(() =>
    reg ? reg.buildState(item, ctx) : {},
  );

  const [accordionStates, setAccordionStates] = useState(() => {
    const initial = {};
    if (!reg) return initial;
    const initFs = reg.buildState(item, ctx);
    const gs = typeof reg.groups === "function" ? reg.groups(initFs) : reg.groups;
    (gs ?? []).forEach(({ accordionGroup, accordionDefaultExpanded }) => {
      if (accordionGroup && !(accordionGroup in initial)) {
        initial[accordionGroup] = accordionDefaultExpanded ? accordionDefaultExpanded(initFs) : false;
      }
    });
    return initial;
  });
  const [qualityBrowserOpen, setQualityBrowserOpen] = useState(false);

  useEffect(() => {
    if (reg) setFormState(reg.buildState(item, ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, itemType]);

  useEffect(() => {
    if (!reg) return;
    const gs = typeof reg.groups === "function" ? reg.groups(formState) : reg.groups;
    const next = {};
    (gs ?? []).forEach(({ key, accordionGroup, accordionDefaultExpanded }) => {
      if (accordionGroup && !(accordionGroup in next)) {
        next[accordionGroup] = accordionDefaultExpanded ? accordionDefaultExpanded(formState) : false;
      }
    });
    setAccordionStates(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, itemType]);

  const { isOpen: deleteOpen, closeDialog: closeDelete, handleDelete } =
    useDeleteConfirmation({
      onConfirm: () => {
        if (editIndex !== null && editIndex !== undefined) onDelete(editIndex);
        onClose();
      },
    });

  if (!reg) return null;

  const handleSave = () => {
    const payload = reg.buildSavePayload(formState, item, ctx);

    if (import.meta.env.DEV) {
      const result = reg.validate(payload);
      if (!result.success) {
        console.warn(`[ItemEditModal:${itemType}] validation failed`, result.error.issues);
      }
    }

    onSave(payload);
    reg.onAfterSave?.(formState, item, ctx);
  };

  const handleFileUpload = (rawData) => {
    const normalized = reg.normalizeUpload(rawData);
    if (!normalized) {
      fileInputRef.current.value = null;
      return;
    }
    const validation = reg.validate({ ...reg.buildState(normalized, ctx), ...normalized });
    if (!validation.success) {
      console.warn(`[ItemEditModal:${itemType}] upload failed validation`, validation.error.issues);
      fileInputRef.current.value = null;
      return;
    }
    setFormState(reg.buildState(normalized, ctx));
    fileInputRef.current.value = null;
  };

  const resolvedGroups =
    typeof reg.groups === "function" ? reg.groups(formState) : reg.groups;

  const armorSlotOnChange =
    reg.getSlotOnChange
      ? reg.getSlotOnChange(formState, setFormState, ctx)
      : null;

  const slotCostInfo =
    reg.getSlotCostInfo
      ? reg.getSlotCostInfo(formState, item, ctx)
      : null;

  const customWeaponQualityOnChange = reg.getQualityOnChange
    ? reg.getQualityOnChange(formState, setFormState)
    : null;

  const isEditing = editIndex !== null && editIndex !== undefined;
  const itemLabel = itemType.charAt(0).toUpperCase() + itemType.slice(1);

  const segments = [];
  for (const g of resolvedGroups) {
    if (g.accordionGroup) {
      const last = segments[segments.length - 1];
      if (last?.type === "accordion" && last.accordionGroup === g.accordionGroup) {
        last.groups.push(g);
      } else {
        segments.push({
          type: "accordion",
          accordionGroup: g.accordionGroup,
          label: g.label,
          groups: [g],
          accordionDefaultExpanded: g.accordionDefaultExpanded,
        });
      }
    } else {
      segments.push({ type: "plain", group: g });
    }
  }

  const resolveExtraProps = (extraProps) =>
    typeof extraProps === "function" ? extraProps(formState, ctx) : extraProps;

  const qualityFiltersByItemType = {
    weapon: ["weapon"],
    customWeapon: ["weapon", "customWeapon"],
    armor: ["armor"],
    shield: ["shield"],
    accessory: ["accessory"],
  };

  const qualityFilters = qualityFiltersByItemType[itemType] ?? [];

  const handleQualityImported = (qualityItem) => {
    setFormState((prev) => {
      const next = {
        ...prev,
        selectedQuality: qualityItem?.name ?? prev.selectedQuality,
        qualityName: qualityItem?.name ?? prev.qualityName,
        quality: qualityItem?.quality ?? prev.quality,
        qualityCost:
          qualityItem?.cost != null ? qualityItem.cost : prev.qualityCost,
      };

      if ("cost" in prev) {
        const prevQualityCost = Number(prev?.qualityCost) || 0;
        const importedCost = Number(qualityItem?.cost) || 0;
        next.cost = (Number(prev?.cost) || 0) - prevQualityCost + importedCost;
      }

      return next;
    });
    setQualityBrowserOpen(false);
  };

  const renderGroupContent = (g) => {
    const extraProps = resolveExtraProps(g.extraProps);
    const withBrowse =
      g.key === "quality"
        ? {
            ...(extraProps ?? {}),
            onBrowse: () => setQualityBrowserOpen(true),
          }
        : extraProps;
    return (
      <Grid container spacing={1}>
        <SchemaFieldRenderer
          config={reg.fieldConfig}
          state={formState}
          onChange={
            armorSlotOnChange && g.key === "slots"
              ? (next) => armorSlotOnChange("slots", next)
              : customWeaponQualityOnChange && g.key === "quality"
                ? customWeaponQualityOnChange
                : setFormState
          }
          surface="edit"
          group={g.key}
          label={t(g.label)}
          cols={g.cols ?? 2}
          extraProps={withBrowse}
        />
      </Grid>
    );
  };

  const formContent = (
    <Grid container spacing={1}>
      {segments.map((seg, i) => {
        if (seg.type === "accordion") {
          return (
            <Grid key={seg.accordionGroup + i} size={12} sx={{ mb: 0.5 }}>
              <Accordion
                expanded={!!accordionStates[seg.accordionGroup]}
                onChange={() =>
                  setAccordionStates((prev) => ({
                    ...prev,
                    [seg.accordionGroup]: !prev[seg.accordionGroup],
                  }))
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{t(seg.label)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {seg.groups.map((g) => (
                    <Box key={g.key} sx={{ mb: 1 }}>
                      {renderGroupContent(g)}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            </Grid>
          );
        }
        const g = seg.group;
        return (
          <Grid key={g.key} size={12} sx={{ mb: 0.5 }}>
            {renderGroupContent(g)}
          </Grid>
        );
      })}

      <Grid size={12}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="outlined" size="small" onClick={() => fileInputRef.current.click()}>
            {t("Upload JSON")}
          </Button>
          <Button variant="outlined" size="small" onClick={() => setFormState(reg.buildState(null, ctx))}>
            {t("Clear All Fields")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  handleFileUpload(JSON.parse(String(reader.result)));
                } catch {
                  console.warn(`[ItemEditModal:${itemType}] invalid JSON upload`);
                  fileInputRef.current.value = null;
                }
              };
              reader.readAsText(file);
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );

  const PreviewCard = reg.PreviewCard;
  const previewContent = <PreviewCard formState={formState} ctx={ctx} />;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        slotProps={{ paper: { sx: { width: "100%", maxWidth: "lg" } } }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {isEditing ? t(`Edit ${itemLabel}`) : t(`Add ${itemLabel}`)}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
        >
          <Close />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          <PanelLayout formContent={formContent} previewContent={previewContent} />
        </DialogContent>

        <Divider />
        <DialogActions>
          {isEditing && (
            <Button onClick={handleDelete} color="error" variant="contained">
              {t("Delete")}
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {slotCostInfo && slotCostInfo.delta !== 0 && (
            <Typography
              variant="body2"
              color={slotCostInfo.cannotAfford ? "error" : "text.secondary"}
            >
              {slotCostInfo.delta > 0
                ? `${t("Deduct on save")}: ${slotCostInfo.delta}z`
                : `${t("Refund on save")}: ${Math.abs(slotCostInfo.delta)}z`}
              {" "}({t("Current Zenit")}: {slotCostInfo.currentZenit}z)
              {slotCostInfo.cannotAfford ? ` - ${t("Not enough Zenit")}` : ""}
            </Typography>
          )}
          <Button onClick={onClose} color="secondary">
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            variant="contained"
            disabled={slotCostInfo?.cannotAfford ?? false}
          >
            {t("Save Changes")}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onClose={closeDelete}
        onConfirm={() => {
          if (isEditing) onDelete(editIndex);
          onClose();
        }}
        title={t("Confirm Deletion")}
        message={t(`Are you sure you want to delete this ${itemType}?`)}
        itemPreview={
          <Box>
            <Typography variant="h4">{formState.name}</Typography>
            {formState.cost != null && (
              <Typography variant="body2">{formState.cost} {t("zenit")}</Typography>
            )}
          </Box>
        }
      />
      <CompendiumViewerModal
        open={qualityBrowserOpen}
        onClose={() => setQualityBrowserOpen(false)}
        onAddItem={handleQualityImported}
        initialType="qualities"
        restrictToTypes={["qualities"]}
        initialQualityFilters={qualityFilters}
      />
    </>
  );
}
