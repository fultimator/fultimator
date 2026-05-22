import React from "react";
import { Box, Grid, Typography } from "@mui/material";
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
        <Grid
          sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "red.main" }}
        >
          {calcHP(npc)} <Diamond color="white.main" />{" "}
          {Math.floor(calcHP(npc) / 2)}
        </Grid>
        <Grid sx={{ px: 1.5, py: 0.4 }}>{t("MP")}</Grid>
        <Grid
          sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "cyan.main" }}
        >
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
  const panelBg = theme.mode === "dark" ? "#1B1D1E" : "#efecf5";
  const panelBorder = theme.mode === "dark" ? "#42484B" : "#ffffff";

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
      {/* Row 1: Attributes + HP/MP/Init */}
      <Box
        sx={{
          borderBottom: "1px solid #281127",
          borderTop: "1px solid #281127",
          borderRight: "1px solid #281127",
          borderImage: "linear-gradient(90deg, #341b35, #6d5072) 1;",
          mx: "2px",
          mt: "2px",
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(4, minmax(0, 1fr))",
            sm: "repeat(4, minmax(76px, 0.9fr)) auto auto auto auto minmax(68px, auto)",
          },
          alignItems: "stretch",
          fontSize: { xs: "0.82rem", sm: "0.9rem" },
        }}
      >
        <Box
          sx={{
            bgcolor: theme.mode === "dark" ? "#1E2122" : "#efecf5",
            borderRight: `1px solid ${panelBorder}`,
            py: 0.4,
          }}
        >
          {t("DEX")} d{npc.attributes?.dexterity?.base}
        </Box>
        <Box
          sx={{
            bgcolor: theme.mode === "dark" ? "#1E2122" : "#f3f0f7",
            borderRight: `1px solid ${panelBorder}`,
            py: 0.4,
          }}
        >
          {t("INS")} d{npc.attributes?.insight?.base}
        </Box>
        <Box
          sx={{
            bgcolor: theme.mode === "dark" ? "#1D1F20" : "#f6f4f9",
            borderRight: `1px solid ${panelBorder}`,
            py: 0.4,
          }}
        >
          {t("MIG")} d{npc.attributes?.might?.base}
        </Box>
        <Box
          sx={{
            bgcolor: theme.mode === "dark" ? "#1B1D1E" : "#f9f8fb",
            borderRight: { sm: `1px solid ${panelBorder}` },
            py: 0.4,
          }}
        >
          {t("WLP")} d{npc.attributes?.will?.base}
        </Box>
        <Box sx={{ px: 1, py: 0.4, display: { xs: "none", sm: "block" } }}>
          {t("HP")}
        </Box>
        <Box
          sx={{
            py: 0.4,
            px: 1.5,
            color: "white.main",
            bgcolor: "red.main",
            display: { xs: "none", sm: "block" },
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          {calcHP(npc)} <Diamond color="white.main" /> {Math.floor(calcHP(npc) / 2)}
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.4,
            display: { xs: "none", sm: "block" },
            whiteSpace: "nowrap",
          }}
        >
          {t("MP")}
        </Box>
        <Box
          sx={{
            px: 1.5,
            py: 0.4,
            color: "white.main",
            bgcolor: "cyan.main",
            display: { xs: "none", sm: "block" },
            whiteSpace: "nowrap",
          }}
        >
          {calcMP(npc)}
        </Box>
        <Box
          sx={{
            py: 0.4,
            px: 1,
            display: { xs: "none", sm: "block" },
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          {t("Init.")} {calcInit(npc)}
        </Box>
      </Box>

      {/* Row 2 (mobile only): HP / MP / Init */}
      <Box
        sx={{
          display: { xs: "grid", sm: "none" },
          borderBottom: "1px solid #281127",
          borderRight: "1px solid #281127",
          borderTop: "1px solid #281127",
          borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
          mx: "2px",
          my: "2px",
          gridTemplateColumns: "auto auto auto auto",
          alignItems: "stretch",
          fontSize: "0.8rem",
        }}
      >
        <Box sx={{ px: 1, py: 0.4 }}>{t("HP")}</Box>
        <Box sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "red.main" }}>
          {calcHP(npc)} <Diamond color="white.main" /> {Math.floor(calcHP(npc) / 2)}
        </Box>
        <Box sx={{ px: 1, py: 0.4 }}>{t("MP")}</Box>
        <Box sx={{ px: 1.5, py: 0.4, color: "white.main", bgcolor: "cyan.main" }}>
          {calcMP(npc)}
        </Box>
        <Box sx={{ py: 0.4, gridColumn: "1 / -1", bgcolor: panelBg }}>
          {t("Init.")} {calcInit(npc)}
        </Box>
      </Box>

      {/* Row 3: DEF/M.DEF + Affinities */}
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
        <Grid
          sx={{
            bgcolor: panelBg,
            borderRight: `1px solid ${panelBorder}`,
            py: 0.4,
            px: 1,
          }}
        >
          {npc.armor?.def > 0 || npc.extra?.defOverride ? (
            <>
              {t("DEF")} {calcDef(npc)}
            </>
          ) : (
            <>
              {t("DEF")} +{calcDef(npc)}
            </>
          )}
        </Grid>
        <Grid
          sx={{
            bgcolor: panelBg,
            borderRight: `1px solid ${panelBorder}`,
            py: 0.4,
            px: 1,
          }}
        >
          {npc.extra?.mDefOverride ? (
            <>
              {t("M.DEF")} {calcMDef(npc)}
            </>
          ) : (
            <>
              {t("M.DEF")} +{calcMDef(npc)}
            </>
          )}
        </Grid>
        {npc.affinities && (
          <>
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
          </>
        )}
      </Grid>
    </Typography>
  );
}
