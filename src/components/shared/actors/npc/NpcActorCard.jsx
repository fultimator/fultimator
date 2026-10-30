import React from "react";
import { Card, Grid, Typography } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import { useThemeStore } from "/src/store/themeStore";
import { NpcHeader } from "./NpcHeader";
import { NpcStats, NpcStudyStats } from "./NpcStats";
import { NpcImmunities } from "./NpcImmunities";
import { NpcAttacks } from "./NpcAttacks";
import { NpcSpells } from "./NpcSpells";
import { NpcSpecialRules } from "./NpcSpecialRules";
import { NpcEffects } from "./NpcEffects";
import { NpcActions } from "./NpcActions";
import { NpcNotes } from "./NpcNotes";
import { NpcRareGear } from "./NpcRareGear";
import { NpcEquipment } from "./NpcEquipment";

export default function NpcActorCard({
  npc,
  study,
  npcImage,
  collapse,
  onClick = null,
  cardRef,
  variant = "interactive",
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const actorSheetEffectsEnabled = useThemeStore(
    (s) => s.customization.actorSheetEffectsEnabled,
  );

  return (
    <Card
      sx={
        actorSheetEffectsEnabled === false
          ? {
              width: "100%",
              background: theme.palette.background.paper,
              boxShadow: "none",
              borderTop: "",
              borderLeft: "",
              borderBottom: "",
              borderRight: "",
              containerType: "inline-size",
            }
          : { width: "100%", containerType: "inline-size" }
      }
    >
      <div
        ref={cardRef}
        onClick={() => onClick && onClick()}
        style={{ cursor: "pointer" }}
      >
        {(study === null || study === undefined || study === 0) && (
          <>
            <div
              id={`npc-sheet-top-${npc.id}`}
              style={{
                boxShadow: collapse ? "none" : "1px 1px 5px",
              }}
            >
              <NpcHeader npc={npc} npcImage={npcImage} />
            </div>
            {collapse ? (
              <>
                <div id={`npc-section-stats-${npc.id}`}>
                  <NpcStats npc={npc} />
                </div>
                <div id={`npc-section-immunities-${npc.id}`}>
                  <NpcImmunities npc={npc} />
                </div>
                <div id={`npc-section-attacks-${npc.id}`}>
                  <NpcAttacks npc={npc} variant={variant} />
                </div>
                <div id={`npc-section-spells-${npc.id}`}>
                  <NpcSpells npc={npc} variant={variant} />
                </div>
                <div id={`npc-section-actions-${npc.id}`}>
                  <NpcActions npc={npc} variant={variant} />
                </div>
                <div id={`npc-section-special-${npc.id}`}>
                  <NpcSpecialRules npc={npc} variant={variant} />
                </div>
                <div id={`npc-section-effects-${npc.id}`}>
                  <NpcEffects npc={npc} variant={variant} />
                </div>
                <div id={`npc-section-raregear-${npc.id}`}>
                  <NpcRareGear npc={npc} variant={variant} />
                </div>
                <div id={`npc-section-equip-${npc.id}`}>
                  <NpcEquipment npc={npc} />
                </div>
                <div id={`npc-section-notes-${npc.id}`}>
                  <NpcNotes npc={npc} variant={variant} />
                </div>
              </>
            ) : (
              <Grid container>
                <Grid
                  sx={{
                    padding: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                  size={12}
                >
                  <ArrowDropDown />
                  <Typography
                    color={theme.palette.text.primary}
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: "medium",
                    }}
                  >
                    {t("Expand")}
                  </Typography>
                  <ArrowDropDown />
                </Grid>
              </Grid>
            )}
          </>
        )}

        {typeof study === "number" && study > 0 && (
          <div>
            <NpcHeader npc={npc} npcImage={null} />
            {study < 2 && <NpcStudyStats npc={npc} />}
            {study >= 2 && <NpcStats npc={npc} />}
            {study >= 2 && (
              <Grid sx={{ px: 2, py: 0.5 }} size={12}>
                <Typography>
                  <strong>{t("Typical Traits:")} </strong>
                  {npc.traits}
                </Typography>
              </Grid>
            )}
            {study >= 3 && <NpcAttacks npc={npc} variant={variant} />}
            {study >= 3 && <NpcSpells npc={npc} variant={variant} />}
          </div>
        )}
      </div>
    </Card>
  );
}
