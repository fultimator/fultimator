import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { useActorCardSetup, isInteractive } from "../core-utils";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import { SpellIcon, OffensiveSpellIcon } from "../../../icons";
import attributes from "../../../../libs/attributes";
import { calcMagic } from "../../../../libs/npcs";
import { useChatMessagesStore } from "../../../../store/chatMessagesStore";
import {
  prepareMagicCheck,
  rollMagicCheck,
  processMagicCheck,
  buildMagicCheckMessage,
} from "../../../app-drawer/panels/chat/domain/magic-checks";
import { StyledMarkdown, ClickableName, ATTR_SHORT } from "./shared";

function SpellRow({ spell, npc, showRoll }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const isOffensive = spell.isOffensive === true || spell.type === "offensive";
  const spellAccuracyBonus = spell.accuracy?.value ?? 0;

  const handleAction = (e) => {
    e.stopPropagation();
    if (!isOffensive) {
      const mpCost =
        spell.cost?.amount != null
          ? `${spell.cost.amount}${spell.cost.perTarget && spell.maxTargets !== 1 ? " × T" : ""} MP`
          : null;
      const tags = [mpCost, spell.targetDescription, spell.duration].filter(
        Boolean,
      );
      const description = spell.effect || "";
      addMessage({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        speaker: npc.name || "NPC",
        kind: "display",
        itemType: "spell",
        name: spell.name,
        tags,
        description,
      });
      return;
    }
    const attr1Short = ATTR_SHORT[spell.accuracy?.attr1] ?? "ins";
    const attr2Short = ATTR_SHORT[spell.accuracy?.attr2] ?? "wlp";
    const dieSizes = {
      primary: npc.attributes?.[spell.accuracy?.attr1]?.base ?? 6,
      secondary: npc.attributes?.[spell.accuracy?.attr2]?.base ?? 6,
    };
    const intent = prepareMagicCheck({
      attr1: attr1Short,
      attr2: attr2Short,
      accuracyBonus: spellAccuracyBonus,
      name: spell.name,
      baseDamage: spell.damage?.value ?? 0,
      damageType: spell.damage?.type ?? "physical",
      accuracyDefense: "mdef",
      damageHrZero: spell.damage?.hrZero === true,
      spellType: spell.spellType ?? "npc",
    });
    const rolls = rollMagicCheck(dieSizes);
    const result = processMagicCheck(
      intent,
      rolls,
      dieSizes,
      npc.name || "NPC",
    );
    addMessage(buildMagicCheckMessage(result));
  };

  return (
    <Fragment>
      <Grid sx={{ px: 1, py: 0.5 }} size={1}>
        <Typography sx={{ textAlign: "center" }}>
          <SpellIcon />
        </Typography>
      </Grid>
      <Grid sx={{ px: 1, py: 0.5 }} size={11}>
        <Typography component="div">
          {showRoll ? (
            <ClickableName name={spell.name} onAction={handleAction} />
          ) : (
            <strong>{spell.name}</strong>
          )}{" "}
          {isOffensive && <OffensiveSpellIcon />} <Diamond />{" "}
          <strong>
            {isOffensive && (
              <>
                <OpenBracket />
                {attributes[spell.accuracy?.attr1]?.shortcaps}
                {" + "}
                {attributes[spell.accuracy?.attr2]?.shortcaps}
                <CloseBracket />
                {spellAccuracyBonus > 0 && `+${spellAccuracyBonus}`}
                {spellAccuracyBonus < 0 && `${spellAccuracyBonus}`}
                {calcMagic(npc) > 0 && `+${calcMagic(npc)}`} <Diamond />
                <OpenBracket />
                HR +{" "}
                {(typeof spell.damage === "object"
                  ? spell.damage?.value
                  : spell.damage) || 0}
                <CloseBracket />{" "}
                {spell.damage?.type ? t(spell.damage.type) : "physical"}
                <Diamond />
              </>
            )}{" "}
            {spell.cost?.amount}
            {spell.cost?.perTarget && spell.maxTargets !== 1
              ? ` × ${t("T")}`
              : ""}{" "}
            MP <Diamond /> {spell.targetDescription} <Diamond />{" "}
            {spell.duration}
          </strong>
          <br />
          <Typography component="span">
            <StyledMarkdown>{spell.effect}</StyledMarkdown>
          </Typography>
        </Typography>
      </Grid>
    </Fragment>
  );
}

export function NpcSpells({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  if (!npc.spells?.length) return null;

  return (
    <Grid container>
      <Grid sx={{ px: 2, py: 0.3, background }} size={12}>
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            fontWeight: "medium",
            textTransform: "uppercase",
          }}
        >
          {t("Spells")}
        </Typography>
      </Grid>
      {npc.spells.map((spell, i) => (
        <SpellRow key={i} spell={spell} npc={npc} showRoll={showRoll} />
      ))}
    </Grid>
  );
}
