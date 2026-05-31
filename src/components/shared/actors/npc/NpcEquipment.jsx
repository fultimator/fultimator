import React from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { useActorCardSetup } from "/src/components/shared/actors/core-utils";
import { OpenBracket, CloseBracket } from "/src/components/Bracket";
import Diamond from "/src/components/Diamond";
import { Martial } from "/src/components/icons";
import attributes from "/src/libs/attributes";
import { SpanMarkdown, damageTypeLabels } from "./shared";

export function NpcEquipment({ npc }) {
  const { t, background } = useActorCardSetup();

  const weapons = [];
  npc.weaponattacks?.forEach((attack) => {
    if (!weapons.find((w) => w.name === attack.name)) weapons.push(attack);
  });

  const hasWeapons = weapons.length !== 0;
  const hasArmor = npc.armor && npc.armor.name !== t("No Armor", true);
  const hasShield = npc.shield && npc.shield.name !== t("No Shield", true);

  if (!hasWeapons && !hasArmor && !hasShield) return null;

  return (
    <Grid container>
      <Grid sx={{ mt: 0, px: 2, py: 0.3, background }} size={12}>
        <Typography
          sx={{
            color: "white.main",
            fontFamily: "Antonio",
            fontSize: "1.1rem",
            fontWeight: "medium",
            textTransform: "uppercase",
          }}
        >
          {t("Equipment")}
        </Typography>
      </Grid>
      {weapons.map((weapon, i) => (
        <Grid key={i} sx={{ px: 2, py: 0 }} size={12}>
          <Typography>
            <strong>{t("Weapon:")}</strong> {weapon.name}{" "}
            {weapon.martial && <Martial />} <Diamond />{" "}
            {weapon.hands === 1 ? t("1 handed") : t("2 handed")} <Diamond />{" "}
            <strong>
              {" "}
              <OpenBracket />
              {attributes[weapon.accuracy?.attr1]?.shortcaps ??
                weapon.accuracy?.attr1}
              {" + "}
              {attributes[weapon.accuracy?.attr2]?.shortcaps ??
                weapon.accuracy?.attr2}
              <CloseBracket />
              {(weapon.accuracy?.value ?? 0) > 0 &&
                `+${weapon.accuracy?.value}`}{" "}
              <Diamond /> <OpenBracket />
              {t("HR")} + {weapon.damage?.value ?? 0}
              <CloseBracket />
            </strong>{" "}
            {weapon.damage?.type === "physical" ? (
              <span>
                <SpanMarkdown>
                  {t(damageTypeLabels[weapon.damage?.type])}
                </SpanMarkdown>
              </span>
            ) : (
              <span style={{ textTransform: "lowercase" }}>
                <SpanMarkdown>
                  {t(damageTypeLabels[weapon.damage?.type])}
                </SpanMarkdown>
              </span>
            )}{" "}
            <Diamond /> <strong>{weapon.cost}</strong> {t("zenit")}
          </Typography>
        </Grid>
      ))}
      {hasArmor && (
        <Grid sx={{ px: 2, py: 0, alignItems: "center" }} size={12}>
          <strong>{t("Armor:")}</strong> {npc.armor.name}{" "}
          {npc.armor.martial && <Martial />}
          <Diamond />{" "}
          <strong>
            {t("DEF")} {npc.armor.def}
          </strong>{" "}
          <Diamond />{" "}
          <strong>
            {t("M.DEF")} {npc.armor.mdef}
          </strong>{" "}
          <Diamond /> {t("Init.")} <strong>{npc.armor.init}</strong> <Diamond />{" "}
          <strong>{npc.armor.cost}</strong> {t("zenit")}
        </Grid>
      )}
      {hasShield && (
        <Grid sx={{ px: 2, py: 0 }} size={12}>
          <strong>{t("Shield:")}</strong> {npc.shield.name}{" "}
          {npc.shield.martial && <Martial />}
          <Diamond />{" "}
          <strong>
            {t("DEF")} {npc.shield.def}
          </strong>{" "}
          <Diamond />{" "}
          <strong>
            {t("M.DEF")} {npc.shield.mdef}
          </strong>{" "}
          <Diamond /> {t("Init.")} <strong>{npc.shield.init}</strong>{" "}
          <Diamond /> <strong>{npc.shield.cost}</strong> {t("zenit")}
        </Grid>
      )}
    </Grid>
  );
}
