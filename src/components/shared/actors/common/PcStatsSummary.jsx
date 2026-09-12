import React, { useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Popover,
  Stack,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import {
  DexAttributeIcon,
  InsAttributeIcon,
  MigAttributeIcon,
  WlpAttributeIcon,
  CheckAttributeIcon,
  CheckGroupIcon,
  CheckOpenIcon,
  CheckOpposedIcon,
} from "/src/components/icons";
import StatTooltip from "/src/components/common/StatTooltip";
import { calculateAttribute } from "/src/libs/playerCalculations";
import { deriveCombatStats } from "/src/components/shared/actors/core-utils";
import { CombatStatCard } from "/src/components/shared/actors/pc/shared";

// -- Modifier +/- controls for DEF / M.DEF / INIT --

function ModifierControls({ value, onChange, font, theme }) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0 }}>
      <IconButton
        size="small"
        sx={{ p: 0, color: "#fff" }}
        onPointerDown={(e) => {
          e.preventDefault();
          onChange((value ?? 0) - 1);
        }}
      >
        <Remove sx={{ fontSize: "0.85rem" }} />
      </IconButton>
      <TextField
        value={value ?? 0}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          onChange(Number.isNaN(v) ? 0 : v);
        }}
        size="small"
        variant="standard"
        slotProps={{
          htmlInput: {
            style: {
              textAlign: "center",
              fontFamily: "Antonio",
              fontWeight: "bold",
              fontSize: font,
              color: "#fff",
              WebkitTextFillColor: "#fff",
            },
          },
        }}
        sx={{
          width: "28px",
          "& .MuiInputBase-root": { display: "flex", alignItems: "center" },
          "& .MuiInputBase-input": {
            color: "#fff",
            WebkitTextFillColor: "#fff",
            p: 0,
          },
          "& .MuiInput-underline:before": {
            borderBottomColor: `${theme.palette.secondary.main} !important`,
          },
          "& .MuiInput-underline:after": {
            borderBottomColor: `${theme.palette.secondary.main} !important`,
          },
        }}
      />
      <IconButton
        size="small"
        sx={{ p: 0, color: "#fff" }}
        onPointerDown={(e) => {
          e.preventDefault();
          onChange((value ?? 0) + 1);
        }}
      >
        <Add sx={{ fontSize: "0.85rem" }} />
      </IconButton>
    </Box>
  );
}

// -- Quick checks --

const QUICK_CHECK_ATTRIBUTES = ["dex", "ins", "mig", "wlp"];
const QUICK_CHECK_ATTRIBUTE_LABELS = {
  dex: "DEX",
  ins: "INS",
  mig: "MIG",
  wlp: "WLP",
};
const QUICK_CHECK_ATTR_KEY = {
  dex: "dexterity",
  ins: "insight",
  mig: "might",
  wlp: "willpower",
};
const QUICK_CHECK_DIFFICULTIES = [7, 10, 13, 16];
const QUICK_CHECK_DIFFICULTY_LABELS = {
  7: "Easy",
  10: "Normal",
  13: "Hard",
  16: "Very Hard",
};

function QuickChecks({ onQuickCheck, pc, scale = "lg" }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [anchorEl, setAnchorEl] = useState(null);
  const [kind, setKind] = useState("attribute");
  const [primary1, setPrimary1] = useState("dex");
  const [secondary, setSecondary] = useState("ins");
  const [modifier, setModifier] = useState(0);
  const [diffMode, setDiffMode] = useState("preset");
  const [difficulty, setDifficulty] = useState(10);
  const [customDl, setCustomDl] = useState("");

  const open = Boolean(anchorEl);
  const dieSize = (a) => pc?.attributes?.[QUICK_CHECK_ATTR_KEY[a]]?.base ?? "?";
  const iconSize = scale === "sm" ? "1.8em" : "2.6em";
  const labelSize = scale === "sm" ? "0.62rem" : "0.78rem";

  const openPopover = (e, checkKind) => {
    setKind(checkKind);
    setAnchorEl(e.currentTarget);
  };

  const submit = () => {
    const parsedCustomDl = parseInt(customDl, 10);
    const dl =
      kind === "attribute"
        ? diffMode === "custom" &&
          Number.isFinite(parsedCustomDl) &&
          parsedCustomDl > 0
          ? parsedCustomDl
          : difficulty
        : undefined;
    onQuickCheck?.({
      kind: kind === "attribute" ? "attribute" : "open",
      primary: primary1,
      secondary,
      modifier: Number(modifier) || 0,
      difficulty: dl,
    });
    setAnchorEl(null);
  };

  const checks = [
    {
      checkKind: "group",
      Icon: CheckGroupIcon,
      line1: "Group",
      line2: "Check",
    },
    {
      checkKind: "attribute",
      Icon: CheckAttributeIcon,
      line1: "Attribute",
      line2: "Check",
    },
    { checkKind: "open", Icon: CheckOpenIcon, line1: "Open", line2: "Check" },
    {
      checkKind: "opposed",
      Icon: CheckOpposedIcon,
      line1: "Opposed",
      line2: "Check",
    },
  ];

  return (
    <>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {checks.map(({ checkKind, Icon, line1, line2 }) => (
          <Box
            key={checkKind}
            onClick={(e) => openPopover(e, checkKind)}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              px: "6px",
              py: "4px",
              borderRadius: 1,
              cursor: "pointer",
              color: "text.primary",
              "&:hover": {
                bgcolor: alpha(primary, 0.1),
                "& .check-icon": {
                  animation: "quickCheckBob 0.9s ease-in-out infinite",
                },
              },
              "@keyframes quickCheckBob": {
                "0%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-2px)" },
                "100%": { transform: "translateY(0px)" },
              },
            }}
          >
            <Box className="check-icon" sx={{ display: "inline-flex" }}>
              <Icon size={iconSize} />
            </Box>
            <Typography
              sx={{
                fontFamily: "Antonio",
                fontWeight: 700,
                fontSize: labelSize,
                textTransform: "uppercase",
                lineHeight: 1.1,
                letterSpacing: "0.03em",
              }}
            >
              {t(line1)}
              <br />
              {t(line2)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              overflow: "visible",
              mt: 1,
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                left: "50%",
                width: 12,
                height: 12,
                backgroundColor: "background.paper",
                transform: "translate(-50%, -50%) rotate(45deg)",
                borderTop: "1px solid",
                borderLeft: "1px solid",
                borderColor: "divider",
                zIndex: 0,
              },
            },
          },
        }}
      >
        <Box sx={{ p: 1.5, minWidth: 280, maxWidth: 340 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {t("Roll Check")}
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Attr 1")}</InputLabel>
                <Select
                  label={t("Attr 1")}
                  value={primary1}
                  onChange={(e) => setPrimary1(e.target.value)}
                >
                  {QUICK_CHECK_ATTRIBUTES.map((a) => (
                    <MenuItem key={a} value={a}>
                      {t(QUICK_CHECK_ATTRIBUTE_LABELS[a])} (d{dieSize(a)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>{t("Attr 2")}</InputLabel>
                <Select
                  label={t("Attr 2")}
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                >
                  {QUICK_CHECK_ATTRIBUTES.map((a) => (
                    <MenuItem key={a} value={a}>
                      {t(QUICK_CHECK_ATTRIBUTE_LABELS[a])} (d{dieSize(a)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              size="small"
              type="number"
              label={t("Modifier")}
              value={modifier}
              onChange={(e) => setModifier(e.target.value)}
            />
            {kind === "attribute" && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("Difficulty")}</InputLabel>
                  <Select
                    label={t("Difficulty")}
                    value={diffMode}
                    onChange={(e) => setDiffMode(e.target.value)}
                  >
                    <MenuItem value="preset">{t("Preset")}</MenuItem>
                    <MenuItem value="custom">{t("Custom DL")}</MenuItem>
                  </Select>
                </FormControl>
                {diffMode === "preset" ? (
                  <FormControl fullWidth size="small">
                    <InputLabel>{t("DL")}</InputLabel>
                    <Select
                      label={t("DL")}
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      {QUICK_CHECK_DIFFICULTIES.map((dl) => (
                        <MenuItem key={dl} value={dl}>
                          {`${dl} ${t(QUICK_CHECK_DIFFICULTY_LABELS[dl] || "")}`.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    size="small"
                    type="number"
                    label={t("Custom DL")}
                    value={customDl}
                    onChange={(e) => setCustomDl(e.target.value)}
                  />
                )}
              </>
            )}
            <Button variant="contained" onClick={submit}>
              {t("Roll Check")}
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

// -- Compact inline stat label --

const SCALES = {
  sm: {
    font: "0.8rem",
    defFont: "0.88rem",
    iconBox: "16px",
    iconSize: "16px",
    gap: "2px",
    cardPx: "5px",
    cardPy: "4px",
    gridGap: 0.5,
    p: 0.5,
  },
  lg: {
    font: "1rem",
    defFont: "1.1rem",
    iconBox: "20px",
    iconSize: "20px",
    gap: "2px",
    cardPx: "10px",
    cardPy: "8px",
    gridGap: 1,
    p: "8px",
  },
};

function useScale(scale) {
  const s = SCALES[scale] ?? SCALES.sm;
  const font = {
    fontFamily: "'Antonio', fantasy, sans-serif",
    fontSize: s.font,
    fontWeight: "bold",
    lineHeight: 1.1,
  };
  const defFont = { ...font, fontSize: s.defFont, lineHeight: 1 };
  const layout = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
  };
  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: s.gridGap,
  };
  return { s, font, defFont, layout, grid };
}

// -- Main component --

export default function PcStatsSummary({
  pc,
  isInteractive = false,
  onUpdate,
  updateMaxStats,
  onQuickCheck,
  scale = "sm",
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const { s, font, defFont, layout, grid } = useScale(scale);

  const currDex = calculateAttribute(
    pc,
    pc.attributes.dexterity?.base,
    ["slow", "enraged"],
    ["dexUp"],
    6,
    12,
  );
  const currInsight = calculateAttribute(
    pc,
    pc.attributes.insight?.base,
    ["dazed", "enraged"],
    ["insUp"],
    6,
    12,
  );
  const currMight = calculateAttribute(
    pc,
    pc.attributes.might?.base,
    ["weak", "poisoned"],
    ["migUp"],
    6,
    12,
  );
  const currWillpower = calculateAttribute(
    pc,
    pc.attributes.willpower?.base,
    ["shaken", "poisoned"],
    ["wlpUp"],
    6,
    12,
  );

  const {
    currDef,
    currMDef,
    currInit,
    baseDef,
    baseMDef,
    baseInit,
    equippedArmor,
    equippedShields,
    equippedAccessory,
    isMartialArmor,
    dodgeBonus,
    currDex: dx,
    currInsight: ins,
  } = deriveCombatStats(pc);

  const getAttributeColor = (base, current) => {
    if (current < base) return theme.palette.error.main;
    if (current > base) return theme.palette.success.main;
    return "#fff";
  };

  const ATTRIBUTES = [
    {
      key: "dexterity",
      label: t("DEX"),
      fullName: t("Dexterity"),
      curr: currDex,
      Icon: DexAttributeIcon,
      debuffs: ["slow", "enraged"],
      buffs: ["dexUp"],
    },
    {
      key: "insight",
      label: t("INS"),
      fullName: t("Insight"),
      curr: currInsight,
      Icon: InsAttributeIcon,
      debuffs: ["dazed", "enraged"],
      buffs: ["insUp"],
    },
    {
      key: "might",
      label: t("MIG"),
      fullName: t("Might"),
      curr: currMight,
      Icon: MigAttributeIcon,
      debuffs: ["weak", "poisoned"],
      buffs: ["migUp"],
    },
    {
      key: "willpower",
      label: t("WLP"),
      fullName: t("Willpower"),
      curr: currWillpower,
      Icon: WlpAttributeIcon,
      debuffs: ["shaken", "poisoned"],
      buffs: ["wlpUp"],
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: s.p }}>
      <QuickChecks onQuickCheck={onQuickCheck} pc={pc} scale={scale} />
      {/* Attributes row */}
      <Box sx={grid}>
        {ATTRIBUTES.map(
          ({ key, label, fullName, curr, Icon, debuffs, buffs }) => {
            const card = (
              <CombatStatCard
                sx={{ px: s.cardPx, py: s.cardPy, width: "100%" }}
              >
                <Box sx={layout}>
                  <Box
                    sx={{
                      width: s.iconBox,
                      height: s.iconBox,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={s.iconSize} />
                  </Box>
                  <Typography
                    sx={{
                      ...font,
                      color: "#fff",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </Typography>
                  {isInteractive ? (
                    <Select
                      value={pc.attributes[key]?.base}
                      onChange={(e) => {
                        onUpdate?.((p) => ({
                          ...p,
                          attributes: {
                            ...p.attributes,
                            [key]: {
                              ...p.attributes[key],
                              base: e.target.value,
                            },
                          },
                        }));
                        updateMaxStats?.();
                      }}
                      variant="standard"
                      size="small"
                      sx={{
                        fontFamily: "'Antonio', fantasy, sans-serif",
                        fontSize: s.font,
                        minWidth: 34,
                        color: "#fff",
                        "& .MuiInputBase-root": {
                          display: "flex",
                          alignItems: "center",
                          height: "1.15em",
                        },
                        "& .MuiSelect-select": {
                          color: "#fff",
                          WebkitTextFillColor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          py: 0,
                          minHeight: 0,
                          lineHeight: 1,
                        },
                        "& .MuiSvgIcon-root": { color: "#fff" },
                        "&:before": { borderBottom: "none !important" },
                        "&:after": { borderBottom: "none !important" },
                      }}
                    >
                      {[6, 8, 10, 12].map((v) => (
                        <MenuItem
                          key={v}
                          value={v}
                          sx={{
                            fontFamily: "'Antonio', fantasy, sans-serif",
                            fontSize: s.font,
                          }}
                        >
                          d{v}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Typography
                      sx={{
                        ...font,
                        color: getAttributeColor(
                          pc.attributes[key]?.base,
                          curr,
                        ),
                        cursor: "help",
                      }}
                    >
                      d{curr}
                    </Typography>
                  )}
                </Box>
              </CombatStatCard>
            );

            if (isInteractive)
              return (
                <Box key={key} sx={{ width: "100%" }}>
                  {card}
                </Box>
              );

            return (
              <StatTooltip
                key={key}
                title={fullName}
                base={`d${pc.attributes[key]?.base}`}
                current={`d${curr}`}
                breakdown={[
                  ...debuffs
                    .filter((s) => pc.statuses?.[s])
                    .map((s) => ({
                      label: s.charAt(0).toUpperCase() + s.slice(1),
                      value: "-2 die",
                    })),
                  ...buffs
                    .filter((s) => pc.statuses?.[s])
                    .map((s) => ({ label: s, value: "+2 die" })),
                ]}
                display="flex"
                sx={{ width: "100%" }}
              >
                {card}
              </StatTooltip>
            );
          },
        )}
      </Box>

      {/* DEF / M.DEF / INIT / FP row */}
      <Box sx={grid}>
        <StatTooltip
          title={t("Defense")}
          formula={
            isMartialArmor
              ? `${equippedArmor?.name ?? t("Armor")} (${t("fixed")})`
              : equippedArmor
                ? `DEX d${pc.attributes.dexterity?.base} + ${equippedArmor.name} +${equippedArmor.def}`
                : `DEX d${pc.attributes.dexterity?.base}`
          }
          total={currDef}
          breakdown={[
            ...(isMartialArmor
              ? [
                  {
                    label: `${equippedArmor?.name ?? t("Armor")} (${t("martial, fixed")})`,
                    value: baseDef,
                  },
                ]
              : [
                  { label: `DEX d${pc.attributes.dexterity?.base}`, value: dx },
                  ...(equippedArmor
                    ? [
                        {
                          label: `${equippedArmor.name} +${equippedArmor.def}`,
                          value: equippedArmor.def,
                        },
                      ]
                    : []),
                ]),
            ...equippedShields
              .filter((s) => s.def)
              .map((s) => ({
                label: `${s.name} (shield)`,
                value: s.def,
                signed: true,
              })),
            ...(dodgeBonus > 0
              ? [{ label: t("Dodge skill"), value: dodgeBonus, signed: true }]
              : []),
            ...(pc.modifiers?.def
              ? [
                  {
                    label: t("Other bonuses"),
                    value: pc.modifiers.def,
                    signed: true,
                  },
                ]
              : []),
          ].filter((e) => e.value !== 0)}
          display="flex"
          sx={{ width: "100%" }}
        >
          <CombatStatCard sx={{ px: s.cardPx, py: s.cardPy, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <Box sx={layout}>
                <Box
                  sx={{
                    width: s.iconBox,
                    height: s.iconBox,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/icons/stats/icon_def.png"
                    alt={t("DEF")}
                    sx={{
                      width: s.iconBox,
                      height: s.iconBox,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    ...defFont,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("DEF")}
                </Typography>
                <Typography sx={{ ...defFont, color: "#fff" }}>
                  {currDef}
                </Typography>
              </Box>
              {isInteractive && (
                <ModifierControls
                  value={pc.modifiers?.def ?? 0}
                  onChange={(v) =>
                    onUpdate?.((p) => ({
                      ...p,
                      modifiers: { ...p.modifiers, def: v },
                    }))
                  }
                  font={s.font}
                  theme={theme}
                />
              )}
            </Box>
          </CombatStatCard>
        </StatTooltip>

        <StatTooltip
          title={t("Magic Defense")}
          formula={
            isMartialArmor
              ? `${equippedArmor?.name ?? t("Armor")} (${t("fixed")})`
              : equippedArmor
                ? `INS d${pc.attributes.insight?.base} + ${equippedArmor.name} +${equippedArmor.mdef}`
                : `INS d${pc.attributes.insight?.base}`
          }
          total={currMDef}
          breakdown={[
            ...(isMartialArmor
              ? [
                  {
                    label: `${equippedArmor?.name ?? t("Armor")} (${t("martial, fixed")})`,
                    value: baseMDef,
                  },
                ]
              : [
                  { label: `INS d${pc.attributes.insight?.base}`, value: ins },
                  ...(equippedArmor
                    ? [
                        {
                          label: `${equippedArmor.name} +${equippedArmor.mdef}`,
                          value: equippedArmor.mdef,
                        },
                      ]
                    : []),
                ]),
            ...equippedShields
              .filter((s) => s.mdef)
              .map((s) => ({
                label: `${s.name} (shield)`,
                value: s.mdef,
                signed: true,
              })),
            ...(pc.modifiers?.mdef
              ? [
                  {
                    label: t("Other bonuses"),
                    value: pc.modifiers.mdef,
                    signed: true,
                  },
                ]
              : []),
          ].filter((e) => e.value !== 0)}
          display="flex"
          sx={{ width: "100%" }}
        >
          <CombatStatCard sx={{ px: s.cardPx, py: s.cardPy, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <Box sx={layout}>
                <Box
                  sx={{
                    width: s.iconBox,
                    height: s.iconBox,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/icons/stats/icon_mdef.png"
                    alt={t("M.DEF")}
                    sx={{
                      width: s.iconBox,
                      height: s.iconBox,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    ...defFont,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("M.DEF")}
                </Typography>
                <Typography sx={{ ...defFont, color: "#fff" }}>
                  {currMDef}
                </Typography>
              </Box>
              {isInteractive && (
                <ModifierControls
                  value={pc.modifiers?.mdef ?? 0}
                  onChange={(v) =>
                    onUpdate?.((p) => ({
                      ...p,
                      modifiers: { ...p.modifiers, mdef: v },
                    }))
                  }
                  font={s.font}
                  theme={theme}
                />
              )}
            </Box>
          </CombatStatCard>
        </StatTooltip>

        <StatTooltip
          title={t("Initiative")}
          formula={t("Sum of all initiative modifiers")}
          total={currInit}
          breakdown={[
            ...(equippedArmor
              ? [{ label: equippedArmor.name, value: baseInit, signed: true }]
              : []),
            ...(equippedArmor?.initModifier
              ? [
                  {
                    label: `${equippedArmor.name} (bonus)`,
                    value: equippedArmor.initModifier,
                    signed: true,
                  },
                ]
              : []),
            ...equippedShields
              .filter((s) => s.initModifier)
              .map((s) => ({
                label: s.name,
                value: s.initModifier,
                signed: true,
              })),
            ...(equippedAccessory?.initModifier
              ? [
                  {
                    label: equippedAccessory.name,
                    value: equippedAccessory.initModifier,
                    signed: true,
                  },
                ]
              : []),
            ...(pc.modifiers?.init
              ? [
                  {
                    label: t("Other bonuses"),
                    value: pc.modifiers.init,
                    signed: true,
                  },
                ]
              : []),
          ].filter((e) => e.value !== 0)}
          display="flex"
          sx={{ width: "100%" }}
        >
          <CombatStatCard sx={{ px: s.cardPx, py: s.cardPy, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <Box sx={layout}>
                <Box
                  sx={{
                    width: s.iconBox,
                    height: s.iconBox,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/icons/stats/icon_clock.png"
                    alt={t("INIT")}
                    sx={{
                      width: s.iconBox,
                      height: s.iconBox,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    ...defFont,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("INIT")}
                </Typography>
                <Typography sx={{ ...defFont, color: "#fff" }}>
                  {(currInit > 0 ? "+" : "") + currInit}
                </Typography>
              </Box>
              {isInteractive && (
                <ModifierControls
                  value={pc.modifiers?.init ?? 0}
                  onChange={(v) =>
                    onUpdate?.((p) => ({
                      ...p,
                      modifiers: { ...p.modifiers, init: v },
                    }))
                  }
                  font={s.font}
                  theme={theme}
                />
              )}
            </Box>
          </CombatStatCard>
        </StatTooltip>

        {isInteractive ? (
          <CombatStatCard sx={{ px: s.cardPx, py: s.cardPy, width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <Box sx={layout}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: s.iconBox,
                    height: s.iconBox,
                  }}
                >
                  <Box
                    component="img"
                    src="/assets/icons/resources/fp.png"
                    alt="FP"
                    sx={{
                      height: s.iconBox,
                      width: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    ...defFont,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  FP
                </Typography>
                <Typography sx={{ ...defFont, color: "#fff" }}>
                  {pc.info.fabulapoints || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 0 }}
              >
                <IconButton
                  size="small"
                  sx={{ p: 0, color: "#fff" }}
                  onClick={() => {
                    const c = parseInt(pc.info?.fabulapoints, 10) || 0;
                    onUpdate?.((p) => ({
                      ...p,
                      info: { ...p.info, fabulapoints: Math.max(0, c - 1) },
                    }));
                  }}
                >
                  <Remove sx={{ fontSize: "0.85rem" }} />
                </IconButton>
                <TextField
                  value={pc.info.fabulapoints || 0}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    onUpdate?.((p) => ({
                      ...p,
                      info: {
                        ...p.info,
                        fabulapoints: Math.max(0, Number.isNaN(v) ? 0 : v),
                      },
                    }));
                  }}
                  size="small"
                  variant="standard"
                  slotProps={{
                    htmlInput: {
                      style: {
                        textAlign: "center",
                        fontFamily: "Antonio",
                        fontWeight: "bold",
                        fontSize: s.font,
                        color: "#fff",
                        WebkitTextFillColor: "#fff",
                      },
                    },
                  }}
                  sx={{
                    width: "24px",
                    "& .MuiInputBase-root": {
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiInputBase-input": {
                      color: "#fff",
                      WebkitTextFillColor: "#fff",
                      p: 0,
                    },
                    "& .MuiInput-underline:before": {
                      borderBottomColor: `${theme.palette.secondary.main} !important`,
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: `${theme.palette.secondary.main} !important`,
                    },
                  }}
                />
                <IconButton
                  size="small"
                  sx={{ p: 0, color: "#fff" }}
                  onClick={() => {
                    const c = parseInt(pc.info?.fabulapoints, 10) || 0;
                    onUpdate?.((p) => ({
                      ...p,
                      info: { ...p.info, fabulapoints: c + 1 },
                    }));
                  }}
                >
                  <Add sx={{ fontSize: "0.85rem" }} />
                </IconButton>
              </Box>
            </Box>
          </CombatStatCard>
        ) : (
          <CombatStatCard sx={{ px: s.cardPx, py: s.cardPy, width: "100%" }}>
            <Box sx={layout}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: s.iconBox,
                  height: s.iconBox,
                }}
              >
                <Box
                  component="img"
                  src="/assets/icons/resources/fp.png"
                  alt="FP"
                  sx={{
                    height: s.iconBox,
                    width: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  ...defFont,
                  color: "#fff",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                FP
              </Typography>
              <Typography sx={{ ...defFont, color: "#fff" }}>
                {pc.info.fabulapoints || 0}
              </Typography>
            </Box>
          </CombatStatCard>
        )}
      </Box>
    </Box>
  );
}
