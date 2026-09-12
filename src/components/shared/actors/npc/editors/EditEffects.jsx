import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { useTranslate } from "/src/translation/translate";
import { TabbedSchemaFormRenderer } from "/src/forms/rendering/TabbedSchemaFormRenderer";
import {
  actorEffectRowFields,
  BLANK_ACTOR_EFFECT,
  passiveGroupLabels,
} from "/src/forms/rendering/config/shared/behaviorFields";
import { summarizeEffectChanges } from "./effectChangeSummary";

const NO_TABS = [];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function EffectSubtitle({ effect, t }) {
  const summary = summarizeEffectChanges(effect);
  return (
    <Typography
      variant="body2"
      sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
    >
      {summary || t("effect_no_bonuses")}
    </Typography>
  );
}

function ActorEffectDialogInner({ effect, isNew, onClose, onSave, onDelete }) {
  const { t } = useTranslate();
  const [draft, setDraft] = useState(() => effect ?? BLANK_ACTOR_EFFECT());

  return (
    <>
      <DialogTitle>
        {isNew ? t("add_actor_effect") : t("edit_actor_effect")}
      </DialogTitle>
      <DialogContent sx={{ "&.MuiDialogContent-root": { pt: 4 } }}>
        <TabbedSchemaFormRenderer
          tabs={NO_TABS}
          config={actorEffectRowFields}
          groupLabels={passiveGroupLabels}
          state={draft}
          onChange={setDraft}
          surface="modal"
          cols={2}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Box>
          {onDelete && (
            <IconButton color="error" onClick={onDelete} size="small">
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose}>{t("Cancel")}</Button>
          <Button
            variant="contained"
            onClick={() => onSave(draft)}
            disabled={!draft.name?.trim()}
          >
            {t("Save")}
          </Button>
        </Box>
      </DialogActions>
    </>
  );
}

function ActorEffectDialog({ open, effect, isNew, onClose, onSave, onDelete }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      {open && (
        <ActorEffectDialogInner
          key={effect?.id ?? "new"}
          effect={effect}
          isNew={isNew}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </Dialog>
  );
}

export default function EditEffects({ npc, setNpc }) {
  const { t } = useTranslate();
  const [dialog, setDialog] = useState(null); // { effect, isNew } | null
  const effects = asArray(npc.effects);

  const openAdd = () =>
    setDialog({ effect: BLANK_ACTOR_EFFECT(), isNew: true });

  const openEdit = (effect) =>
    setDialog({ effect: { ...effect }, isNew: false });

  const saveEffect = (draft) => {
    setNpc((prev) => {
      const existing = asArray(prev.effects);
      const idx = existing.findIndex((e) => e.id === draft.id);
      const next =
        idx >= 0
          ? existing.map((e, i) => (i === idx ? draft : e))
          : [...existing, draft];
      return { ...prev, effects: next };
    });
    setDialog(null);
  };

  const deleteEffect = () => {
    const id = dialog?.effect?.id;
    if (!id) return;
    setNpc((prev) => ({
      ...prev,
      effects: asArray(prev.effects).filter((e) => e.id !== id),
    }));
    setDialog(null);
  };

  const isExisting =
    dialog != null && effects.some((e) => e.id === dialog.effect?.id);

  return (
    <SectionCard
      title={t("effects")}
      actions={
        <Tooltip title={t("add_actor_effect")}>
          <IconButton size="small" onClick={openAdd} sx={{ color: "#fff" }}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, p: 1 }}>
        {effects.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ px: 0.5 }}>
            {t("no_effects")}
          </Typography>
        ) : (
          effects.map((effect, index) => (
            <ItemRowCard
              key={effect.id ?? index}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    py: "4px",
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: "Antonio",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "uppercase",
                      lineHeight: 1.3,
                    }}
                  >
                    {effect.name || t("Unnamed Effect")}
                  </Typography>
                  {effect.disabled && (
                    <Chip size="small" color="default" label={t("Disabled")} />
                  )}
                </Box>
              }
              subtitle={<EffectSubtitle effect={effect} t={t} />}
              actions={
                <Tooltip title={t("Edit")}>
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEdit(effect)}
                    >
                      {t("Edit")}
                    </Button>
                  </span>
                </Tooltip>
              }
              onClick={() => openEdit(effect)}
              paperSx={{ width: "100%", mb: 0.5 }}
            />
          ))
        )}
      </Box>

      <ActorEffectDialog
        open={dialog != null}
        effect={dialog?.effect}
        isNew={dialog?.isNew}
        onClose={() => setDialog(null)}
        onSave={saveEffect}
        onDelete={isExisting ? deleteEffect : undefined}
      />
    </SectionCard>
  );
}
