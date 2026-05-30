import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Casino,
  Message,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { OpenBracket, CloseBracket } from "../../../../Bracket";
import { Martial } from "../../../../icons";
import NotesMarkdown from "../../../../common/NotesMarkdown";
import { useTranslate } from "../../../../../translation/translate";
import { useCustomTheme } from "../../../../../hooks/useCustomTheme";
import { availableFrames } from "../../../../../libs/pilotVehicleData";
import attributes from "../../../../../libs/attributes";
import types from "../../../../../libs/types";
import { getPilotSpellInfo } from "../../../../../libs/player/slots/loadoutSelectors";
import { calculateAttribute } from "../../../../../libs/playerCalculations";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../../../../app-drawer/panels/chat/domain/accuracy-checks";
import {
  sendRollMessage,
  sendDisplayMessage,
} from "../../../../../hooks/useRollToChat";
import { SharedPilotVehicleCard } from "../../../../shared/items";
import CompactSectionHeader from "../CompactSectionHeader";

const CUSTOM_MODULE_NAMES = new Set([
  "pilot_custom_weapon",
  "pilot_custom_armor",
  "pilot_custom_support",
]);

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const q = query?.trim();
  if (!q) return source;
  return source
    .split(new RegExp(`(${escapeRegExp(q)})`, "ig"))
    .map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} style={{ backgroundColor: "yellow", padding: 0 }}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const q = query?.trim();
  if (!q) return source;
  return source.replace(
    new RegExp(`(${escapeRegExp(q)})`, "ig"),
    "<mark>$1</mark>",
  );
}

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

function Subtitle({ m, t }) {
  if (m.type === "pilot_module_weapon") {
    const acc = m.accuracy ?? {};
    const dmg = m.damage ?? {};
    const attr1 = String(acc.attr1 ?? "dexterity").toLowerCase();
    const attr2 = String(acc.attr2 ?? "might").toLowerCase();
    const prec = acc.value ?? 0;
    const dmgVal = dmg.value ?? 0;
    const dmgType = dmg.type ?? "physical";
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
          fontWeight: "bold",
        }}
      >
        <OpenBracket />
        {attributes[attr1]?.shortcaps ?? attr1.slice(0, 3).toUpperCase()}+
        {attributes[attr2]?.shortcaps ?? attr2.slice(0, 3).toUpperCase()}
        <CloseBracket />
        {prec !== 0 ? (prec > 0 ? `+${prec}` : prec) : ""}
        {"  "}
        <OpenBracket />
        {t("HR")}
        {dmgVal >= 0 ? "+" : ""}
        {dmgVal}
        <CloseBracket />{" "}
        {types[dmgType.toLowerCase()]?.long ?? types.physical.long}
      </Typography>
    );
  }
  if (m.type === "pilot_module_armor") {
    const def = m.def ?? 0;
    const mdef = m.mdef ?? 0;
    const defStr = m.martial
      ? String(def)
      : def === 0
        ? t("DEX die")
        : `${t("DEX die")} +${def}`;
    const mdefStr = mdef === 0 ? t("INS die") : `${t("INS die")} +${mdef}`;
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
          fontWeight: "bold",
        }}
      >
        {t("DEF")} {defStr}
        {" · "}
        {t("M.DEF")} {mdefStr}
      </Typography>
    );
  }
  if (m.type === "pilot_module_support") {
    return (
      <Typography
        sx={{
          fontSize: "0.68rem",
          color: "text.secondary",
          lineHeight: 1.3,
          mt: "1px",
        }}
      >
        {m.isComplex ? t("Complex") : t("Support")}
      </Typography>
    );
  }
  return null;
}

function ModuleCard({ m, searchQuery, theme, t, player, onPreview }) {
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

  const handleRoll = (e) => {
    e.stopPropagation();
    const acc = m.accuracy ?? {};
    const dmg = m.damage ?? {};
    const attr1 = normalizeAttr(acc.attr1);
    const attr2 = normalizeAttr(acc.attr2);
    const intent = prepareAccuracyCheck({
      arg: name,
      name,
      attr1,
      attr2,
      accuracyBonus: acc.value ?? 0,
      baseDamage: dmg.value ?? 0,
      damageType: dmg.type ?? "physical",
      accuracyDefense: acc.defense ?? "def",
      category: m.category,
      isWeaponModule: true,
      damageHrZero: dmg.hrZero === true,
      range: m.range === "Ranged" || m.range === "ranged" ? "ranged" : "melee",
    });
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

  const handleChat = (e) => {
    e.stopPropagation();
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

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: `${theme.panelRadius}px`,
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": { borderColor: theme.primary },
        transition: "border-color 0.15s ease",
        bgcolor: "inherit",
      }}
      onClick={() => (desc ? setDescOpen((v) => !v) : onPreview(m))}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          px: "6px",
          py: "4px",
        }}
      >
        {/* Name + subtitle */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            <Typography
              noWrap
              sx={{ fontWeight: "bold", fontSize: "0.72rem", lineHeight: 1.3 }}
            >
              {highlightMatch(name, searchQuery)}
            </Typography>
            {m.martial && <Martial />}
          </Box>
          <Subtitle m={m} t={t} />
        </Box>

        {/* Category label for weapons */}
        {isWeapon && m.category && (
          <Typography
            sx={{
              fontSize: "0.62rem",
              color: "text.secondary",
              flexShrink: 0,
              textAlign: "right",
              mr: 0.25,
            }}
          >
            {highlightMatch(t(m.category), searchQuery)}
          </Typography>
        )}

        {/* Action buttons */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            width: "28px",
            minWidth: "28px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isWeapon ? (
            <Tooltip title={t("Roll")} arrow>
              <IconButton
                size="small"
                sx={{ p: 0, width: 28, height: 28 }}
                onClick={handleRoll}
              >
                <Casino sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t("Send to Chat")} arrow>
              <IconButton
                size="small"
                sx={{ p: 0, width: 28, height: 28 }}
                onClick={handleChat}
              >
                <Message sx={{ fontSize: "1.15rem" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Description - collapsed by default */}
      {desc && (descOpen || !!searchQuery?.trim()) && (
        <Box
          sx={{
            px: "8px",
            py: "4px",
            fontSize: "0.65rem",
            color: "text.secondary",
            lineHeight: 1.4,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(0,0,0,0.03)",
          }}
        >
          <NotesMarkdown compact fontSize="0.65rem">
            {highlightMarkdownText(desc, searchQuery)}
          </NotesMarkdown>
        </Box>
      )}
    </Box>
  );
}

function SectionHeader({ label, collapsed, onToggle }) {
  return (
    <CompactSectionHeader title={label}>
      <IconButton
        size="small"
        onClick={onToggle}
        sx={{ color: "#fff", p: "2px" }}
      >
        {collapsed ? (
          <KeyboardArrowDown sx={{ fontSize: "1.15rem" }} />
        ) : (
          <KeyboardArrowUp sx={{ fontSize: "1.15rem" }} />
        )}
      </IconButton>
    </CompactSectionHeader>
  );
}

export default function SpellVehiclePanel({ player, searchQuery = "" }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const [previewModule, setPreviewModule] = useState(null);
  const [armorCollapsed, setArmorCollapsed] = useState(true);
  const [weaponCollapsed, setWeaponCollapsed] = useState(true);
  const [supportCollapsed, setSupportCollapsed] = useState(true);

  const pilotInfo = getPilotSpellInfo(player);
  if (!pilotInfo) return null;

  const vehicles =
    pilotInfo.spell.vehicles ?? pilotInfo.spell.currentVehicles ?? [];
  const activeVehicle = Array.isArray(vehicles)
    ? vehicles.find((v) => v.enabled)
    : null;
  if (!activeVehicle) return null;

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

  if (!armorModules.length && !weaponModules.length && !supportModules.length)
    return null;

  const frame = availableFrames.find(
    (f) => f.name === (activeVehicle.frame || "pilot_frame_exoskeleton"),
  );

  const renderGrid = (mods) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: "4px",
        p: "4px",
      }}
    >
      {mods.map((m, i) => (
        <ModuleCard
          key={i}
          m={m}
          searchQuery={searchQuery}
          theme={theme}
          t={t}
          player={player}
          onPreview={setPreviewModule}
        />
      ))}
    </Box>
  );

  return (
    <>
      <Paper
        sx={{ mb: 1, overflow: "hidden" }}
        elevation={0}
        variant="outlined"
      >
        {/* Frame info */}
        <Box
          sx={{
            backgroundImage: `linear-gradient(to right, ${theme.ternary}, transparent)`,
            px: "8px",
            py: "3px",
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

        {armorModules.length > 0 && (
          <>
            <SectionHeader
              label={t("Armor Modules")}
              collapsed={armorCollapsed}
              onToggle={() => setArmorCollapsed((v) => !v)}
            />
            {!armorCollapsed && renderGrid(armorModules)}
          </>
        )}

        {weaponModules.length > 0 && (
          <>
            <SectionHeader
              label={t("Weapon Modules")}
              collapsed={weaponCollapsed}
              onToggle={() => setWeaponCollapsed((v) => !v)}
            />
            {!weaponCollapsed && renderGrid(weaponModules)}
          </>
        )}

        {supportModules.length > 0 && (
          <>
            <SectionHeader
              label={t("Support Modules")}
              collapsed={supportCollapsed}
              onToggle={() => setSupportCollapsed((v) => !v)}
            />
            {!supportCollapsed && renderGrid(supportModules)}
          </>
        )}
      </Paper>

      {/* Preview dialog */}
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
    </>
  );
}
