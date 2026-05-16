import React from "react";
import { Grid, Typography } from "@mui/material";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import Diamond from "../../../Diamond";
import { TypeAffinity } from "../../../types";
import {
  calcHP,
  calcMP,
  calcInit,
  calcDef,
  calcMDef,
} from "../../../../libs/npcs";

export function NpcStudyStats({ npc }) {
  const { t } = useTranslate();
  return (
    <Typography
      component="div"
      sx={{
        fontFamily: "Antonio",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "0.9rem",
      }}
    >
      <Grid
        container
        sx={{
          borderBottom: "1px solid #281127",
          borderTop: "1px solid #281127",
          borderLeft: "1px solid #281127",
          borderRight: "1px solid #281127",
          borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
          mx: "2px",
          my: "2px",
          alignItems: "stretch",
        }}
      >
        <Grid sx={{ px: 1.5, py: 0.4 }}>{t("HP")}</Grid>
        <Grid sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "red.main" }}>
          {calcHP(npc)} <Diamond color="white.main" /> {Math.floor(calcHP(npc) / 2)}
        </Grid>
        <Grid sx={{ px: 1.5, py: 0.4 }}>{t("MP")}</Grid>
        <Grid sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "cyan.main" }}>
          {calcMP(npc)}
        </Grid>
      </Grid>
    </Typography>
  );
}

export function NpcStats({ npc }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const borderImage = `linear-gradient(45deg, #b9a9be, ${theme.transparent}) 1`;

  return (
    <Typography
      component="div"
      sx={{
        fontFamily: "Antonio",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "0.9rem",
      }}
    >
      {/* Row 1: Attributes */}
      <Grid
        container
        sx={{
          borderBottom: "1px solid #281127",
          borderTop: "1px solid #281127",
          borderRight: "1px solid #281127",
          borderImage: "linear-gradient(90deg, #341b35, #6d5072) 1;",
          mx: "2px",
          mt: "2px",
          alignItems: "stretch",
        }}
      >
        <Grid
          sx={{
            bgcolor: theme.mode === "dark" ? "#1E2122" : "#efecf5",
            borderRight: theme.mode === "dark" ? "1px solid #42484B" : "1px solid #ffffff",
            py: 0.4,
          }}
          size="grow"
        >
          {t("DEX")} d{npc.attributes?.dexterity}
        </Grid>
        <Grid
          sx={{
            bgcolor: theme.mode === "dark" ? "#1E2122" : "#f3f0f7",
            borderRight: theme.mode === "dark" ? "1px solid #42484B" : "1px solid #ffffff",
            py: 0.4,
          }}
          size="grow"
        >
          {t("INS")} d{npc.attributes?.insight}
        </Grid>
        <Grid
          sx={{
            bgcolor: theme.mode === "dark" ? "#1D1F20" : "#f6f4f9",
            borderRight: theme.mode === "dark" ? "1px solid #42484B" : "1px solid #ffffff",
            py: 0.4,
          }}
          size="grow"
        >
          {t("MIG")} d{npc.attributes?.might}
        </Grid>
        <Grid
          sx={{
            bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#f9f8fb",
            py: 0.4,
          }}
          size="grow"
        >
          {t("WLP")} d{npc.attributes?.will}
        </Grid>
      </Grid>
      {/* Row 2: HP / MP / Init / DEF / M.DEF */}
      <Grid
        container
        sx={{
          borderBottom: "1px solid #281127",
          borderTop: "1px solid #281127",
          borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
          mx: "2px",
          my: "2px",
          alignItems: "stretch",
        }}
      >
        <Grid
          sx={{
            bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#efecf5",
            borderRight: theme.mode === "dark" ? "1px solid #42484B" : "1px solid #ffffff",
            py: 0.4,
            px: 0.5,
          }}
        >
          {npc.armor?.def > 0 || npc.extra?.defOverride
            ? <>{t("DEF")} {calcDef(npc)}</>
            : <>{t("DEF")} +{calcDef(npc)}</>}
        </Grid>
        <Grid
          sx={{
            bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#efecf5",
            borderRight: theme.mode === "dark" ? "1px solid #42484B" : "1px solid #ffffff",
            py: 0.4,
            px: 0.5,
          }}
        >
          {npc.extra?.mDefOverride
            ? <>{t("M.DEF")} {calcMDef(npc)}</>
            : <>{t("M.DEF")} +{calcMDef(npc)}</>}
        </Grid>
        <Grid sx={{ px: 1, py: 0.4 }}>{t("HP")}</Grid>
        <Grid sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "red.main" }}>
          {calcHP(npc)} <Diamond color="white.main" /> {Math.floor(calcHP(npc) / 2)}
        </Grid>
        <Grid sx={{ px: 1, py: 0.4 }}>{t("MP")}</Grid>
        <Grid sx={{ px: 1.5, py: 0.4, color: "white.main", bgcolor: "cyan.main" }}>
          {calcMP(npc)}
        </Grid>
        <Grid sx={{ py: 0.4 }} size="grow">
          {t("Init.")} {calcInit(npc)}
        </Grid>
      </Grid>
      {/* Row 3: Affinities */}
      {npc.affinities && (
        <Grid
          container
          sx={{
            borderBottom: "1px solid #281127",
            borderTop: "1px solid #281127",
            borderLeft: "1px solid #281127",
            borderImage,
            mx: "2px",
            mb: "2px",
          }}
        >
          <Grid sx={{ py: 0.4, borderRight: "1px solid #42484B" }} size="grow">
            <TypeAffinity type="physical" affinity={npc.affinities.physical} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #604365" }} size="grow">
            <TypeAffinity type="air" affinity={npc.affinities.air} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #6f5375" }} size="grow">
            <TypeAffinity type="bolt" affinity={npc.affinities.bolt} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #816687" }} size="grow">
            <TypeAffinity type="dark" affinity={npc.affinities.dark} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #957d9b" }} size="grow">
            <TypeAffinity type="earth" affinity={npc.affinities.earth} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #ac97b0" }} size="grow">
            <TypeAffinity type="fire" affinity={npc.affinities.fire} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #c4b4c7" }} size="grow">
            <TypeAffinity type="ice" affinity={npc.affinities.ice} />
          </Grid>
          <Grid sx={{ py: 0.4, borderRight: "1px solid #e0d7e2" }} size="grow">
            <TypeAffinity type="light" affinity={npc.affinities.light} />
          </Grid>
          <Grid sx={{ py: 0.4 }} size="grow">
            <TypeAffinity type="poison" affinity={npc.affinities.poison} />
          </Grid>
        </Grid>
      )}
    </Typography>
  );
}
