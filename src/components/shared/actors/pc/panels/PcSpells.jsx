import React, { useMemo } from "react";
import { Grid } from "@mui/material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import { useTranslate } from "/src/translation/translate";
import { useSpellModals } from "/src/hooks/useSpellModals";
import { getActiveMnemosphereSkills } from "/src/libs/player/slots/loadoutSelectors";
import spellDisplayRegistry from "/src/components/shared/actors/pc/spells/spellDisplayRegistry";
import spellModalRegistry, {
  spellTypeToModalName,
} from "/src/components/shared/actors/pc/spells/spellModalRegistry";
import classList from "/src/libs/classes";
import { createBlankSpellForType } from "/src/libs/player/createBlankSpell";
import { calculateAttribute } from "/src/libs/playerCalculations";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/magic-checks";
import {
  accuracyModifiersFromEffects,
  outgoingDamageBonusFromEffects,
} from "/src/components/app-drawer/panels/chat/domain/effect-modifiers";
import { sendRollMessage, sendDisplayMessage } from "/src/hooks/useRollToChat";

const SINGLETON_SPELL_TYPES = new Set([
  "tinkerer-alchemy",
  "tinkerer-infusion",
  "tinkerer-magitech",
  "magichant",
  "symbol",
  "dance",
  "gift",
  "therioform",
  "pilot-vehicle",
  "magiseed",
  "cooking",
  "invocation",
  "deck",
  "gamble",
]);

function getClassSpellTypes(cls) {
  const direct = Array.isArray(cls?.benefits?.spellClasses)
    ? cls.benefits.spellClasses
    : [];
  if (direct.length > 0) return direct;
  const base = classList.find((bc) => bc.name === cls?.name);
  return Array.isArray(base?.benefits?.spellClasses)
    ? base.benefits.spellClasses
    : [];
}

function stripTransientSpellFields(spell) {
  const { _spellIndex, _virtual, ...persistedSpell } = spell;
  return persistedSpell;
}

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

  const classesList = useMemo(() => {
    const base = pc.classes ?? [];
    const activeSpells = getActiveMnemosphereSkills(pc).spells;
    if (activeSpells.length === 0) return base;
    return [...base, { name: "Mnemosphere", spells: activeSpells }];
  }, [pc]);

  const handleUpdateSpell = (classIdx, spellIdx, updater) => {
    if (!onUpdate) return;
    if (classIdx >= (pc.classes ?? []).length) return;
    onUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === classIdx
          ? {
              ...cls,
              spells: cls.spells.map((s, idx) =>
                idx === spellIdx
                  ? typeof updater === "function"
                    ? updater(s)
                    : { ...s, ...updater }
                  : s,
              ),
            }
          : cls,
      ),
    }));
  };

  const handleUpdateSpellList = (classIdx, updater) => {
    if (!onUpdate) return;
    if (classIdx >= (pc.classes ?? []).length) return;
    onUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === classIdx
          ? {
              ...cls,
              spells:
                typeof updater === "function"
                  ? updater(cls.spells || [])
                  : updater,
            }
          : cls,
      ),
    }));
  };

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

  const normalizeAttr = (raw) => {
    const k = String(raw ?? "").toLowerCase();
    if (k === "dex" || k === "dexterity") return "dexterity";
    if (k === "ins" || k === "insight") return "insight";
    if (k === "mig" || k === "might") return "might";
    if (k === "wlp" || k === "will" || k === "willpower") return "willpower";
    return "dexterity";
  };

  const getAttrDie = (key) => {
    const normKey = normalizeAttr(key);
    const base = pc?.attributes?.[normKey]?.base ?? 8;
    const cfg = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    }[normKey] ?? [[], []];
    return calculateAttribute(pc, base, cfg[0], cfg[1], 6, 12);
  };

  const buildSpellTags = (spell) => {
    const tags = [];
    if (spell.cost?.amount != null) {
      tags.push(
        `${spell.cost.amount}${spell.cost.perTarget && spell.maxTargets !== 1 ? " × T" : ""} MP`,
      );
    }
    if (spell.targetDescription) tags.push(spell.targetDescription);
    if (spell.duration) tags.push(spell.duration);
    return tags;
  };

  const handleRollSpell = (spell) => {
    if (!spell.isOffensive) return;
    const attr1 = normalizeAttr(spell.accuracy?.attr1);
    const attr2 = normalizeAttr(spell.accuracy?.attr2);
    const damageType = spell.damage?.type ?? "physical";
    const magicModifiers = pc
      ? accuracyModifiersFromEffects(pc, { checkType: "magic" })
      : [];
    const damageOutgoingBonus = pc
      ? outgoingDamageBonusFromEffects(pc, { range: "spell", damageType })
      : 0;
    const intent = prepareMagicCheck(
      {
        name: spell.name,
        spellType: spell.spellType,
        attr1,
        attr2,
        accuracyBonus: spell.accuracy?.value ?? 0,
        baseDamage: spell.damage?.value ?? 0,
        damageType,
        accuracyDefense: spell.accuracy?.defense ?? "mdef",
        damageHrZero: spell.damage?.hrZero === true,
        description: spell.description,
        extraTags: buildSpellTags(spell),
      },
      magicModifiers,
      { damageOutgoingBonus },
    );
    const dieSizes = {
      primary: getAttrDie(attr1),
      secondary: getAttrDie(attr2),
    };
    const rolls = rollMagicCheck(dieSizes);
    const result = processMagicCheck(
      intent,
      rolls,
      dieSizes,
      pc?.info?.name || pc?.name || "",
    );
    sendRollMessage(buildMagicCheckMessage(result));
  };

  const handleRollInvocation = (spell, invocation) => {
    const attr1 = normalizeAttr("mig");
    const attr2 = normalizeAttr("wlp");
    const intent = prepareMagicCheck({
      name: invocation.name,
      spellType: "invocation",
      attr1,
      attr2,
      accuracyBonus: spell.accuracy?.value ?? 0,
      baseDamage: 0,
      damageType: "physical",
      accuracyDefense: "mdef",
      damageHrZero: false,
      description: invocation.effect,
      extraTags: [],
    });
    const dieSizes = {
      primary: getAttrDie(attr1),
      secondary: getAttrDie(attr2),
    };
    const rolls = rollMagicCheck(dieSizes);
    const result = processMagicCheck(
      intent,
      rolls,
      dieSizes,
      pc?.info?.name || pc?.name || "",
    );
    sendRollMessage(buildMagicCheckMessage(result));
  };

  const handleRollMagiseed = (currentMagiseed, growthClock) => {
    const seedKey = currentMagiseed.key ?? currentMagiseed.name ?? "";
    const seedName = currentMagiseed.customName || t(seedKey);
    const effectRaw =
      currentMagiseed.effects?.[growthClock] ??
      currentMagiseed.effects?.[String(growthClock)] ??
      "";
    const effectText = t(effectRaw);
    sendDisplayMessage("spell", seedName, {
      tags: [`T = ${growthClock}`],
      description: effectText,
      speaker: pc?.info?.name || pc?.name || "",
    });
  };

  const handleChatSpell = (spell) => {
    sendDisplayMessage("spell", spell.name || "", {
      tags: buildSpellTags(spell),
      description: spell.description,
      speaker: pc?.info?.name || pc?.name || "",
    });
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

  const handleEditVirtualSpell = (realClassIdx, spellType) => {
    if (!canEdit) return;
    if (realClassIdx >= (pc.classes ?? []).length) return;
    const newSpell = createBlankSpellForType(spellType);
    const existingSpells = pc.classes[realClassIdx].spells ?? [];
    const newSpellIndex = existingSpells.length;
    onUpdate((prev) => ({
      ...prev,
      classes: prev.classes.map((c, i) =>
        i === realClassIdx
          ? { ...c, spells: [...(c.spells ?? []), newSpell] }
          : c,
      ),
    }));
    openModal(
      spellTypeToModalName(spellType),
      newSpell,
      realClassIdx,
      newSpellIndex,
    );
  };

  // Build the list of classes to show, augmenting with virtual singleton spells
  // for classes that have a singleton spell type but haven't created the spell yet.
  // Each entry includes realClassIdx so handlers can target pc.classes directly.
  const classesWithSpells = useMemo(() => {
    return classesList
      .map((c, idx) => {
        const realClassIdx = idx < (pc.classes ?? []).length ? idx : null;
        const existingSpells = c.spells ?? [];
        const indexedSpells = existingSpells.map((spell, spellIndex) => ({
          ...spell,
          _spellIndex: spellIndex,
        }));
        const spellTypes = getClassSpellTypes(c);
        const missingSingletons = spellTypes
          .filter(
            (st) =>
              SINGLETON_SPELL_TYPES.has(st) &&
              !existingSpells.some((s) => s.spellType === st) &&
              spellDisplayRegistry[st],
          )
          .map((st) => ({ spellType: st, _virtual: true }));
        const allSpells = [...indexedSpells, ...missingSingletons];
        const visibleSpells = allSpells.filter(
          (s) =>
            s._virtual ||
            s.showInPlayerSheet ||
            s.showInPlayerSheet === undefined,
        );
        return visibleSpells.length > 0
          ? { ...c, spells: visibleSpells, realClassIdx }
          : null;
      })
      .filter(Boolean);
  }, [classesList, pc.classes]);

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
              {c.spells.map((spell, spellIndex) => {
                const entry = spellDisplayRegistry[spell.spellType];
                if (!entry) return null;
                const isVirtual = spell._virtual === true;
                const { realClassIdx } = c;
                const realSpellIndex = spell._spellIndex ?? spellIndex;
                const displaySpell = isVirtual
                  ? spell
                  : stripTransientSpellFields(spell);
                const { Component, buildProps } = entry;
                const props = buildProps(displaySpell, {
                  isEditMode: isInteractive && !isVirtual,
                  speaker: pc?.info?.name || pc?.name || "",
                  onEdit: canEdit
                    ? isVirtual
                      ? realClassIdx !== null
                        ? () =>
                            handleEditVirtualSpell(
                              realClassIdx,
                              spell.spellType,
                            )
                        : undefined
                      : () =>
                          handleEditSpell(
                            realClassIdx ?? classIndex,
                            realSpellIndex,
                            displaySpell,
                          )
                    : undefined,
                  onRoll:
                    spell.spellType === "default" && spell.isOffensive
                      ? () => handleRollSpell(displaySpell)
                      : spell.spellType === "invocation"
                        ? (invocation) =>
                            handleRollInvocation(displaySpell, invocation)
                        : spell.spellType === "magiseed"
                          ? (currentMagiseed, growthClock) =>
                              handleRollMagiseed(currentMagiseed, growthClock)
                          : undefined,
                  onChat:
                    spell.spellType === "default"
                      ? () => handleChatSpell(displaySpell)
                      : undefined,
                  onEditSubModal:
                    canEdit && !isVirtual
                      ? (modalName) =>
                          handleOpenSubModal(
                            modalName,
                            realClassIdx ?? classIndex,
                            realSpellIndex,
                            displaySpell,
                          )
                      : undefined,
                  onSpellUpdate: !isVirtual
                    ? (updater) =>
                        handleUpdateSpell(
                          realClassIdx ?? classIndex,
                          realSpellIndex,
                          updater,
                        )
                    : undefined,
                  onSpellListUpdate:
                    canEdit && !isVirtual
                      ? (updater) =>
                          handleUpdateSpellList(
                            realClassIdx ?? classIndex,
                            updater,
                          )
                      : undefined,
                  spellIndex: realSpellIndex,
                });
                return (
                  <React.Fragment key={spellIndex}>
                    <Component {...props} />
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
