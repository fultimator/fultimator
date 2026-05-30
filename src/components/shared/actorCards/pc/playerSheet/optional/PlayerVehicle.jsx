import React, { useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Box,
} from "@mui/material";
import SectionCard from "../../../common/SectionCard";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "../../../../../../translation/translate";
import { Casino, Message } from "@mui/icons-material";
import { useCustomTheme } from "../../../../../../hooks/useCustomTheme";
import { availableFrames } from "../../../../../../libs/pilotVehicleData";
import SpellPilotVehiclesModal from "../../../../../player/spells/SpellPilotVehiclesModal";
import { calculateAttribute } from "../../../../../player/common/playerCalculations";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../../../../../app-drawer/panels/chat/domain/accuracy-checks";
import { sendRollMessage, sendDisplayMessage } from "../../../../../../hooks/useRollToChat";

function ModuleRow({ name, onChat, onRoll, t }) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  return (
    <Box sx={{ overflow: "hidden", display: "flex", alignItems: "stretch", minHeight: 44, borderRadius: "4px", border: "1px solid", borderColor: "divider" }}>
      <Typography
        noWrap
        sx={{
          fontFamily: "Antonio",
          fontWeight: 800,
          fontSize: { xs: "0.9rem", sm: "0.95rem" },
          textTransform: "uppercase",
          flex: 1,
          px: 1,
          display: "flex",
          alignItems: "center",
          color: "text.primary",
        }}
      >
        {name}
      </Typography>
      <Box sx={{ bgcolor: primary, display: "flex", alignItems: "center", alignSelf: "stretch", px: 1, gap: 0.25 }}>
        {onRoll ? (
          <Tooltip title={t("Roll")}>
            <IconButton size="small" onClick={onRoll} sx={{ p: 0.5, color: "#fff" }}>
              <Casino fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t("Send to Chat")}>
            <IconButton size="small" onClick={onChat} sx={{ p: 0.5, color: "#fff" }}>
              <Message fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export default function PlayerVehicle({ player, setPlayer, isCharacterSheet }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const custom = useCustomTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  const [openEditModal, setOpenEditModal] = useState(false);

  // Find all pilot-vehicle spells
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

  // Find the spell with enabled vehicle (for display), or use first pilot spell (for editing)
  const activePilotSpell =
    pilotSpells.find((s) => (s.vehicles || []).some((v) => v.enabled)) ||
    pilotSpells[0];

  if (!activePilotSpell) {
    return null;
  }

  const activeVehicle =
    activePilotSpell.vehicles.find((v) => v.enabled) ||
    activePilotSpell.vehicles?.[0];

  if (!activeVehicle) {
    return null;
  }

  const frame = availableFrames.find(
    (f) => f.name === (activeVehicle.frame || "pilot_frame_exoskeleton"),
  );

  const equippedModules = activeVehicle.modules
    ? activeVehicle.modules.filter((m) => m.equipped)
    : [];

  const armorModules = equippedModules.filter(
    (m) => m.type === "pilot_module_armor",
  );
  const weaponModules = equippedModules.filter(
    (m) => m.type === "pilot_module_weapon",
  );
  const supportModules = equippedModules.filter(
    (m) => m.type === "pilot_module_support",
  );

  const currDex = calculateAttribute(
    player,
    player.attributes.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    player,
    player.attributes.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    player,
    player.attributes.might?.base,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    player,
    player.attributes.willpower?.base,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  const attrDieMap = {
    dexterity: currDex,
    insight: currInsight,
    might: currMight,
    willpower: currWillpower,
  };

  const handleDiceRoll = (module) => {
    const acc = module.accuracy || {};
    const dmg = module.damage || {};
    const attr1 = acc.attr1 || "dexterity";
    const attr2 = acc.attr2 || "might";
    const name = module.name === "pilot_custom_weapon" ? module.customName : t(module.name);
    const intent = prepareAccuracyCheck({
      arg: name,
      name,
      attr1,
      attr2,
      accuracyBonus: acc.value ?? 0,
      baseDamage: dmg.value ?? 0,
      damageType: dmg.type ?? "physical",
      accuracyDefense: acc.defense ?? "def",
      category: module.category,
      isWeaponModule: true,
      damageHrZero: dmg.hrZero === true,
      range: module.range === "Ranged" || module.range === "ranged" ? "ranged" : "melee",
    });
    const dieSizes = {
      primary: attrDieMap[attr1] ?? 8,
      secondary: attrDieMap[attr2] ?? 8,
    };
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(intent, rolls, dieSizes, player?.info?.name || "");
    sendRollMessage(buildAccuracyCheckMessage(result));
  };

  const handleSaveVehicles = (spellIndex, updatedPilot) => {
    setPlayer((prevPlayer) => {
      const updatedClasses = [...prevPlayer.classes];
      const classIndex = activePilotSpell.classIndex;
      const spellInClassIndex = activePilotSpell.spellIndex;

      updatedClasses[classIndex].spells[spellInClassIndex] = {
        ...updatedClasses[classIndex].spells[spellInClassIndex],
        vehicles: updatedPilot.vehicles,
        showInPlayerSheet: updatedPilot.showInPlayerSheet,
      };

      return {
        ...prevPlayer,
        classes: updatedClasses,
      };
    });
    setOpenEditModal(false);
  };

  return (
    <>
      <Divider sx={{ my: 1 }} />
      <SectionCard title={t("pilot_vehicle")} noShadow>
        <Grid
          container
          spacing={1}
          sx={{ p: 0.75, flex: 1, width: "100%" }}
        >
          {frame && (
            <Grid size={{ xs: 12, md: 6 }}>
              <ModuleRow
                name={t(frame.name)}
                onChat={() => sendDisplayMessage("item", t(frame.name), { speaker: player?.info?.name || "" })}
                t={t}
              />
            </Grid>
          )}

          {armorModules.map((module, index) => {
            const name = module.name === "pilot_custom_armor" ? module.customName : t(module.name);
            return (
              <Grid key={`armor-${index}`} size={{ xs: 12, md: 6 }}>
                <ModuleRow
                  name={name}
                  onChat={() => sendDisplayMessage("item", name, { speaker: player?.info?.name || "" })}
                  t={t}
                />
              </Grid>
            );
          })}

          {weaponModules.map((module, index) => {
            const name = module.name === "pilot_custom_weapon" ? module.customName : t(module.name);
            return (
              <Grid key={`weapon-${index}`} size={{ xs: 12, md: 6 }}>
                <ModuleRow
                  name={name}
                  onChat={() => sendDisplayMessage("item", name, { speaker: player?.info?.name || "" })}
                  onRoll={() => handleDiceRoll(module)}
                  t={t}
                />
              </Grid>
            );
          })}

          {supportModules.map((module, index) => {
            const name = module.name === "pilot_custom_support" ? module.customName : t(module.name);
            return (
              <Grid key={`support-${index}`} size={{ xs: 12, md: 6 }}>
                <ModuleRow
                  name={name}
                  onChat={() => sendDisplayMessage("item", name, { speaker: player?.info?.name || "" })}
                  t={t}
                />
              </Grid>
            );
          })}
        </Grid>
        <SpellPilotVehiclesModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          onSave={handleSaveVehicles}
          pilot={activePilotSpell}
        />
      </SectionCard>
    </>
  );
}
