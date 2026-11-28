import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import Diamond from "/src/components/Diamond";
import DefenseAffinityRow from "/src/components/shared/actors/common/DefenseAffinityRow";
import { calcHP, calcMP, calcInit, calcDef, calcMDef } from "/src/libs/npcs";
import { resolveActorEffects } from "/src/libs/actorEffectsResolver";

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

  const { affinityGrants } = resolveActorEffects(npc);
  const allKeys = new Set([
    ...Object.keys(npc.affinities ?? {}),
    ...Object.keys(affinityGrants),
  ]);
  const effectiveAffinities = Object.fromEntries(
    [...allKeys].map((el) => [
      el,
      affinityGrants[el] ?? npc.affinities?.[el] ?? "",
    ]),
  );
  const lineColor = "#7d6482";
  const line = `1px solid ${lineColor}`;
  const alignedColWidth =
    "clamp(56px, min(12.6cqw, calc((100cqw - 430px) / 4)), 150px)";
  const borderImage = `linear-gradient(45deg, #b9a9be, ${theme.transparent}) 1`;
  const panelBg = theme.mode === "dark" ? "#1D1F20" : "#f4f2f8";
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
        // stacked layout: HP/MP row goes above the attributes
        "@container (max-width: 680px)": {
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Row 1: Attributes + HP/MP/Init */}
      <Box
        sx={{
          mx: "2px",
          mt: "6px",
          ...{
            position: "relative",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              height: "1px",
              pointerEvents: "none",
              background: `linear-gradient(90deg, ${lineColor} 0%, ${lineColor} 55%, transparent 100%)`,

              maskImage: `linear-gradient(90deg, #000 calc(4 * ${alignedColWidth}), transparent 0, transparent calc(4 * ${alignedColWidth} + 3px), #000 0)`,
              WebkitMaskImage: `linear-gradient(90deg, #000 calc(4 * ${alignedColWidth}), transparent 0, transparent calc(4 * ${alignedColWidth} + 3px), #000 0)`,
              "@container (max-width: 680px)": {
                maskImage: "none",
                WebkitMaskImage: "none",
              },
            },
            "&::before": { top: 0 },
            "&::after": { bottom: 0 },
          },
          display: "grid",
          gridTemplateColumns: `repeat(4, ${alignedColWidth}) auto auto auto auto minmax(68px, 1fr)`,
          alignItems: "stretch",
          fontSize: "1.1rem",
          "@container (max-width: 680px)": {
            mt: 0,
            "&::after": { display: "none" },
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            fontSize: "0.9rem",
            "& > div": { paddingTop: "0.3rem", paddingBottom: "0.3rem" },
          },
        }}
      >
        <Box
          sx={{
            bgcolor: panelBg,
            borderRight: `1px solid ${panelBorder}`,
            py: 0.6,
          }}
        >
          {t("DEX")} d{npc.attributes?.dexterity?.base}
        </Box>
        <Box
          sx={{
            bgcolor: panelBg,
            borderRight: `1px solid ${panelBorder}`,
            py: 0.6,
          }}
        >
          {t("INS")} d{npc.attributes?.insight?.base}
        </Box>
        <Box
          sx={{
            bgcolor: panelBg,
            borderRight: `1px solid ${panelBorder}`,
            py: 0.6,
          }}
        >
          {t("MIG")} d{npc.attributes?.might?.base}
        </Box>
        <Box
          sx={{
            bgcolor: panelBg,
            borderRight: line,
            "@container (max-width: 680px)": { borderRight: "none" },
            py: 0.6,
          }}
        >
          {t("WLP")} d{npc.attributes?.willpower?.base}
        </Box>
        <Box
          sx={{
            borderLeft: line,
            ml: "3px",
            px: 2.5,
            py: 0.6,
            "@container (max-width: 680px)": { display: "none" },
          }}
        >
          {t("HP")}
        </Box>
        <Box
          sx={{
            py: 0.6,
            px: 4,
            color: "white.main",
            bgcolor: "red.main",
            borderLeft: "1px solid #ee8088",
            borderRight: "1px solid #ee8088",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            "@container (max-width: 680px)": { display: "none" },
          }}
        >
          {calcHP(npc)} <Diamond color="white.main" />{" "}
          {Math.floor(calcHP(npc) / 2)}
        </Box>
        <Box
          sx={{
            px: 2.5,
            py: 0.6,
            whiteSpace: "nowrap",
            "@container (max-width: 680px)": { display: "none" },
          }}
        >
          {t("MP")}
        </Box>
        <Box
          sx={{
            px: 3,
            py: 0.6,
            color: "white.main",
            bgcolor: "cyan.main",
            borderLeft: "1px solid #7fcdf3",
            borderRight: "1px solid #7fcdf3",
            whiteSpace: "nowrap",
            "@container (max-width: 680px)": { display: "none" },
          }}
        >
          {calcMP(npc)}
        </Box>
        <Box
          sx={{
            py: 0.6,
            px: 1,
            textAlign: "right",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            "@container (max-width: 680px)": { display: "none" },
          }}
        >
          {t("Init.")} {calcInit(npc)}
        </Box>
      </Box>

      {/* Row 2 (mobile only): HP / MP / Init */}
      <Box
        sx={{
          display: "none",
          order: -1,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "1px",
            pointerEvents: "none",
            background: `linear-gradient(90deg, ${lineColor} 0%, ${lineColor} 55%, transparent 100%)`,
          },
          mx: "2px",
          mt: "6px",
          mb: 0,
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          alignItems: "stretch",
          fontSize: "0.9rem",
          "& > div": { paddingTop: "0.3rem", paddingBottom: "0.3rem" },
          "@container (max-width: 680px)": {
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
        <Box
          sx={{
            py: 0.4,
            px: 1,
            bgcolor: panelBg,
            borderTop: line,
            borderRight: `1px solid ${panelBorder}`,
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
        </Box>
        <Box
          sx={{
            py: 0.4,
            px: 1,
            bgcolor: panelBg,
            borderTop: line,
            borderRight: `1px solid ${panelBorder}`,
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
        </Box>
        <Box
          sx={{
            py: 0.4,
            px: 1,
            bgcolor: panelBg,
            gridColumn: "span 2",
            borderTop: line,
          }}
        >
          {t("Init.")} {calcInit(npc)}
        </Box>
      </Box>

      {/* Row 3: DEF/M.DEF + Affinities */}
      <DefenseAffinityRow
        t={t}
        defValue={`${npc.armor?.def > 0 || npc.extra?.defOverride ? "" : "+"}${calcDef(npc)}`}
        mDefValue={`${npc.extra?.mDefOverride ? "" : "+"}${calcMDef(npc)}`}
        affinities={npc.affinities}
        effectiveAffinities={effectiveAffinities}
        panelBg={panelBg}
        panelBorder={panelBorder}
        dividerColor={panelBorder}
        borderImage={borderImage}
        defColumnWidth={alignedColWidth}
        compactBreakpoint={680}
        lineColor={lineColor}
        mt="5px"
        mb="8px"
      />
    </Typography>
  );
}
