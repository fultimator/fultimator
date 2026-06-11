import { useState } from "react";
import { Box, Breadcrumbs, IconButton, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { useTranslate } from "/src/translation/translate";
import { collectPlayerEffects } from "./effectsTabCollector";
import spellModalRegistry from "/src/components/shared/actors/pc/spells/spellModalRegistry";
import {
  PlayerAccessoryModal,
  PlayerArmorModal,
  PlayerCustomWeaponModal,
  PlayerShieldModal,
  PlayerWeaponModal,
} from "/src/components/shared/actors/pc/editors";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function durationLabel(duration, t) {
  if (!duration) return t("None");
  if (typeof duration === "string") return t(duration);
  if (typeof duration !== "object") return t("None");

  const event = duration.event || "none";
  if (event === "none") return t("None");
  if (event === "rest") return t("Rest");
  if (event === "end-of-scene") return t("End of Scene");
  if (event === "start-of-turn") return t("Start of Turn");
  if (event === "end-of-turn") return t("End of Turn");
  if (event === "end-of-round") return t("End of Round");
  return t(event);
}

function behaviorDurationLabel(behavior, t) {
  const durations = [];
  if (behavior?.appliesEffect?.duration) {
    durations.push(durationLabel(behavior.appliesEffect.duration, t));
  }
  for (const branch of asArray(behavior?.branches)) {
    if (branch?.appliesEffect?.duration) {
      durations.push(durationLabel(branch.appliesEffect.duration, t));
    }
  }
  const unique = [...new Set(durations.filter(Boolean))];
  return unique.length > 0 ? unique.join(", ") : t("None");
}

function sourceBreadcrumbs(source) {
  return String(source || "")
    .split(" > ")
    .map((part) => part.trim())
    .filter(Boolean);
}

function EffectSubtitle({ source, duration }) {
  const { t } = useTranslate();
  const crumbs = sourceBreadcrumbs(source);
  const captionSx = {
    fontSize: "0.75rem",
    lineHeight: 1.35,
    color: "text.secondary",
  };
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        columnGap: 0.75,
        rowGap: 0.25,
        minWidth: 0,
        color: "text.secondary",
      }}
    >
      <Typography variant="caption" sx={captionSx}>
        {t("Source")}:
      </Typography>
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: "0.8rem" }} />}
        aria-label={t("Source")}
        sx={{
          minWidth: 0,
          fontSize: captionSx.fontSize,
          lineHeight: captionSx.lineHeight,
          "& .MuiBreadcrumbs-ol": {
            flexWrap: "wrap",
            rowGap: 0.25,
            alignItems: "center",
          },
          "& .MuiBreadcrumbs-li": {
            minWidth: 0,
            maxWidth: 180,
            display: "flex",
            alignItems: "center",
          },
          "& .MuiBreadcrumbs-separator": {
            mx: 0.25,
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
            opacity: 0.72,
          },
        }}
      >
        {crumbs.length > 0 ? (
          crumbs.map((crumb, index) => (
            <Typography
              key={`${crumb}-${index}`}
              variant="caption"
              noWrap
              sx={{ ...captionSx, display: "block", maxWidth: "100%" }}
            >
              {crumb}
            </Typography>
          ))
        ) : (
          <Typography variant="caption" sx={captionSx}>
            {t("Unknown")}
          </Typography>
        )}
      </Breadcrumbs>
      <Typography variant="caption" sx={captionSx}>
        / {t("Duration")}: {duration}
      </Typography>
    </Box>
  );
}

const EQUIPMENT_MODAL_CONFIG = {
  weapons: {
    Component: PlayerWeaponModal,
    itemProp: "weapon",
    indexProp: "editWeaponIndex",
    saveProp: "onAddWeapon",
    deleteProp: "onDeleteWeapon",
  },
  customWeapons: {
    Component: PlayerCustomWeaponModal,
    itemProp: "customWeapon",
    indexProp: "editCustomWeaponIndex",
    saveProp: "onAddCustomWeapon",
    deleteProp: "onDeleteCustomWeapon",
    needsPlayer: true,
  },
  shields: {
    Component: PlayerShieldModal,
    itemProp: "shield",
    indexProp: "editShieldIndex",
    saveProp: "onAddShield",
    deleteProp: "onDeleteShield",
  },
  armor: {
    Component: PlayerArmorModal,
    itemProp: "armorPlayer",
    indexProp: "editArmorIndex",
    saveProp: "onAddArmor",
    deleteProp: "onDeleteArmor",
    needsPlayer: true,
  },
  accessories: {
    Component: PlayerAccessoryModal,
    itemProp: "accessory",
    indexProp: "editAccIndex",
    saveProp: "onAddAccessory",
    deleteProp: "onDeleteAccessory",
  },
};

function isEditableSource(sourceRef) {
  if (sourceRef?.kind === "spell") return true;
  if (sourceRef?.kind === "equipment") {
    return Boolean(EQUIPMENT_MODAL_CONFIG[sourceRef.group]);
  }
  return false;
}

function findSpell(player, sourceRef) {
  if (!sourceRef) return null;
  if (sourceRef.owner === "class") {
    const klass = asArray(player?.classes).find(
      (entry) => entry?.name === sourceRef.className,
    );
    return asArray(klass?.spells)[sourceRef.spellIndex] ?? null;
  }
  if (sourceRef.owner === "mnemo") {
    for (const equipment of asArray(player?.equipment)) {
      const mnemo = asArray(equipment?.mnemospheres).find(
        (entry) => entry?.id === sourceRef.mnemoId,
      );
      if (mnemo) return asArray(mnemo?.spells)[sourceRef.spellIndex] ?? null;
    }
  }
  return null;
}

function findEquipmentItem(player, sourceRef) {
  const equipment = asArray(player?.equipment)[sourceRef?.equipmentIndex ?? -1];
  return asArray(equipment?.[sourceRef?.group])[sourceRef?.itemIndex] ?? null;
}

function EffectSection({ title, rows, getDuration, canEdit, onEditSource }) {
  const { t } = useTranslate();

  return (
    <SectionCard title={title} noShadow>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, p: 1 }}>
        {rows.length === 0 ? (
          <Typography color="text.secondary" variant="body2" sx={{ px: 0.5 }}>
            {t("No effects.")}
          </Typography>
        ) : (
          rows.map(({ effect, source, sourceRef }, index) => {
            const editable = canEdit && isEditableSource(sourceRef);
            return (
              <ItemRowCard
                key={`${source}-${effect?.id ?? effect?.name ?? index}`}
                label={effect?.name || t("Unnamed Effect")}
                subtitle={
                  <EffectSubtitle
                    source={source}
                    duration={getDuration(effect)}
                  />
                }
                actions={
                  <Tooltip
                    title={
                      editable
                        ? t("Edit source")
                        : t("Open the source tab to edit this item")
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        aria-label={t("Edit source")}
                        disabled={!editable}
                        onClick={() => onEditSource(sourceRef)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                }
                onClick={undefined}
                onCardClick={undefined}
                paperSx={{ width: "100%" }}
              />
            );
          })
        )}
      </Box>
    </SectionCard>
  );
}

function SourceEditModalLayer({ player, setPlayer, sourceRef, onClose }) {
  if (!sourceRef || !setPlayer) return null;

  if (sourceRef.kind === "spell") {
    const spell = findSpell(player, sourceRef);
    const modalName = sourceRef.modalName || "default";
    const entry = spellModalRegistry[modalName] ?? spellModalRegistry.default;
    const ModalComponent = entry.Component;
    if (!spell) return null;

    const saveSpell = (spellIndex, editedSpell) => {
      const pendingZenitSpent = Math.max(
        0,
        Number(editedSpell?._pendingZenitSpent) || 0,
      );
      const { _pendingZenitSpent, ...spellToSave } = editedSpell || {};
      setPlayer((prev) => {
        if (sourceRef.owner === "class") {
          return {
            ...prev,
            info:
              pendingZenitSpent > 0
                ? {
                    ...prev.info,
                    zenit: Math.max(
                      0,
                      (Number(prev.info?.zenit) || 0) - pendingZenitSpent,
                    ),
                  }
                : prev.info,
            classes: asArray(prev.classes).map((klass) =>
              klass?.name === sourceRef.className
                ? {
                    ...klass,
                    spells: asArray(klass.spells).map((candidate, index) =>
                      index === spellIndex ? spellToSave : candidate,
                    ),
                  }
                : klass,
            ),
          };
        }

        return {
          ...prev,
          info:
            pendingZenitSpent > 0
              ? {
                  ...prev.info,
                  zenit: Math.max(
                    0,
                    (Number(prev.info?.zenit) || 0) - pendingZenitSpent,
                  ),
                }
              : prev.info,
          equipment: asArray(prev.equipment).map((equipment) => ({
            ...equipment,
            mnemospheres: asArray(equipment.mnemospheres).map((mnemo) =>
              mnemo?.id === sourceRef.mnemoId
                ? {
                    ...mnemo,
                    spells: asArray(mnemo.spells).map((candidate, index) =>
                      index === spellIndex ? spellToSave : candidate,
                    ),
                  }
                : mnemo,
            ),
          })),
        };
      });
      onClose();
    };

    const deleteSpell = (spellIndex) => {
      setPlayer((prev) => {
        if (sourceRef.owner === "class") {
          return {
            ...prev,
            classes: asArray(prev.classes).map((klass) =>
              klass?.name === sourceRef.className
                ? {
                    ...klass,
                    spells: asArray(klass.spells).filter(
                      (_, index) => index !== spellIndex,
                    ),
                  }
                : klass,
            ),
          };
        }

        return {
          ...prev,
          equipment: asArray(prev.equipment).map((equipment) => ({
            ...equipment,
            mnemospheres: asArray(equipment.mnemospheres).map((mnemo) =>
              mnemo?.id === sourceRef.mnemoId
                ? {
                    ...mnemo,
                    spells: asArray(mnemo.spells).filter(
                      (_, index) => index !== spellIndex,
                    ),
                  }
                : mnemo,
            ),
          })),
        };
      });
      onClose();
    };

    return (
      <ModalComponent
        {...entry.buildProps(spell, sourceRef.spellIndex, {
          onSave: saveSpell,
          onDelete: deleteSpell,
          onClose,
          isEditMode: true,
          player,
          setPlayer,
        })}
      />
    );
  }

  if (sourceRef.kind === "equipment") {
    const config = EQUIPMENT_MODAL_CONFIG[sourceRef.group];
    if (!config) return null;
    const ModalComponent = config.Component;
    const item = findEquipmentItem(player, sourceRef);
    if (!item) return null;

    const saveEquipmentItem = (nextItem) => {
      setPlayer((prev) => ({
        ...prev,
        equipment: asArray(prev.equipment).map((equipment, equipmentIndex) =>
          equipmentIndex === sourceRef.equipmentIndex
            ? {
                ...equipment,
                [sourceRef.group]: asArray(equipment[sourceRef.group]).map(
                  (candidate, itemIndex) =>
                    itemIndex === sourceRef.itemIndex ? nextItem : candidate,
                ),
              }
            : equipment,
        ),
      }));
      onClose();
    };

    const deleteEquipmentItem = () => {
      setPlayer((prev) => ({
        ...prev,
        equipment: asArray(prev.equipment).map((equipment, equipmentIndex) =>
          equipmentIndex === sourceRef.equipmentIndex
            ? {
                ...equipment,
                [sourceRef.group]: asArray(equipment[sourceRef.group]).filter(
                  (_, itemIndex) => itemIndex !== sourceRef.itemIndex,
                ),
              }
            : equipment,
        ),
      }));
      onClose();
    };

    return (
      <ModalComponent
        open
        onClose={onClose}
        {...{
          [config.indexProp]: sourceRef.itemIndex,
          [config.itemProp]: item,
          [config.saveProp]: saveEquipmentItem,
          [config.deleteProp]: deleteEquipmentItem,
          ...(config.needsPlayer ? { player, setPlayer } : {}),
        }}
      />
    );
  }

  return null;
}

export default function EffectsTab({ player, setPlayer, isEditMode = false }) {
  const { t } = useTranslate();
  const [editingSourceRef, setEditingSourceRef] = useState(null);
  const effects = collectPlayerEffects(player);
  const canEdit = isEditMode && typeof setPlayer === "function";

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <EffectSection
          title={t("Passives")}
          rows={effects.passives}
          getDuration={(passive) => durationLabel(passive?.duration, t)}
          canEdit={canEdit}
          onEditSource={setEditingSourceRef}
        />
        <EffectSection
          title={t("Behaviors")}
          rows={effects.behaviors}
          getDuration={(behavior) => behaviorDurationLabel(behavior, t)}
          canEdit={canEdit}
          onEditSource={setEditingSourceRef}
        />
      </Box>
      <SourceEditModalLayer
        player={player}
        setPlayer={setPlayer}
        sourceRef={editingSourceRef}
        onClose={() => setEditingSourceRef(null)}
      />
    </>
  );
}
