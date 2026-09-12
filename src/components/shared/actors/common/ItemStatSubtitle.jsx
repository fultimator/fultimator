import React from "react";
import { Typography } from "@mui/material";
import { OpenBracket, CloseBracket } from "/src/components/Bracket";
import types from "/src/libs/types";
import attributes from "/src/libs/attributes";
import { useTranslate } from "/src/translation/translate";

function normalizeAttrKey(raw) {
  const key = String(raw || "").toLowerCase();
  if (key === "dex" || key === "dexterity") return "dexterity";
  if (key === "ins" || key === "insight") return "insight";
  if (key === "mig" || key === "might") return "might";
  if (key === "wlp" || key === "will" || key === "willpower")
    return "willpower";
  return "dexterity";
}

export default function ItemStatSubtitle({ item }) {
  const { t } = useTranslate();

  if (item.equipType === "weapon" || item.equipType === "custom-weapon") {
    const accuracy = item.accuracy ?? {};
    const damage = item.damage ?? {};
    const attr1 = normalizeAttrKey(accuracy.attr1);
    const attr2 = normalizeAttrKey(accuracy.attr2);
    const prec = accuracy.value ?? 0;
    const dmgVal = damage.value ?? 0;
    const dmgType = damage.type ?? "physical";
    return (
      <Typography
        sx={{
          fontSize: "0.9rem",
          color: "text.secondary",
          lineHeight: 1.3,
          fontWeight: "bold",
        }}
      >
        <OpenBracket />
        {`${attributes[attr1]?.shortcaps ?? "DEX"}+${attributes[attr2]?.shortcaps ?? "MIG"}`}
        <CloseBracket />
        {prec !== 0 ? (prec > 0 ? "+" : "") + prec : ""}
        {"  "}
        <OpenBracket />
        {t("HR")}
        {dmgVal >= 0 ? "+" : ""}
        {dmgVal}
        <CloseBracket /> {types[dmgType]?.long ?? types.physical.long}
      </Typography>
    );
  }

  if (item.equipType === "armor") {
    const def = (item.def || 0) + (item.defModifier || 0);
    const mdef = (item.mdef || 0) + (item.mDefModifier || 0);
    const defStr = item.martial
      ? String(def)
      : def === 0
        ? t("DEX die")
        : `${t("DEX die")} +${def}`;
    const mdefStr = mdef === 0 ? t("INS die") : `${t("INS die")} +${mdef}`;
    return (
      <Typography
        sx={{
          fontSize: "0.9rem",
          color: "text.secondary",
          lineHeight: 1.3,
          fontWeight: "bold",
        }}
      >
        {t("DEF")} {defStr}
        {" - "}
        {t("M.DEF")} {mdefStr}
      </Typography>
    );
  }

  if (item.equipType === "shield") {
    const def = (item.def || 0) + (item.defModifier || 0);
    const mdef = (item.mdef || 0) + (item.mDefModifier || 0);
    return (
      <Typography
        sx={{
          fontSize: "0.9rem",
          color: "text.secondary",
          lineHeight: 1.3,
          fontWeight: "bold",
        }}
      >
        {t("DEF")} +{def}
        {" - "}
        {t("M.DEF")} +{mdef}
      </Typography>
    );
  }

  if (item.equipType === "accessory") {
    return (
      <Typography
        sx={{
          fontSize: "0.9rem",
          color: "text.secondary",
          lineHeight: 1.3,
          fontWeight: "bold",
        }}
      >
        {item.cost}z
      </Typography>
    );
  }

  return null;
}
