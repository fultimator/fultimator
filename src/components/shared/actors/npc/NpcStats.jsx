import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import Diamond from "/src/components/Diamond";
import DefenseAffinityRow from "/src/components/shared/actors/common/DefenseAffinityRow";
import {
  calcHP,
  calcMP,
  calcInit,
  calcDef,
  calcMDef,
} from "/src/libs/npcs";

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
        textShadow: "none",
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
        textShadow: "none",
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
          gridTemplateColumns:
            "repeat(4, minmax(76px, 0.9fr)) auto auto auto auto minmax(68px, auto)",
          alignItems: "stretch",
          fontSize: "0.9rem",
          "@container (max-width: 560px)": {
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            fontSize: "0.82rem",
          },
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
            borderRight: `1px solid ${panelBorder}`,
            py: 0.4,
            "@container (max-width: 560px)": {
              borderRight: "none",
            },
          }}
        >
          {t("WLP")} d{npc.attributes?.will?.base}
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.4,
            "@container (max-width: 560px)": { display: "none" },
          }}
        >
          {t("HP")}
        </Box>
        <Box
          sx={{
            py: 0.4,
            px: 1.5,
            color: "white.main",
            bgcolor: "red.main",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            "@container (max-width: 560px)": { display: "none" },
          }}
        >
          {calcHP(npc)} <Diamond color="white.main" />{" "}
          {Math.floor(calcHP(npc) / 2)}
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.4,
            whiteSpace: "nowrap",
            "@container (max-width: 560px)": { display: "none" },
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
            whiteSpace: "nowrap",
            "@container (max-width: 560px)": { display: "none" },
          }}
        >
          {calcMP(npc)}
        </Box>
        <Box
          sx={{
            py: 0.4,
            px: 1,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            "@container (max-width: 560px)": { display: "none" },
          }}
        >
          {t("Init.")} {calcInit(npc)}
        </Box>
      </Box>

      {/* Row 2 (mobile only): HP / MP / Init */}
      <Box
        sx={{
          display: "none",
          borderBottom: "1px solid #281127",
          borderRight: "1px solid #281127",
          borderTop: "1px solid #281127",
          borderImage: "linear-gradient(90deg, #6d5072, #ffffff) 1;",
          mx: "2px",
          my: "2px",
          gridTemplateColumns: "auto auto auto auto",
          alignItems: "stretch",
          fontSize: "0.8rem",
          "@container (max-width: 560px)": {
            display: "grid",
          },
        }}
      >
        <Box sx={{ px: 1, py: 0.4 }}>{t("HP")}</Box>
        <Box
          sx={{ py: 0.4, px: 1.5, color: "white.main", bgcolor: "red.main" }}
        >
          {calcHP(npc)} <Diamond color="white.main" />{" "}
          {Math.floor(calcHP(npc) / 2)}
        </Box>
        <Box sx={{ px: 1, py: 0.4 }}>{t("MP")}</Box>
        <Box
          sx={{ px: 1.5, py: 0.4, color: "white.main", bgcolor: "cyan.main" }}
        >
          {calcMP(npc)}
        </Box>
        <Box sx={{ py: 0.4, px: 1, bgcolor: panelBg }}>
          {npc.armor?.def > 0 || npc.extra?.defOverride ? (
            <>
              {t("DEF")} {calcDef(npc)}
            </>
          ) : (
            <>
              {t("DEF")} +{calcDef(npc)}
            </>
          )}
        </Box>
        <Box sx={{ py: 0.4, px: 1, bgcolor: panelBg }}>
          {npc.extra?.mDefOverride ? (
            <>
              {t("M.DEF")} {calcMDef(npc)}
            </>
          ) : (
            <>
              {t("M.DEF")} +{calcMDef(npc)}
            </>
          )}
        </Box>
        <Box sx={{ py: 0.4, px: 1, bgcolor: panelBg }}>
          {t("Init.")} {calcInit(npc)}
        </Box>
      </Box>

      {/* Row 3: DEF/M.DEF + Affinities */}
      <DefenseAffinityRow
        t={t}
        defValue={`${npc.armor?.def > 0 || npc.extra?.defOverride ? "" : "+"}${calcDef(npc)}`}
        mDefValue={`${npc.extra?.mDefOverride ? "" : "+"}${calcMDef(npc)}`}
        affinities={npc.affinities}
        panelBg={panelBg}
        panelBorder={panelBorder}
        dividerColor={panelBorder}
        borderImage={borderImage}
      />
    </Typography>
  );
}
