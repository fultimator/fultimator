import React from "react";
import {
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, KeyboardArrowDown, KeyboardArrowUp, Remove, Star } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import NotesMarkdown from "/src/components/common/NotesMarkdown";
import SectionCard from "/src/components/shared/actors/common/SectionCard";
import {
  getMnemosphereHeroicDescription,
  getMnemosphereSkillDescription,
} from "/src/libs/player/mnemosphereClassUtils";
import { getMnemosphereCost } from "/src/libs/mnemospheres";

function DescriptionText({ children }) {
  if (!children) return null;
  return (
    <Box sx={{ px: 1.5, py: 0.75, color: "text.secondary", lineHeight: 1.5 }}>
      <NotesMarkdown uniform fontSize="0.9rem">{children}</NotesMarkdown>
    </Box>
  );
}

function SubHeader({ children, actions = null }) {
  const theme = useCustomTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 0.5,
        background: theme.ternary,
        minHeight: 32,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      {actions}
    </Box>
  );
}

function SkillRow({ skill, _index, editable, budgetExhausted, onIncrease, onDecrease }) {
  const theme = useCustomTheme();
  const { t } = useTranslate();
  return (
    <Box sx={{ borderTop: `1px solid ${theme.secondary}`, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 0.5,
          gap: 1,
          background: theme.primary,
          minHeight: 40,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Antonio",
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.1rem" },
            textTransform: "uppercase",
            color: "#fff",
            flex: 1,
            lineHeight: 1.3,
          }}
        >
          {t(skill.skillName ?? skill.name ?? "")}
        </Typography>
        {editable ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
            <IconButton
              size="small"
              sx={{ p: "3px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
              onClick={onDecrease}
              disabled={skill.currentLvl <= 0}
            >
              <Remove sx={{ fontSize: "1rem" }} />
            </IconButton>
            <Typography sx={{ fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", color: "#fff", lineHeight: 1, minWidth: 36, textAlign: "center" }}>
              SL{skill.currentLvl}/{skill.maxLvl}
            </Typography>
            <IconButton
              size="small"
              sx={{ p: "3px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
              onClick={onIncrease}
              disabled={skill.currentLvl >= skill.maxLvl || budgetExhausted}
            >
              <Add sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Box>
        ) : (
          <Typography sx={{ fontFamily: "Antonio", fontSize: "0.85rem", fontWeight: "bold", color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>
            SL{skill.currentLvl}/{skill.maxLvl}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function MnemosphereClassCard({
  item,
  isCharacterSheet = false,
  editable = false,
  showAllSkills = false,
  onIncreaseSkillLevel = () => {},
  onDecreaseSkillLevel = () => {},
  availableLevels = null,
  onInvestLevel = null,
  onRefundLevel = null,
  isAccordion = false,
  isExpanded = false,
  onToggleExpand = () => {},
  actions = null,
  isSlotted = false,
  showHeaderMeta = false,
  _showHeader = true,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const muiTheme = useTheme();
  const secondary = muiTheme.palette.secondary.main;

  const skills = item.skills ?? [];
  const heroic = item.heroic ?? [];
  const spells = item.spells ?? [];
  const sphereLvl = item.lvl ?? 1;
  const baseLvl = item.baseLvl ?? item.lvl ?? 1;

  const budgetExhausted = availableLevels !== null && availableLevels <= 0;
  const showLevelControls = editable && (onInvestLevel || onRefundLevel);
  const showBaseLevel = baseLvl !== sphereLvl;
  const visibleSkills = skills
    .map((skill, index) => ({ skill, index }))
    .filter(({ skill }) => editable || showAllSkills || (skill.currentLvl ?? 0) >= 1);

  const cost = getMnemosphereCost(sphereLvl);
  const metaParts = [
    showHeaderMeta && cost ? `${cost}z` : null,
    showHeaderMeta && isSlotted ? t("Slotted") : null,
  ].filter(Boolean);

  const headerActions = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
      {metaParts.length > 0 && (
        <Typography sx={{ color: "rgba(255,255,255,0.75)", fontFamily: "Antonio", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
          {metaParts.join(" · ")}
        </Typography>
      )}
      {showBaseLevel && (
        <Typography sx={{ color: "rgba(255,255,255,0.75)", fontFamily: "Antonio", fontSize: "0.8rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {t("Base")} {baseLvl}
        </Typography>
      )}
      {showLevelControls ? (
        <>
          <Tooltip title={t("Refund Level")}><span>
            <IconButton size="small" sx={{ p: "6px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
              onClick={(e) => { e.stopPropagation(); onRefundLevel?.(); }}
              disabled={!onRefundLevel || sphereLvl <= baseLvl}>
              <Remove sx={{ fontSize: "1.15rem" }} />
            </IconButton>
          </span></Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, px: "10px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
            <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "1rem", fontWeight: "bold", lineHeight: 1 }}>Lv {sphereLvl}/5</Typography>
          </Box>
          <Tooltip title={t("Invest Level")}><span>
            <IconButton size="small" sx={{ p: "6px", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "4px" }}
              onClick={(e) => { e.stopPropagation(); onInvestLevel?.(); }}
              disabled={!onInvestLevel || sphereLvl >= 5}>
              <Add sx={{ fontSize: "1.15rem" }} />
            </IconButton>
          </span></Tooltip>
          {availableLevels !== null && (
            <Typography sx={{ fontFamily: "Antonio", fontSize: "0.8rem", whiteSpace: "nowrap", color: budgetExhausted ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)" }}>
              {availableLevels} {t("lvl avail.")}
            </Typography>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 36, px: "8px", borderRadius: "4px", bgcolor: "rgba(255,255,255,0.18)" }}>
          <Typography sx={{ color: "#fff", fontFamily: "Antonio", fontSize: "1rem", fontWeight: "bold", lineHeight: 1 }}>Lv {sphereLvl}/5</Typography>
        </Box>
      )}
      {actions}
      {isAccordion && (
        <IconButton size="small" sx={{ p: "4px", color: "#fff", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}>
          {isExpanded ? <KeyboardArrowUp sx={{ fontSize: "1.3rem" }} /> : <KeyboardArrowDown sx={{ fontSize: "1.3rem" }} />}
        </IconButton>
      )}
    </Box>
  );

  const cardBody = (
    <>
      {visibleSkills.length > 0 && (
        <>
          <SubHeader>
            <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em", flex: 1 }}>
              {t("Skills")}
            </Typography>
          </SubHeader>
          {visibleSkills.map(({ skill, index }) => (
            <React.Fragment key={`${skill.skillName ?? skill.name}-${index}`}>
              <SkillRow
                skill={skill}
                index={index}
                editable={editable}
                budgetExhausted={budgetExhausted}
                onIncrease={() => onIncreaseSkillLevel(index)}
                onDecrease={() => onDecreaseSkillLevel(index)}
              />
              <DescriptionText>{t(getMnemosphereSkillDescription(item, skill) ?? "")}</DescriptionText>
            </React.Fragment>
          ))}
        </>
      )}

      {heroic.length > 0 && (
        <>
          <SubHeader>
            <Star sx={{ fontSize: "1rem", color: secondary, mr: 0.5, flexShrink: 0 }} />
            <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em" }}>
              {t("Heroic Skills")}
            </Typography>
          </SubHeader>
          {heroic.map((heroicSkill, index) => (
            <React.Fragment key={`${heroicSkill.name}-${index}`}>
              <Box sx={{ borderTop: `1px solid ${theme.secondary}`, px: 2, py: 0.5, background: theme.primary, minHeight: 40, display: "flex", alignItems: "center" }}>
                <Star sx={{ fontSize: "0.9rem", color: secondary, mr: 0.75, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "#fff", flex: 1, lineHeight: 1.3 }}>
                  {t(heroicSkill.name)}
                </Typography>
              </Box>
              <DescriptionText>{t(getMnemosphereHeroicDescription(item, heroicSkill) ?? "")}</DescriptionText>
            </React.Fragment>
          ))}
        </>
      )}

      {spells.length > 0 && (
        <>
          <SubHeader>
            <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: "0.85rem", textTransform: "uppercase", color: "text.primary", letterSpacing: "0.04em" }}>
              {t("Spells")}
            </Typography>
          </SubHeader>
          {spells.map((spell, index) => (
            <React.Fragment key={`${spell.name}-${index}`}>
              <Box sx={{ borderTop: `1px solid ${theme.secondary}`, px: 2, py: 0.5, background: theme.primary, minHeight: 40, display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "Antonio", fontWeight: "bold", fontSize: { xs: "1rem", sm: "1.1rem" }, textTransform: "uppercase", color: "#fff", flex: 1, lineHeight: 1.3 }}>
                  {t(spell.name ?? "")}
                </Typography>
              </Box>
              <DescriptionText>{t(spell.description ?? "")}</DescriptionText>
            </React.Fragment>
          ))}
        </>
      )}
    </>
  );

  return (
    <SectionCard
      title={t(item.class)}
      actions={headerActions}
      onHeaderClick={isAccordion ? onToggleExpand : undefined}
      noShadow={isCharacterSheet}
    >
      {isAccordion ? (
        <Collapse in={isExpanded}>{cardBody}</Collapse>
      ) : (
        cardBody
      )}
    </SectionCard>
  );
}
