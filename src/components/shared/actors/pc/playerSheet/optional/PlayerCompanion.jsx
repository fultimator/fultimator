import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { useNavigate } from "react-router";
import NpcActorCard from "/src/components/shared/actors/npc/NpcActorCard";
import SectionCard from "/src/components/shared/actors/common/SectionCard";

export default function PlayerCompanion({ player, isEditMode }) {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const faithfulCompanionSkills = player.classes
    .flatMap((cls) => cls.skills)
    .filter(
      (skill) =>
        skill.specialSkill === "Faithful Companion" && skill.currentLvl > 0,
    );

  let companion = null;
  for (let i = 0; i < player.classes.length; i++) {
    if (player.classes[i].companion) {
      companion = player.classes[i].companion;
      break;
    }
  }

  const sl = faithfulCompanionSkills[0]?.currentLvl ?? 0;
  const companionWithBonus =
    companion && sl > 0
      ? {
          ...companion,
          effects: [
            ...(companion.effects ?? []),
            {
              id: "faithful-companion-sl-bonus",
              name: "Faithful Companion",
              changes: [
                { key: "bonuses.accuracy.all", mode: 2, value: String(sl) },
              ],
            },
          ],
        }
      : companion;

  if (faithfulCompanionSkills.length !== 1 || companion === null) return null;

  const title = `${t("Faithful Companion")} - ${t("SL")}: ${sl}`;

  return (
    <SectionCard title={title} noShadow>
      <Box sx={{ p: "0.7em" }}>
        <NpcActorCard npc={companionWithBonus} collapse={true} />
        {isEditMode && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ flexShrink: 0 }}
              onClick={() =>
                navigate(`/npc-gallery/${companion.id}`, {
                  state: { from: `/pc-gallery/${player.id}` },
                })
              }
            >
              {t("View Companion")}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {t(
                "If you edit the Companion, remember to select it again in the corrisponding class page.",
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </SectionCard>
  );
}
