import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { useActorCardSetup, isInteractive } from "../core-utils";
import { OpenBracket, CloseBracket } from "../../../Bracket";
import Diamond from "../../../Diamond";
import { MeleeIcon, DistanceIcon } from "../../../icons";
import attributes from "../../../../libs/attributes";
import { calcDamage, calcPrecision } from "../../../../libs/npcs";
import { useChatMessagesStore } from "../../../../store/chatMessagesStore";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "../../../app-drawer/panels/chat/domain/accuracy-checks";
import {
  SpanMarkdown,
  ClickableName,
  ATTR_SHORT,
  damageTypeLabels,
} from "./shared";

function AttackRow({ attack, npc, attackType, showRoll }) {
  const { t } = useTranslate();
  const addMessage = useChatMessagesStore((s) => s.addMessage);
  const isWeapon = attackType === "weapon";

  const handleRoll = (e) => {
    e.stopPropagation();
    const attr1Short = ATTR_SHORT[attack.accuracy?.attr1] ?? "dex";
    const attr2Short = ATTR_SHORT[attack.accuracy?.attr2] ?? "dex";
    const dieSizes = {
      primary: npc.attributes?.[attack.accuracy?.attr1] ?? 6,
      secondary: npc.attributes?.[attack.accuracy?.attr2] ?? 6,
    };
    const intent = prepareAccuracyCheck({
      attr1: attr1Short,
      attr2: attr2Short,
      accuracyBonus: attack.accuracy?.value ?? 0,
      name: attack.name,
      baseDamage: isWeapon
        ? (attack.damage?.value ?? 0)
        : calcDamage(attack, npc),
      damageType: attack.damage?.type ?? "physical",
      accuracyDefense: "def",
      range: attack.range,
      hrZero: attack.damage?.hrZero === true,
    });
    const rolls = rollAccuracyCheck(dieSizes);
    const result = processAccuracyCheck(
      intent,
      rolls,
      dieSizes,
      npc.name || "NPC",
    );
    addMessage(buildAccuracyCheckMessage(result));
  };

  return (
    <Fragment>
      <Grid sx={{ px: 1, py: 0.5 }} size={1}>
        <Typography sx={{ textAlign: "center" }}>
          {attack.range === "melee" && <MeleeIcon />}
          {attack.range === "ranged" && <DistanceIcon />}
        </Typography>
      </Grid>
      <Grid sx={{ px: 1, py: 0.5 }} size={11}>
        <Typography component="div">
          {showRoll ? (
            <ClickableName name={attack.name} onAction={handleRoll} />
          ) : (
            <strong>{attack.name}</strong>
          )}
          {isWeapon && attack.hands && (
            <>
              {" "}
              <Diamond /> {attack.hands === 1 ? t("1 handed") : t("2 handed")}
            </>
          )}{" "}
          <Diamond />{" "}
          <strong>
            <OpenBracket />
            {attributes[attack.accuracy?.attr1]?.shortcaps ??
              attack.accuracy?.attr1}
            {" + "}
            {attributes[attack.accuracy?.attr2]?.shortcaps ??
              attack.accuracy?.attr2}
            <CloseBracket />
            {calcPrecision(attack, npc) > 0 &&
              `+${calcPrecision(attack, npc)}`}{" "}
          </strong>
          {attack.damage?.type !== "nodmg" && (
            <>
              <strong>
                <Diamond /> <OpenBracket />
                {isWeapon
                  ? `${t("HR")} + ${attack.damage?.value ?? 0}`
                  : (attack.damage?.hrZero ? "HR0" : t("HR")) +
                    " + " +
                    calcDamage(attack, npc)}
                <CloseBracket />{" "}
              </strong>
              {attack.damage?.type === "physical" ? (
                <span>
                  <SpanMarkdown>
                    {t(damageTypeLabels[attack.damage?.type])}
                  </SpanMarkdown>
                </span>
              ) : (
                <span style={{ textTransform: "lowercase" }}>
                  <SpanMarkdown>
                    {t(damageTypeLabels[attack.damage?.type])}
                  </SpanMarkdown>
                </span>
              )}
            </>
          )}{" "}
          {attack.special?.map((effect, i) => (
            <Typography component="span" key={i}>
              {" "}
              - <SpanMarkdown>{effect}</SpanMarkdown>{" "}
            </Typography>
          ))}
        </Typography>
      </Grid>
    </Fragment>
  );
}

export function NpcAttacks({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  if (!npc.attacks?.length && !npc.weaponattacks?.length) return null;

  return (
    <Grid container>
      <Grid sx={{ mt: 1, px: 2, py: 0.3, background }} size={12}>
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            fontWeight: "medium",
            textTransform: "uppercase",
          }}
        >
          {t("Basic Attacks")}
        </Typography>
      </Grid>
      {npc.attacks?.map((attack, i) => (
        <AttackRow
          key={i}
          attack={attack}
          npc={npc}
          attackType="base"
          showRoll={showRoll}
        />
      ))}
      {npc.weaponattacks?.map((attack, i) => (
        <AttackRow
          key={`w${i}`}
          attack={attack}
          npc={npc}
          attackType="weapon"
          showRoll={showRoll}
        />
      ))}
    </Grid>
  );
}
