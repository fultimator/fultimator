import React, { useMemo } from "react";
import { Typography, Grid, Box, IconButton, Tooltip } from "@mui/material";
import SectionCard from "../../common/SectionCard";
import { Casino, Message } from "@mui/icons-material";
import { useTranslate } from "../../../../../translation/translate";
import { useSpellModals } from "../../../../player/common/hooks/useSpellModals";
import { getActiveMnemosphereSkills } from "../../../../player/equipment/slots/loadoutSelectors";
import spellDisplayRegistry from "../spells/spellDisplayRegistry";
import spellModalRegistry, {
  spellTypeToModalName,
} from "../spells/spellModalRegistry";
import { calculateAttribute } from "../../../../player/common/playerCalculations";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "../../../../app-drawer/panels/chat/domain/magic-checks";
import { sendRollMessage, sendDisplayMessage } from "../../../../../hooks/useRollToChat";

export default function PcSpells({
  pc,
  isInteractive = false,
  onUpdate,
  isCharacterSheet = false,
}) {
  const { t } = useTranslate();

  const {
    currentModal,
    spellBeingEdited,
    editingSpellClass,
    editingSpellIndex,
    openModal,
    closeModal,
  } = useSpellModals();

  const canEdit = Boolean(isInteractive && onUpdate);

  const getAttrDie = (attr) => {
    const keyMap = { dex: "dexterity", ins: "insight", mig: "might", wlp: "willpower" };
    const full = keyMap[attr] ?? attr;
    const cfgMap = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    };
    const [neg, pos] = cfgMap[full] ?? [[], []];
    return calculateAttribute(pc, pc?.attributes?.[full]?.base ?? 8, neg, pos, 6, 12);
  };

  const handleRollSpell = (spell) => {
    const acc = spell.accuracy ?? {};
    const dmg = spell.damage ?? {};
    const attr1 = acc.attr1 ?? "ins";
    const attr2 = acc.attr2 ?? "wlp";
    const intent = prepareMagicCheck({
      arg: spell.name || "",
      name: spell.name || "",
      attr1,
      attr2,
      accuracyBonus: acc.value ?? 0,
      baseDamage: dmg.value ?? 0,
      damageType: dmg.type ?? "physical",
      accuracyDefense: acc.defense ?? "mdef",
      damageHrZero: dmg.hrZero === true,
      spellType: spell.spellType,
    });
    const dieSizes = { primary: getAttrDie(attr1), secondary: getAttrDie(attr2) };
    const rolls = rollMagicCheck(dieSizes);
    const result = processMagicCheck(intent, rolls, dieSizes, pc?.info?.name || "");
    sendRollMessage(buildMagicCheckMessage(result));
  };

  const classesList = useMemo(() => {
    const base = pc.classes ?? [];
    const activeSpells = getActiveMnemosphereSkills(pc).spells;
    if (activeSpells.length === 0) return base;
    return [...base, { name: "Mnemosphere", spells: activeSpells }];
  }, [pc]);

  const handleEditSpell = (classIdx, spellIdx, spell) => {
    if (!canEdit) return;
    if (classIdx >= (pc.classes ?? []).length) return;
    openModal(spellTypeToModalName(spell.spellType), spell, classIdx, spellIdx);
  };

  const handleOpenSubModal = (modalName, classIdx, spellIdx, spell) => {
    if (!canEdit) return;
    if (classIdx >= (pc.classes ?? []).length) return;
    openModal(modalName, spell, classIdx, spellIdx);
  };

  const saveSpell = (maybeIndexOrSpell, maybeSpell) => {
    if (!onUpdate || editingSpellClass === null || editingSpellIndex === null)
      return;
    const targetIndex =
      maybeSpell !== undefined ? maybeIndexOrSpell : editingSpellIndex;
    const updatedSpell =
      maybeSpell !== undefined ? maybeSpell : maybeIndexOrSpell;
    if (typeof targetIndex !== "number" || !updatedSpell) return;
    onUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === editingSpellClass
          ? {
              ...cls,
              spells: cls.spells.map((spell, idx) =>
                idx === targetIndex ? updatedSpell : spell,
              ),
            }
          : cls,
      ),
    }));
    closeModal();
  };

  const deleteSpell = (spellIndex) => {
    if (!onUpdate || editingSpellClass === null) return;
    const targetIndex =
      typeof spellIndex === "number" ? spellIndex : editingSpellIndex;
    if (typeof targetIndex !== "number") return;
    onUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === editingSpellClass
          ? {
              ...cls,
              spells: cls.spells.filter((_, idx) => idx !== targetIndex),
            }
          : cls,
      ),
    }));
    closeModal();
  };

  const classesWithSpells = classesList.filter(
    (c) => c.spells && c.spells.length > 0,
  );
  if (classesWithSpells.length === 0) return null;

  return (
    <>
      <Grid container spacing={0}>
        {classesWithSpells.map((c, classIndex) => (
          <Grid key={classIndex} size={12}>
            <SectionCard
              title={t("Spells") + " - " + t(c.name)}
              noShadow={isCharacterSheet}
              sx={{ mb: "1em" }}
            >

              {c.spells
                .filter(
                  (spell) =>
                    spell.showInPlayerSheet ||
                    spell.showInPlayerSheet === undefined,
                )
                .map((spell, spellIndex) => {
                  const entry = spellDisplayRegistry[spell.spellType];
                  if (!entry) return null;
                  const { Component, buildProps } = entry;
                  const props = buildProps(spell, {
                    isEditMode: isInteractive,
                    onEdit: canEdit
                      ? () => handleEditSpell(classIndex, spellIndex, spell)
                      : undefined,
                    onEditSubModal: canEdit
                      ? (modalName) =>
                          handleOpenSubModal(
                            modalName,
                            classIndex,
                            spellIndex,
                            spell,
                          )
                      : undefined,
                  });
                  const needsWrapper =
                    spell.spellType === "arcanist" ||
                    spell.spellType === "arcanist-rework";
                  const isOffensive = spell.isOffensive === true;
                  const spellName = spell.name || "";
                  return (
                    <React.Fragment key={spellIndex}>
                      <Box sx={{ position: "relative" }}>
                        {needsWrapper ? (
                          <div style={{ marginTop: "0.5em", padding: "0.5em" }}>
                            <Component {...props} />
                          </div>
                        ) : (
                          <Component {...props} />
                        )}
                        <Box sx={{ position: "absolute", top: 4, right: 4 }}>
                          {isOffensive ? (
                            <Tooltip title={t("Roll")} arrow>
                              <IconButton size="small" sx={{ p: 0, width: 28, height: 28 }} onClick={() => handleRollSpell(spell)}>
                                <Casino sx={{ fontSize: "1.15rem" }} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title={t("Send to Chat")} arrow>
                              <IconButton size="small" sx={{ p: 0, width: 28, height: 28 }} onClick={() => sendDisplayMessage("spell", spellName, { speaker: pc?.info?.name || "", description: spell.description || undefined })}>
                                <Message sx={{ fontSize: "1.15rem" }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </React.Fragment>
                  );
                })}
            </SectionCard>
          </Grid>
        ))}
      </Grid>

      {/* Modal layer - only rendered when interactive and a spell is being edited */}
      {canEdit &&
        spellBeingEdited &&
        currentModal &&
        (() => {
          const entry = spellModalRegistry[currentModal];
          if (!entry) return null;
          const { Component, buildProps } = entry;
          const props = buildProps(spellBeingEdited, editingSpellIndex, {
            isEditMode: isInteractive,
            onSave: saveSpell,
            onDelete: deleteSpell,
            onClose: closeModal,
          });
          return <Component {...props} />;
        })()}
    </>
  );
}
