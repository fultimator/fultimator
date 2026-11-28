import React, { Fragment } from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import {
  useActorCardSetup,
  isInteractive,
} from "/src/components/shared/actors/core-utils";
import { OpenBracket, CloseBracket } from "/src/components/Bracket";
import Diamond from "/src/components/Diamond";
import { MeleeIcon, DistanceIcon } from "/src/components/icons";
import attributes from "/src/libs/attributes";
import { calcDamage, calcPrecision } from "/src/libs/npcs";
import { useAddChatMessage } from "/src/hooks/useAddChatMessage";
import {
  prepareAccuracyCheck,
  rollAccuracyCheck,
  processAccuracyCheck,
  buildAccuracyCheckMessage,
} from "/src/components/app-drawer/panels/chat/domain/accuracy-checks";
import {
  accuracyModifiersFromEffects,
  outgoingDamageModifiersFromEffects,
} from "/src/components/app-drawer/panels/chat/domain/effect-modifiers";
import { ATTR_SHORT, damageTypeLabels } from "./npcShared";
import { SpanMarkdown, ClickableName } from "./NpcMarkdown";

function AttackRow({ attack, npc, attackType, showRoll }) {
  const { t } = useTranslate();
  const addMessage = useAddChatMessage();
  const isWeapon = attackType === "weapon";

  const handleRoll = (e) => {
    e.stopPropagation();
    const attr1Short = ATTR_SHORT[attack.accuracy?.attr1] ?? "dex";
    const attr2Short = ATTR_SHORT[attack.accuracy?.attr2] ?? "dex";
    const dieSizes = {
      primary: npc.attributes?.[attack.accuracy?.attr1]?.base ?? 6,
      secondary: npc.attributes?.[attack.accuracy?.attr2]?.base ?? 6,
    };
    const effectModifiers = accuracyModifiersFromEffects(npc, {
      range: attack.range,
    });
    const damageModifiers = outgoingDamageModifiersFromEffects(npc, {
      range: attack.range,
      damageType: attack.damage?.type,
    });
    const damageOutgoingBonus = damageModifiers.reduce(
      (sum, m) => sum + m.value,
      0,
    );
    const intent = prepareAccuracyCheck(
      {
        attr1: attr1Short,
        attr2: attr2Short,
        accuracyBonus: calcPrecision(attack, npc),
        name: attack.name,
        baseDamage: isWeapon
          ? (attack.damage?.value ?? 0)
          : calcDamage(attack, npc),
        damageType: attack.damage?.type ?? "physical",
        accuracyDefense: "def",
        range: attack.range,
        hrZero: attack.damage?.hrZero === true,
      },
      effectModifiers,
      { damageOutgoingBonus, damageModifiers },
    );
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
      <Grid
        sx={{ pl: 2, pr: 0, py: 0.25, width: 40, flexShrink: 0 }}
        size="auto"
      >
        <Typography
          sx={{
            textAlign: "left",
            fontSize: "1.1em",
            display: "flex",
            alignItems: "center",
            height: "1.32em",
            "& svg": { display: "block" },
          }}
        >
          {attack.range === "melee" && <MeleeIcon />}
          {attack.range === "ranged" && <DistanceIcon />}
        </Typography>
      </Grid>
      <Grid
        sx={{
          pl: 1,
          pr: 1,
          py: 0.25,
          minWidth: 0,
          flex: "1 1 calc(100% - 40px)",
          maxWidth: "calc(100% - 40px)",
        }}
      >
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
        {attack.description && (
          <Typography
            component="div"
            sx={{ fontStyle: "italic", color: "text.secondary", mt: 0.25 }}
          >
            <SpanMarkdown>{attack.description}</SpanMarkdown>
          </Typography>
        )}
      </Grid>
    </Fragment>
  );
}

export function NpcAttacks({ npc, variant = "interactive" }) {
  const { t, background } = useActorCardSetup(variant);
  const showRoll = isInteractive(variant);

  if (!npc.attacks?.length && !npc.weaponattacks?.length) return null;

  return (
    <Grid container sx={{ pb: 0.75 }}>
      <Grid
        sx={{
          mt: 0,
          px: 2,
          py: 0.3,
          minHeight: 34,
          mb: 0.75,
          display: "flex",
          alignItems: "center",
          background,
        }}
        size={12}
      >
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            lineHeight: 1,
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
