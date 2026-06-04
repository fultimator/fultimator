import React from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import {
  DexAttributeIcon,
  InsAttributeIcon,
  MigAttributeIcon,
  WlpAttributeIcon,
} from "/src/components/icons";
import StatTooltip from "/src/components/common/StatTooltip";
import { calculateAttribute } from "/src/libs/playerCalculations";
import { deriveCombatStats } from "/src/components/shared/actors/core-utils";
import { CombatStatCard } from "/src/components/shared/actors/pc/shared";
import PcResources from "/src/components/shared/actors/common/PcResources";

const STAT_LABEL_SHADOW = "-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000";

function CombatStatDisplay({ icon, label, value, tooltip }) {
  const card = (
    <CombatStatCard sx={{ px: { xs: "6px", sm: "8px" }, py: "4px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          minHeight: "36px",
        }}
      >
        {icon}
        <Typography
          sx={{
            fontFamily: "'Antonio', fantasy, sans-serif",
            fontWeight: "bold",
            fontSize: {
              xs: "0.9rem",
              sm: "1.1rem",
              md: "1.2rem",
              lg: "1.3rem",
            },
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            textShadow: STAT_LABEL_SHADOW,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Antonio', fantasy, sans-serif",
            fontSize: {
              xs: "0.9rem",
              sm: "1.1rem",
              md: "1.2rem",
              lg: "1.3rem",
            },
            fontWeight: "bold",
            lineHeight: 1.2,
            color: "#fff",
          }}
        >
          {value}
        </Typography>
      </Box>
    </CombatStatCard>
  );
  if (tooltip)
    return (
      <StatTooltip {...tooltip} display="flex" sx={{ flex: 1 }}>
        {card}
      </StatTooltip>
    );
  return card;
}

export default function PcStats({
  pc,
  isInteractive = false,
  onUpdate,
  updateMaxStats,
}) {
  const { t } = useTranslate();
  const theme = useTheme();

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
  } = deriveCombatStats(pc);

  const getAttributeColor = (base, current) => {
    if (current < base) return theme.palette.error.main;
    if (current > base) return theme.palette.success.main;
    return theme.palette.text.primary;
  };

  const onStatusChange = (status) => (event) => {
    onUpdate?.((prev) => ({
      ...prev,
      statuses: { ...prev.statuses, [status]: event.target.checked },
    }));
  };

  const isImmune = (status) => pc.immunities?.[status] === true;

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

  const STATUSES_LEFT = [
    { key: "slow", label: t("Slow") },
    { key: "dazed", label: t("Dazed") },
    { key: "weak", label: t("Weak") },
    { key: "shaken", label: t("Shaken") },
  ];

  const statusLabel = (label, checked) => (
    <Typography
      variant="body2"
      sx={{
        fontFamily: "'Antonio', fantasy, sans-serif",
        fontSize: { xs: "0.68rem", sm: "0.8rem", md: "0.86rem", lg: "0.92rem" },
        textShadow: checked ? STAT_LABEL_SHADOW : "none",
      }}
    >
      {label}
    </Typography>
  );

  const statusCheckbox = (key) => (
    <Checkbox
      sx={{
        margin: 0,
        padding: 0,
        "& .MuiSvgIcon-root": { fontSize: { xs: "1rem", sm: "1.2rem" } },
      }}
      checked={pc.statuses[key]}
      onChange={isInteractive ? onStatusChange(key) : undefined}
      disabled={!isInteractive || isImmune(key)}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 0.75, sm: 1, md: 1.2, lg: 1.4 },
        p: { xs: 0.5, sm: 1, md: 1.25, lg: 1.5 },
      }}
    >
      {/* HP / MP / IP bars */}
      <PcResources pc={pc} isInteractive={isInteractive} onUpdate={onUpdate} />

      {/* Attributes + statuses grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isInteractive ? "repeat(4, 1fr)" : "auto auto auto auto",
          gridTemplateRows: "repeat(4, auto)",
          alignItems: "center",
          rowGap: { xs: "2px", md: "4px", lg: "5px" },
          columnGap: { xs: "2px", sm: "6px", md: "8px", lg: "10px" },
        }}
      >
        {ATTRIBUTES.map(
          ({ key, label, fullName, curr, Icon, debuffs, buffs }, i) => {
            const leftStatus = STATUSES_LEFT[i];
            const rightStatus =
              i === 0
                ? { key: "enraged", label: t("Enraged") }
                : i === 2
                  ? { key: "poisoned", label: t("Poisoned") }
                  : null;
            return (
              <React.Fragment key={key}>
                {isInteractive ? (
                  <Box
                    sx={{
                      gridColumn: "span 2",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      py: { xs: "2px", sm: "3px" },
                    }}
                  >
                    <Box
                      sx={{
                        fontFamily: "'Antonio'",
                        fontWeight: "bold",
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.35,
                        mb: 0.25,
                      }}
                    >
                      <Icon size="1em" />
                      {label}
                    </Box>
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
                        fontSize: { xs: "0.85rem", sm: "1rem" },
                        minWidth: { xs: 38, sm: 48 },
                      }}
                    >
                      {[6, 8, 10, 12].map((v) => (
                        <MenuItem
                          key={v}
                          value={v}
                          sx={{ fontFamily: "'Antonio', fantasy, sans-serif" }}
                        >
                          d{v}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontFamily: "'Antonio'",
                        fontWeight: "bold",
                        fontSize: {
                          xs: "0.8rem",
                          sm: "1rem",
                          md: "1.08rem",
                          lg: "1.14rem",
                        },
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        py: { xs: "4px", sm: "5px", md: "6px" },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}
                      >
                        <Icon size="1.2em" />
                        {label}:
                      </Box>
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <StatTooltip
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
                        display="inline-flex"
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Antonio', fantasy, sans-serif",
                            fontSize: {
                              xs: "0.8rem",
                              sm: "1rem",
                              md: "1.08rem",
                              lg: "1.14rem",
                            },
                            fontWeight: "bold",
                            color: getAttributeColor(pc.attributes[key]?.base, curr),
                            lineHeight: 1,
                            cursor: "help",
                          }}
                        >
                          d{curr}
                        </Typography>
                      </StatTooltip>
                    </Box>
                  </>
                )}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={statusCheckbox(leftStatus.key)}
                    label={statusLabel(leftStatus.label, pc.statuses?.[leftStatus.key])}
                    sx={{ margin: 0 }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    alignSelf: rightStatus ? "end" : "center",
                    transform: rightStatus ? "translateY(60%)" : "none",
                  }}
                >
                  {rightStatus && (
                    <FormControlLabel
                      control={statusCheckbox(rightStatus.key)}
                      label={statusLabel(rightStatus.label, pc.statuses?.[rightStatus.key])}
                      sx={{ margin: 0 }}
                    />
                  )}
                </Box>
              </React.Fragment>
            );
          },
        )}
      </Box>

      {/* DEF / MDEF / INIT / FP */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 0.5, sm: 1, md: 1.25, lg: 1.5 },
          flexWrap: "wrap",
        }}
      >
        <CombatStatDisplay
          label={t("DEF")}
          icon={
            <Box
              component="img"
              src="/assets/icons/stats/icon_def.png"
              alt={t("DEF")}
              sx={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
              }}
            />
          }
          value={currDef}
          tooltip={{
            title: t("Defense"),
            formula: isMartialArmor
              ? `${equippedArmor?.name ?? t("Armor")} (${t("fixed")})`
              : equippedArmor
                ? `DEX d${pc.attributes.dexterity?.base} + ${equippedArmor.name} +${equippedArmor.def}`
                : `DEX d${pc.attributes.dexterity?.base}`,
            total: currDef,
            breakdown: [
              ...(isMartialArmor
                ? [
                    {
                      label: `${equippedArmor?.name ?? t("Armor")} (${t("martial, fixed")})`,
                      value: baseDef,
                    },
                  ]
                : [
                    {
                      label: `DEX d${pc.attributes.dexterity?.base}`,
                      value: currDex,
                    },
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
            ].filter((e) => e.value !== 0),
          }}
        />
        <CombatStatDisplay
          label={t("M.DEF")}
          icon={
            <Box
              component="img"
              src="/assets/icons/stats/icon_mdef.png"
              alt={t("M.DEF")}
              sx={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
              }}
            />
          }
          value={currMDef}
          tooltip={{
            title: t("Magic Defense"),
            formula: isMartialArmor
              ? `${equippedArmor?.name ?? t("Armor")} (${t("fixed")})`
              : equippedArmor
                ? `INS d${pc.attributes.insight?.base} + ${equippedArmor.name} +${equippedArmor.mdef}`
                : `INS d${pc.attributes.insight?.base}`,
            total: currMDef,
            breakdown: [
              ...(isMartialArmor
                ? [
                    {
                      label: `${equippedArmor?.name ?? t("Armor")} (${t("martial, fixed")})`,
                      value: baseMDef,
                    },
                  ]
                : [
                    {
                      label: `INS d${pc.attributes.insight?.base}`,
                      value: currInsight,
                    },
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
            ].filter((e) => e.value !== 0),
          }}
        />
        <CombatStatDisplay
          label={t("INIT")}
          icon={
            <Box
              component="img"
              src="/assets/icons/stats/icon_clock.png"
              alt={t("INIT")}
              sx={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
              }}
            />
          }
          value={(currInit > 0 ? "+" : "") + currInit}
          tooltip={{
            title: t("Initiative"),
            formula: t("Sum of all initiative modifiers"),
            total: currInit,
            breakdown: [
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
            ].filter((e) => e.value !== 0),
          }}
        />
        {/* FP */}
        {isInteractive ? (
          <CombatStatCard sx={{ px: { xs: "6px", sm: "8px" }, py: "6px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                minHeight: "42px",
              }}
            >
              <Box
                component="img"
                src="/assets/icons/resources/fp.png"
                alt="FP"
                sx={{
                  width: "32px",
                  height: "32px",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Antonio', fantasy, sans-serif",
                  fontWeight: "bold",
                  fontSize: { xs: "0.9rem", lg: "1.3rem" },
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#fff",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  textShadow: STAT_LABEL_SHADOW,
                }}
              >
                FP
              </Typography>
              <IconButton
                size="small"
                sx={{ p: 0.25, color: "#fff" }}
                onClick={() => {
                  const c = parseInt(pc.info?.fabulapoints, 10) || 0;
                  onUpdate?.((p) => ({
                    ...p,
                    info: { ...p.info, fabulapoints: Math.max(0, c - 1) },
                  }));
                }}
              >
                <Remove sx={{ fontSize: "1.05rem" }} />
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
                      color: "#fff",
                      WebkitTextFillColor: "#fff",
                    },
                  },
                }}
                sx={{
                  width: { xs: "36px", sm: "44px" },
                  "& .MuiInput-underline:before": {
                    borderBottomColor: "rgba(255,255,255,0.6)",
                  },
                  "& .MuiInput-underline:after": { borderBottomColor: "#fff" },
                }}
              />
              <IconButton
                size="small"
                sx={{ p: 0.25, color: "#fff" }}
                onClick={() => {
                  const c = parseInt(pc.info?.fabulapoints, 10) || 0;
                  onUpdate?.((p) => ({
                    ...p,
                    info: { ...p.info, fabulapoints: c + 1 },
                  }));
                }}
              >
                <Add sx={{ fontSize: "1.05rem" }} />
              </IconButton>
            </Box>
          </CombatStatCard>
        ) : (
          <CombatStatDisplay
            label="FP"
            icon={
              <Box
                component="img"
                src="/assets/icons/resources/fp.png"
                alt="FP"
                sx={{
                  width: "32px",
                  height: "32px",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
            }
            value={pc.info.fabulapoints || 0}
          />
        )}
      </Box>
    </Box>
  );
}
