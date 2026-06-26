import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import ItemRowCard from "/src/components/shared/common/ItemRowCard";
import { useTranslate } from "/src/translation/translate";
import { Casino, Message, Edit } from "@mui/icons-material";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import { availableFrames } from "/src/libs/pilotVehicleData";
import { SpellPilotVehiclesModal } from "/src/components/shared/actors/pc/editors";
import { calculateAttribute } from "/src/libs/playerCalculations";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import {
  accuracyModifiersFromEffects,
  outgoingDamageBonusFromEffects,
} from "/src/components/app-drawer/panels/chat/domain/effect-modifiers";
import { sendRollMessage, sendDisplayMessage } from "/src/hooks/useRollToChat";
import { Martial } from "/src/components/icons";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import { SharedPilotVehicleCard } from "/src/components/shared/items";
import ItemStatSubtitle from "/src/components/shared/actors/common/ItemStatSubtitle";

const CUSTOM_MODULE_NAMES = new Set([
  "pilot_custom_weapon",
  "pilot_custom_armor",
  "pilot_custom_support",
]);

function getModuleName(m, t) {
  const name = m.name ?? m.key ?? "";
  if (CUSTOM_MODULE_NAMES.has(name)) return m.customName || t("pilot_custom");
  return t(name);
}

function getModuleDescription(m, t) {
  const name = m.name ?? m.key ?? "";
  if (CUSTOM_MODULE_NAMES.has(name)) return m.description || "";
  return t(m.description || "");
}

function normalizeAttr(raw) {
  const k = String(raw ?? "").toLowerCase();
  if (k === "dex" || k === "dexterity") return "dexterity";
  if (k === "ins" || k === "insight") return "insight";
  if (k === "mig" || k === "might") return "might";
  if (k === "wlp" || k === "will" || k === "willpower") return "willpower";
  return "dexterity";
}

function moduleToSubtitleItem(m) {
  if (m.type === "pilot_module_weapon") {
    return {
      equipType: "weapon",
      accuracy: m.accuracy ?? {},
      damage: m.damage ?? {},
      martial: m.martial,
    };
  }
  if (m.type === "pilot_module_armor") {
    return {
      equipType: "armor",
      def: m.def ?? 0,
      mdef: m.mdef ?? 0,
      martial: m.martial,
    };
  }
  return null;
}

function ModuleCard({ m, t, player, onPreview }) {
  const [descOpen, setDescOpen] = useState(false);
  const name = getModuleName(m, t);
  const desc = getModuleDescription(m, t);
  const isWeapon = m.type === "pilot_module_weapon" && !m.isShield;

  const getAttrDie = (key) => {
    const normKey = normalizeAttr(key);
    const base = player?.attributes?.[normKey]?.base ?? 8;
    const cfg = {
      dexterity: [["slow", "enraged"], ["dexUp"]],
      insight: [["dazed", "enraged"], ["insUp"]],
      might: [["weak", "poisoned"], ["migUp"]],
      willpower: [["shaken", "poisoned"], ["wlpUp"]],
    }[normKey] ?? [[], []];
    return calculateAttribute(player, base, cfg[0], cfg[1], 6, 12);
  };

  const handleRoll = () => {
    const acc = m.accuracy ?? {};
    const dmg = m.damage ?? {};
    const attr1 = normalizeAttr(acc.attr1);
    const attr2 = normalizeAttr(acc.attr2);
    const range =
      m.range === "Ranged" || m.range === "ranged" ? "ranged" : "melee";
    const damageType = dmg.type ?? "physical";
    const effectModifiers = accuracyModifiersFromEffects(player, {
      range,
      category: m.category,
    });
    const damageOutgoingBonus = outgoingDamageBonusFromEffects(player, {
      range,
      category: m.category,
      damageType,
    });
    const intent = prepareAccuracyCheck(
      {
        arg: name,
        name,
        attr1,
        attr2,
        accuracyBonus: acc.value ?? 0,
        baseDamage: dmg.value ?? 0,
        damageType,
        accuracyDefense: acc.defense ?? "def",
        category: m.category,
        isWeaponModule: true,
        damageHrZero: dmg.hrZero === true,
        range,
      },
      effectModifiers,
      { damageOutgoingBonus },
    );
    const dieSizes = {
      primary: getAttrDie(attr1),
      secondary: getAttrDie(attr2),
    };
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(
      intent,
      rolls,
      dieSizes,
      player?.info?.name || player?.name || "",
    );
    sendRollMessage(buildAccuracyCheckMessage(result));
  };

  const handleChat = () => {
    const tags = [];
    if (m.type === "pilot_module_armor") {
      tags.push(
        `${t("DEF")}: ${m.martial ? m.def : m.def === 0 ? t("DEX die") : `${t("DEX die")} +${m.def}`}`,
      );
      tags.push(
        `${t("M.DEF")}: ${(m.mdef ?? 0) === 0 ? t("INS die") : `${t("INS die")} +${m.mdef}`}`,
      );
    } else {
      tags.push(t("Support Module"));
    }
    sendDisplayMessage("item", name, {
      speaker: player?.info?.name || player?.name || "",
      tags,
      description: desc || undefined,
    });
  };

  const labelNode = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
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
        {name}
      </Typography>
      {m.martial && <Martial />}
      {isWeapon && m.category && (
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "text.secondary",
            ml: "auto",
            pl: 1,
            flexShrink: 0,
          }}
        >
          {t(m.category)}
        </Typography>
      )}
    </Box>
  );

  return (
    <ItemRowCard
      label={labelNode}
      onCardClick={() => (desc ? setDescOpen((v) => !v) : onPreview(m))}
      subtitle={
        moduleToSubtitleItem(m) ? (
          <ItemStatSubtitle item={moduleToSubtitleItem(m)} />
        ) : m.type === "pilot_module_support" ? (
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: "text.secondary",
              lineHeight: 1.3,
              fontWeight: "bold",
            }}
          >
            {m.isComplex ? t("Complex") : t("Support")}
          </Typography>
        ) : null
      }
      actions={
        isWeapon ? (
          <Tooltip title={t("Roll")} arrow>
            <IconButton size="small" onClick={handleRoll}>
              <Casino />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t("Send to Chat")} arrow>
            <IconButton size="small" onClick={handleChat}>
              <Message />
            </IconButton>
          </Tooltip>
        )
      }
    >
      {desc && descOpen && (
        <Box
          sx={{
            px: "10px",
            py: "5px",
            fontSize: "0.72rem",
            color: "text.secondary",
            lineHeight: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <NotesMarkdown compact fontSize="0.72rem">
            {desc}
          </NotesMarkdown>
        </Box>
      )}
    </ItemRowCard>
  );
}

export default function PlayerVehicle({
  player,
  setPlayer,
  _isCharacterSheet,
}) {
  const { t } = useTranslate();
  const custom = useCustomTheme();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [previewModule, setPreviewModule] = useState(null);

  const pilotSpells = (player.classes || [])
    .flatMap((c, classIndex) =>
      (c.spells || []).map((s, spellIndex) => ({
        ...s,
        classIndex,
        spellIndex,
      })),
    )
    .filter(
      (spell) =>
        spell &&
        spell.spellType === "pilot-vehicle" &&
        (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined),
    );

  const activePilotSpell =
    pilotSpells.find((s) => (s.vehicles || []).some((v) => v.enabled)) ||
    pilotSpells[0];

  if (!activePilotSpell) return null;

  const handleSaveVehicles = (spellIndex, updatedPilot) => {
    setPlayer?.((prev) => {
      const updatedClasses = [...prev.classes];
      updatedClasses[activePilotSpell.classIndex].spells[
        activePilotSpell.spellIndex
      ] = {
        ...updatedClasses[activePilotSpell.classIndex].spells[
          activePilotSpell.spellIndex
        ],
        vehicles: updatedPilot.vehicles,
        showInPlayerSheet: updatedPilot.showInPlayerSheet,
      };
      return { ...prev, classes: updatedClasses };
    });
    setOpenEditModal(false);
  };

  const activeVehicle =
    activePilotSpell.vehicles?.find((v) => v.enabled) ?? null;

  if (!activeVehicle) {
    return (
      <SectionCard
        title={t("pilot_vehicle")}
        actions={
          setPlayer ? (
            <Tooltip title={t("Edit Vehicle")}>
              <IconButton
                size="small"
                onClick={() => setOpenEditModal(true)}
                sx={{ color: "#fff" }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null
        }
        noShadow
        sx={{ mb: "1em" }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            p: 1.5,
            color: "text.disabled",
            fontStyle: "italic",
          }}
        >
          {t("No vehicle active")}
        </Typography>
        <SpellPilotVehiclesModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSave={handleSaveVehicles}
          pilot={activePilotSpell}
        />
      </SectionCard>
    );
  }

  const slots = activeVehicle.slots ?? {
    main: null,
    off: null,
    armor: null,
    support: [],
  };
  const equippedKeys = new Set(
    [slots.main, slots.off, slots.armor, ...(slots.support ?? [])].filter(
      Boolean,
    ),
  );

  const modules = (activeVehicle.modules ?? []).filter((m) => {
    const key = m.key ?? m.name;
    return key && equippedKeys.has(key);
  });

  const armorModules = modules.filter((m) => m.type === "pilot_module_armor");
  const weaponModules = modules.filter((m) => m.type === "pilot_module_weapon");
  const supportModules = modules.filter(
    (m) => m.type === "pilot_module_support",
  );

  const frame = availableFrames.find(
    (f) => f.name === (activeVehicle.frame || "pilot_frame_exoskeleton"),
  );

  const titleActions = setPlayer ? (
    <Tooltip title={t("Edit Vehicle")}>
      <IconButton
        size="small"
        onClick={() => setOpenEditModal(true)}
        sx={{ color: "#fff" }}
      >
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  return (
    <>
      <SectionCard
        title={t("pilot_vehicle")}
        actions={titleActions}
        noShadow
        sx={{ mb: "1em" }}
      >
        {/* Frame info bar */}
        <Box
          sx={{
            backgroundImage: `linear-gradient(to right, ${custom.ternary}, transparent)`,
            px: "10px",
            py: "4px",
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {frame ? (
            <>
              <Typography variant="caption">
                <strong>{t("pilot_vehicles_frame")}:</strong> {t(frame.name)}
              </Typography>
              <Typography variant="caption">
                <strong>{t("pilot_passengers")}:</strong>{" "}
                {frame.passengers || t("None")}
              </Typography>
              <Typography variant="caption">
                <strong>{t("pilot_distance")}:</strong>{" "}
                {frame.distance > 1
                  ? `×${frame.distance}`
                  : t("pilot_distance_no_mod")}
              </Typography>
            </>
          ) : (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              {activeVehicle.customName || t("Vehicle")}
            </Typography>
          )}
        </Box>

        {/* Module grid */}
        {armorModules.length > 0 ||
        weaponModules.length > 0 ||
        supportModules.length > 0 ? (
          <Grid container spacing={1} sx={{ p: 1 }}>
            {[...armorModules, ...weaponModules, ...supportModules].map(
              (m, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6 }}>
                  <ModuleCard
                    m={m}
                    t={t}
                    player={player}
                    onPreview={setPreviewModule}
                  />
                </Grid>
              ),
            )}
          </Grid>
        ) : (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              p: 1.5,
              color: "text.disabled",
              fontStyle: "italic",
            }}
          >
            {t("No modules equipped")}
          </Typography>
        )}
      </SectionCard>

      {/* Module preview dialog */}
      <Dialog
        open={Boolean(previewModule)}
        onClose={() => setPreviewModule(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{ p: 0 }}>
          {previewModule && (
            <SharedPilotVehicleCard
              item={{
                ...previewModule,
                name: getModuleName(previewModule, t),
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewModule(null)}
            variant="contained"
            color="primary"
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>

      <SpellPilotVehiclesModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onSave={handleSaveVehicles}
        pilot={activePilotSpell}
      />
    </>
  );
}
