import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Grid,
  Box,
  Chip,
  Tooltip,
  ClickAwayListener,
  Alert,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreVert,
  Star,
  AutoFixHigh,
  Add,
  Remove,
  Edit,
  Search,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useTranslate } from "../../../../translation/translate";
import { useCustomTheme } from "../../../../hooks/useCustomTheme";
import { usePlayerSheetCompactStore } from "../../../../store/playerSheetCompactStore";
import CompendiumViewerModal from "../../../compendium/CompendiumViewerModal";
import SpellDefault from "./spells/SpellDefault";
import SpellArcanist from "./spells/SpellArcanist";
import SpellEntropistGamble from "./spells/SpellEntropistGamble";
import SpellInvoker from "./spells/SpellInvoker";
import SpellGourmet from "./spells/SpellGourmet";
import SpellMagiseed from "./spells/SpellMagiseed";
import SpellGadget from "./spells/SpellGadget";
import SpellMagichant from "./spells/SpellMagichant";
import SpellSymbol from "./spells/SpellSymbol";
import SpellDance from "./spells/SpellDance";
import SpellGift from "./spells/SpellGift";
import SpellTherioform from "./spells/SpellTherioform";
import SpellVehicle from "./spells/SpellVehicle";
import SpellDeck from "./spells/SpellDeck";

// Styled Components
const StyledTableCellHeader = styled(TableCell)({ padding: 0, color: "#fff" });
const StyledTableCell = styled(TableCell)({ padding: 0 });

const StyledMarkdown = ({ children, ...props }) => (
  <div style={{ whiteSpace: "pre-line", display: "inline" }}>
    <ReactMarkdown
      {...props}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: (p) => <p style={{ margin: 0 }} {...p} />,
        ul: (p) => <ul style={{ margin: 0 }} {...p} />,
        li: (p) => <li style={{ margin: 0 }} {...p} />,
        strong: (p) => <strong style={{ fontWeight: "bold" }} {...p} />,
        em: (p) => <em style={{ fontStyle: "italic" }} {...p} />,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

const BenefitChip = ({ label, value, tooltipText }) => {
  const [open, setOpen] = useState(false);
  if (value === 0) return null;
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        title={tooltipText}
        open={open}
        onClose={() => setOpen(false)}
        disableHoverListener
      >
        <Chip
          label={`${label}${typeof value === "number" ? ` +${value}` : ""}`}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 0, cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
      </Tooltip>
    </ClickAwayListener>
  );
};

const BenefitChips = ({ benefits, t }) => {
  const chipConfigs = [
    {
      key: "hpplus",
      label: t("HP"),
      tooltip: t("Permanently increase your maximum Hit Points by"),
    },
    {
      key: "mpplus",
      label: t("MP"),
      tooltip: t("Permanently increase your maximum Mind Points by"),
    },
    {
      key: "ipplus",
      label: t("IP"),
      tooltip: t("Permanently increase your maximum Inventory Points by"),
    },
    {
      key: "rituals.ritualism",
      label: t("Ritualism"),
      tooltip: t(
        "You may perform Rituals whose effects fall within the Ritualism discipline.",
      ),
    },
    {
      key: "martials.melee",
      label: t("Melee Weapons"),
      tooltip: t("Gain the ability to equip martial melee weapons."),
    },
    {
      key: "martials.ranged",
      label: t("Ranged Weapons"),
      tooltip: t("Gain the ability to equip martial ranged weapons."),
    },
    {
      key: "martials.shields",
      label: t("Shields"),
      tooltip: t("Gain the ability to equip martial shields."),
    },
    {
      key: "martials.armor",
      label: t("Armor"),
      tooltip: t("Gain the ability to equip martial armor."),
    },
  ];

  const getValueByPath = (obj, path) =>
    path.split(".").reduce((acc, part) => acc?.[part], obj);

  const getCustomBenefitDisplayText = (text) => {
    if (
      text.includes("You may start Projects to create unique foods and drinks")
    )
      return "Project";
    if (
      text.includes(
        "You may choose to permanently increase your maximum Hit Points or Mind Points by 5",
      )
    )
      return "HP/MP +5 (Choice)";
    return text;
  };

  return (
    <>
      {chipConfigs.map(({ key, label, tooltip }) => {
        const value = getValueByPath(benefits, key);
        if (!value && value !== 0) return null;
        return (
          <BenefitChip
            key={key}
            label={label}
            value={typeof value === "number" ? value : undefined}
            tooltipText={
              typeof value === "number" ? `${tooltip} ${value}` : tooltip
            }
          />
        );
      })}
      {benefits.custom?.map((text, i) => (
        <BenefitChip
          key={`custom-${i}`}
          label={getCustomBenefitDisplayText(text)}
          tooltipText={text}
        />
      ))}
    </>
  );
};

function highlightMatch(text, query) {
  const source = text == null ? "" : String(text);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const safeQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  const parts = source.split(regex);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark
        key={`${part}-${idx}`}
        style={{ backgroundColor: "yellow", padding: 0 }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function highlightMarkdownText(markdown, query) {
  const source = markdown == null ? "" : String(markdown);
  const trimmedQuery = query?.trim();
  if (!trimmedQuery) return source;
  const safeQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "ig");
  return source.replace(regex, "<mark>$1</mark>");
}

function collectStringValues(value, bag = []) {
  if (typeof value === "string") {
    bag.push(value);
    return bag;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStringValues(entry, bag));
    return bag;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((entry) => collectStringValues(entry, bag));
  }
  return bag;
}

function getSpellSearchText(spell, t) {
  const rawStrings = collectStringValues(spell, []);
  const translatedStrings = rawStrings.map((text) => t(text));
  return [...rawStrings, ...translatedStrings].join(" ").toLowerCase();
}

function getSpellName(spell, t) {
  const name = spell.name || spell.spellName;
  if (name && name !== t("Unnamed Spell")) return name;
  switch (spell.spellType) {
    case "magiseed":
      return t("magiseed_garden");
    case "cooking":
      return t("Gourmet");
    case "invocation":
      return t("Invoker");
    case "deck":
      return t("ace_deck_management");
    case "tinkerer-alchemy":
      return t("Alchemy");
    case "tinkerer-infusion":
      return t("Infusion");
    case "tinkerer-magitech":
      return t("Magitech");
    case "magichant":
      return t("Magichant");
    case "symbol":
      return t("Symbol");
    case "dance":
      return t("Dance");
    case "gift":
      return t("Gift");
    case "therioform":
      return t("Therioform");
    case "pilot-vehicle":
      return t("Pilot Vehicle");
    case "arcanist":
      return t("Arcanist");
    case "arcanist-rework":
      return t("Arcanist-Rework");
    default:
      return t("Unnamed Spell");
  }
}

function isVisibleSpell(spell) {
  return (
    (spell.showInPlayerSheet || spell.showInPlayerSheet === undefined) &&
    (spell.spellType === "default" ||
      spell.spellType === "gamble" ||
      spell.spellType === "invocation" ||
      spell.spellType === "cooking" ||
      spell.spellType === "magiseed" ||
      spell.spellType?.startsWith("tinkerer-") ||
      spell.spellType === "magichant" ||
      spell.spellType === "symbol" ||
      spell.spellType === "dance" ||
      spell.spellType === "gift" ||
      spell.spellType === "therioform" ||
      spell.spellType === "pilot-vehicle" ||
      spell.spellType === "deck" ||
      spell.spellType === "arcanist" ||
      spell.spellType === "arcanist-rework")
  );
}

function renderSpellContent(spell, setPlayer, searchQuery, highlightMatchFn) {
  switch (spell.spellType) {
    case "default":
      return (
        <SpellDefault
          spellName={highlightMatchFn(spell.name, searchQuery)}
          mp={spell.mp}
          maxTargets={spell.maxTargets}
          targetDesc={spell.targetDesc}
          duration={spell.duration}
          description={highlightMatchFn(spell.description, searchQuery)}
          isEditMode={false}
          isOffensive={spell.isOffensive}
          isMagisphere={spell.isMagisphere || false}
          attr1={spell.attr1}
          attr2={spell.attr2}
        />
      );
    case "gamble":
      return <SpellEntropistGamble gamble={spell} isEditMode={false} />;
    case "invocation":
      return <SpellInvoker spell={spell} setPlayer={setPlayer} open={true} />;
    case "cooking":
      return <SpellGourmet spell={spell} open={true} />;
    case "magiseed":
      return <SpellMagiseed spell={spell} setPlayer={setPlayer} open={true} />;
    case "magichant":
      return <SpellMagichant spell={spell} />;
    case "symbol":
      return <SpellSymbol spell={spell} />;
    case "dance":
      return <SpellDance spell={spell} />;
    case "gift":
      return <SpellGift spell={spell} setPlayer={setPlayer} open={true} />;
    case "therioform":
      return <SpellTherioform spell={spell} />;
    case "pilot-vehicle":
      return <SpellVehicle spell={spell} />;
    case "deck":
      return <SpellDeck spell={spell} setPlayer={setPlayer} open={true} />;
    case "arcanist":
    case "arcanist-rework":
      return (
        <SpellArcanist
          arcana={spell}
          isEditMode={false}
          rework={spell.spellType === "arcanist-rework"}
        />
      );
    default:
      if (spell.spellType?.startsWith("tinkerer-"))
        return <SpellGadget spell={spell} />;
      return null;
  }
}

export default function PlayerClasses({
  player,
  setPlayer = null,
  _isMainTab,
  searchQuery = "",
  isEditMode = false,
  onAddBlankClass,
  onAddFromCompendium,
  onEditClass,
  _onAddSkill,
  onEditSkill,
  onEditSpell,
  onLevelChange,
  onIncreaseSkillLevel,
  onDecreaseSkillLevel,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const { openRows, toggleRow } = usePlayerSheetCompactStore();

  const [heroicPickerClassIdx, setHeroicPickerClassIdx] = useState(null);
  const [_blankClassDialogOpen, setBlankClassDialogOpen] = useState(false);
  const [_newBlankClassName, _setNewBlankClassName] = useState("");
  const [_classCompendiumOpen, setClassCompendiumOpen] = useState(false);

  const warnings = useMemo(() => {
    const w = [];
    if (!player.classes || player.classes.length < 2)
      w.push("Character must have at least 2 classes.");
    const maxLvlCount = player.classes
      ? player.classes.filter((c) => c.lvl >= 10).length
      : 0;
    if (player.classes && player.classes.length - maxLvlCount > 3)
      w.push(
        "The number of classes exceeds the limit beyond the number of classes at level 10.",
      );
    const total = player.classes
      ? player.classes.reduce((s, c) => s + parseInt(c.lvl), 0)
      : 0;
    if (total !== player.lvl)
      w.push("Sum of class levels isn't equal to character level.");
    return w;
  }, [player.classes, player.lvl]);

  const handleAddHeroic = (item) => {
    if (heroicPickerClassIdx === null || !setPlayer) return;
    setPlayer((prev) => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === heroicPickerClassIdx
          ? {
              ...cls,
              heroic: { name: item.name, description: item.description },
            }
          : cls,
      ),
    }));
  };

  if (!player.classes?.length) return null;

  return (
    <>
      {warnings.length > 0 && (
        <Box sx={{ mb: 0.5 }}>
          {warnings.map((w, i) => (
            <Alert
              key={i}
              severity="warning"
              sx={{ py: 0, mb: 0.25, fontSize: "0.75rem" }}
            >
              {t(w)}
            </Alert>
          ))}
        </Box>
      )}
      <TableContainer component={Paper}>
        <Table size="small" sx={{ tableLayout: "fixed", minWidth: 400 }}>
          <TableHead>
            <TableRow sx={{ background: theme.primary }}>
              <StyledTableCellHeader sx={{ width: 36 }} />
              <StyledTableCellHeader>
                <Typography
                  variant="h4"
                  sx={{ textTransform: "uppercase", color: "#fff" }}
                >
                  {t("Classes")}
                </Typography>
              </StyledTableCellHeader>
              <StyledTableCellHeader sx={{ width: { xs: 70, sm: 80 } }} />
              <StyledTableCellHeader
                sx={{ width: { xs: 80, sm: 90 }, textAlign: "center" }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    color: "#fff",
                    opacity: 0.8,
                    fontSize: "0.65rem",
                  }}
                >
                  {t("Level")}
                </Typography>
              </StyledTableCellHeader>
              <StyledTableCellHeader
                sx={{ width: { xs: 90, sm: 100 }, textAlign: "right" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {isEditMode && (
                    <>
                      {onAddBlankClass && (
                        <Tooltip title={t("Add Blank Class")}>
                          <IconButton
                            size="small"
                            onClick={() => setBlankClassDialogOpen(true)}
                            sx={{ color: "#fff", p: 0 }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onAddFromCompendium && (
                        <Tooltip title={t("Search Compendium")}>
                          <IconButton
                            size="small"
                            onClick={() => setClassCompendiumOpen(true)}
                            sx={{ color: "#fff", p: 0 }}
                          >
                            <Search fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  )}
                  {/* {!isEditMode && <Typography variant="caption" sx={{ fontWeight: "bold", textTransform: 'uppercase', color: '#fff', opacity: 0.8, fontSize: '0.65rem' }}>{t("Actions")}</Typography>} */}
                </Box>
              </StyledTableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {player.classes
              .filter((cls) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  t(cls.name).toLowerCase().includes(query) ||
                  cls.skills?.some(
                    (s) =>
                      t(s.skillName).toLowerCase().includes(query) ||
                      t(s.description || "")
                        .toLowerCase()
                        .includes(query),
                  ) ||
                  (cls.heroic &&
                    t(cls.heroic.name).toLowerCase().includes(query)) ||
                  cls.spells?.some((spell) =>
                    getSpellSearchText(spell, t).includes(query),
                  )
                );
              })
              .map((cls, classIdx) => {
                const classKey = `class-${classIdx}`;
                const visibleSpells = (cls.spells || []).filter(isVisibleSpell);

                return (
                  <React.Fragment key={classKey}>
                    <TableRow
                      sx={{
                        backgroundColor: openRows.classes[classKey]
                          ? "rgba(0,0,0,0.02)"
                          : "inherit",
                      }}
                    >
                      <StyledTableCell sx={{ width: 36 }}>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow("classes", classKey);
                          }}
                          size="small"
                        >
                          {openRows.classes[classKey] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </StyledTableCell>
                      <StyledTableCell
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow("classes", classKey);
                        }}
                        sx={{ cursor: "pointer" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            py: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {highlightMatch(t(cls.name), searchQuery)}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell sx={{ width: { xs: 70, sm: 80 } }} />
                      <StyledTableCell sx={{ width: { xs: 80, sm: 90 } }}>
                        {isEditMode && onLevelChange ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                onLevelChange(
                                  classIdx,
                                  Math.max(1, cls.lvl - 1),
                                )
                              }
                              sx={{ p: 0 }}
                              disabled={cls.lvl <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                mx: 0.25,
                                minWidth: 32,
                                textAlign: "center",
                              }}
                            >
                              {cls.lvl}/10
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onLevelChange(
                                  classIdx,
                                  Math.min(10, cls.lvl + 1),
                                )
                              }
                              sx={{ p: 0 }}
                              disabled={cls.lvl >= 10}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Typography sx={{ textAlign: "center" }}>
                            {cls.lvl}/10
                          </Typography>
                        )}
                      </StyledTableCell>
                      <StyledTableCell
                        sx={{ width: { xs: 90, sm: 100 }, textAlign: "right" }}
                      >
                        {isEditMode && onEditClass && (
                          <IconButton
                            size="small"
                            onClick={() => onEditClass(classIdx)}
                            sx={{ p: 0.25 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                      </StyledTableCell>
                    </TableRow>
                    {/* NESTED CONTENT WITH VERTICAL CONNECTOR LINE */}
                    <TableRow>
                      <StyledTableCell
                        colSpan={5}
                        sx={{
                          p: 0,
                          borderBottom: openRows.classes[classKey]
                            ? "1px solid rgba(0,0,0,0.12)"
                            : "none",
                        }}
                      >
                        <Collapse
                          in={openRows.classes[classKey]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              ml: 2.5,
                              borderLeft: `2px solid ${theme.primary}55`, // Semi-transparent theme color
                              pl: 1,
                              pb: 1,
                              mt: 0.5,
                            }}
                          >
                            {/* Benefits Section */}
                            {!isEditMode && cls.benefits && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: "bold",
                                    opacity: 0.7,
                                    textTransform: "uppercase",
                                    fontSize: "0.65rem",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {t("Benefits")}:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <BenefitChips benefits={cls.benefits} t={t} />
                                </Box>
                              </Box>
                            )}

                            {/* Skills Section */}
                            <Grid container>
                              <Grid size={12}>
                                <Table size="small">
                                  <TableBody>
                                    {cls.skills
                                      ?.map((skill, originalSkillIdx) => ({
                                        skill,
                                        originalSkillIdx,
                                      }))
                                      .filter(
                                        ({ skill }) =>
                                          isEditMode || skill.currentLvl >= 1,
                                      )
                                      .map(({ skill, originalSkillIdx }) => {
                                        const skillKey = `skill-${classIdx}-${originalSkillIdx}`;
                                        const translatedDescription = t(
                                          skill.description || "",
                                        );
                                        const skillDescriptionMatchesQuery =
                                          !!searchQuery?.trim() &&
                                          translatedDescription
                                            .toLowerCase()
                                            .includes(
                                              searchQuery.trim().toLowerCase(),
                                            );
                                        const isSkillOpen =
                                          !!openRows.classes[skillKey] ||
                                          skillDescriptionMatchesQuery;
                                        return (
                                          <React.Fragment key={skillKey}>
                                            <TableRow
                                              sx={{ "& td": { border: 0 } }}
                                            >
                                              <StyledTableCell
                                                sx={{ width: 36 }}
                                              >
                                                <IconButton
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleRow(
                                                      "classes",
                                                      skillKey,
                                                    );
                                                  }}
                                                  size="small"
                                                >
                                                  {isSkillOpen ? (
                                                    <KeyboardArrowUp />
                                                  ) : (
                                                    <KeyboardArrowDown />
                                                  )}
                                                </IconButton>
                                              </StyledTableCell>
                                              <StyledTableCell
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleRow(
                                                    "classes",
                                                    skillKey,
                                                  );
                                                }}
                                                sx={{ cursor: "pointer" }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      fontWeight: "bold",
                                                      mr: 0.5,
                                                    }}
                                                  >
                                                    {highlightMatch(
                                                      t(skill.skillName),
                                                      searchQuery,
                                                    )}
                                                  </Typography>
                                                  <MoreVert
                                                    sx={{
                                                      fontSize: "1rem",
                                                      opacity: 0.6,
                                                    }}
                                                  />
                                                </Box>
                                              </StyledTableCell>
                                              <StyledTableCell
                                                sx={{ width: 80 }}
                                              />
                                              <StyledTableCell
                                                sx={{ width: 90 }}
                                              >
                                                {isEditMode &&
                                                onIncreaseSkillLevel ? (
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      justifyContent: "center",
                                                      gap: 0.25,
                                                    }}
                                                  >
                                                    <IconButton
                                                      size="small"
                                                      onClick={() =>
                                                        onDecreaseSkillLevel(
                                                          classIdx,
                                                          originalSkillIdx,
                                                        )
                                                      }
                                                      sx={{ p: 0.25 }}
                                                      disabled={
                                                        skill.currentLvl <= 0
                                                      }
                                                    >
                                                      <Remove fontSize="small" />
                                                    </IconButton>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        minWidth: 40,
                                                        textAlign: "center",
                                                      }}
                                                    >
                                                      {skill.currentLvl}/
                                                      {skill.maxLvl}
                                                    </Typography>
                                                    <IconButton
                                                      size="small"
                                                      onClick={() =>
                                                        onIncreaseSkillLevel(
                                                          classIdx,
                                                          originalSkillIdx,
                                                        )
                                                      }
                                                      sx={{ p: 0.25 }}
                                                      disabled={
                                                        skill.currentLvl >=
                                                        skill.maxLvl
                                                      }
                                                    >
                                                      <Add fontSize="small" />
                                                    </IconButton>
                                                  </Box>
                                                ) : (
                                                  <Typography
                                                    sx={{ textAlign: "center" }}
                                                  >
                                                    {skill.currentLvl}/
                                                    {skill.maxLvl}
                                                  </Typography>
                                                )}
                                              </StyledTableCell>
                                              <StyledTableCell
                                                sx={{
                                                  width: 100,
                                                  textAlign: "right",
                                                }}
                                              >
                                                {isEditMode && onEditSkill && (
                                                  <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                      onEditSkill(
                                                        classIdx,
                                                        originalSkillIdx,
                                                      )
                                                    }
                                                    sx={{ p: 0.25 }}
                                                  >
                                                    <Edit fontSize="small" />
                                                  </IconButton>
                                                )}
                                              </StyledTableCell>
                                            </TableRow>
                                            <TableRow>
                                              <StyledTableCell
                                                colSpan={5}
                                                sx={{ p: 0 }}
                                              >
                                                <Collapse
                                                  in={isSkillOpen}
                                                  timeout="auto"
                                                  unmountOnExit
                                                >
                                                  <Box
                                                    sx={{
                                                      p: 1.5,
                                                      ml: 4,
                                                      bgcolor:
                                                        "rgba(0,0,0,0.03)",
                                                      borderRadius: 1,
                                                    }}
                                                  >
                                                    <StyledMarkdown
                                                      allowedElements={[
                                                        "strong",
                                                        "mark",
                                                      ]}
                                                      unwrapDisallowed
                                                    >
                                                      {highlightMarkdownText(
                                                        translatedDescription,
                                                        searchQuery,
                                                      )}
                                                    </StyledMarkdown>
                                                  </Box>
                                                </Collapse>
                                              </StyledTableCell>
                                            </TableRow>
                                          </React.Fragment>
                                        );
                                      })}

                                    {/* Heroic Skill Row */}
                                    {cls.lvl === 10 && (
                                      <React.Fragment>
                                        <TableRow
                                          sx={{ "& td": { border: 0 } }}
                                        >
                                          <StyledTableCell sx={{ width: 36 }}>
                                            <IconButton
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRow(
                                                  "classes",
                                                  `heroic-${classIdx}`,
                                                );
                                              }}
                                              size="small"
                                            >
                                              {openRows.classes[
                                                `heroic-${classIdx}`
                                              ] ? (
                                                <KeyboardArrowUp />
                                              ) : (
                                                <KeyboardArrowDown />
                                              )}
                                            </IconButton>
                                          </StyledTableCell>
                                          <StyledTableCell
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleRow(
                                                "classes",
                                                `heroic-${classIdx}`,
                                              );
                                            }}
                                            sx={{ cursor: "pointer" }}
                                          >
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  fontWeight: "bold",
                                                  mr: 0.5,
                                                  color: theme.secondary,
                                                }}
                                              >
                                                {cls.heroic?.name ? (
                                                  highlightMatch(
                                                    t(cls.heroic.name),
                                                    searchQuery,
                                                  )
                                                ) : (
                                                  <em>
                                                    {t("No Heroic Skill")}
                                                  </em>
                                                )}
                                              </Typography>
                                              <Star
                                                sx={{
                                                  color: theme.secondary,
                                                  fontSize: "1rem",
                                                }}
                                              />
                                            </Box>
                                          </StyledTableCell>
                                          <StyledTableCell colSpan={2} />
                                          <StyledTableCell
                                            sx={{
                                              width: 100,
                                              textAlign: "right",
                                            }}
                                          >
                                            {isEditMode && setPlayer && (
                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  setHeroicPickerClassIdx(
                                                    classIdx,
                                                  )
                                                }
                                              >
                                                <Search fontSize="small" />
                                              </IconButton>
                                            )}
                                          </StyledTableCell>
                                        </TableRow>
                                        <TableRow>
                                          <StyledTableCell
                                            colSpan={5}
                                            sx={{ p: 0 }}
                                          >
                                            <Collapse
                                              in={
                                                openRows.classes[
                                                  `heroic-${classIdx}`
                                                ]
                                              }
                                              timeout="auto"
                                              unmountOnExit
                                            >
                                              <Box
                                                sx={{
                                                  p: 1.5,
                                                  ml: 4,
                                                  bgcolor: "rgba(0,0,0,0.03)",
                                                  borderRadius: 1,
                                                }}
                                              >
                                                <StyledMarkdown
                                                  allowedElements={[
                                                    "strong",
                                                    "mark",
                                                  ]}
                                                  unwrapDisallowed
                                                >
                                                  {highlightMarkdownText(
                                                    t(
                                                      cls.heroic?.description ||
                                                        "No description yet.",
                                                    ),
                                                    searchQuery,
                                                  )}
                                                </StyledMarkdown>
                                              </Box>
                                            </Collapse>
                                          </StyledTableCell>
                                        </TableRow>
                                      </React.Fragment>
                                    )}

                                    {/* Spells Section */}
                                    {visibleSpells.map((spell, spellIdx) => {
                                      const spellKey = `spell-${classIdx}-${spellIdx}`;
                                      return (
                                        <React.Fragment key={spellKey}>
                                          <TableRow
                                            sx={{ "& td": { border: 0 } }}
                                          >
                                            <StyledTableCell sx={{ width: 36 }}>
                                              <IconButton
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleRow(
                                                    "classes",
                                                    spellKey,
                                                  );
                                                }}
                                                size="small"
                                              >
                                                {openRows.classes[spellKey] ? (
                                                  <KeyboardArrowUp />
                                                ) : (
                                                  <KeyboardArrowDown />
                                                )}
                                              </IconButton>
                                            </StyledTableCell>
                                            <StyledTableCell
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRow("classes", spellKey);
                                              }}
                                              sx={{ cursor: "pointer" }}
                                            >
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontWeight: "bold",
                                                    mr: 0.5,
                                                  }}
                                                >
                                                  {highlightMatch(
                                                    getSpellName(spell, t),
                                                    searchQuery,
                                                  )}
                                                </Typography>
                                                <AutoFixHigh
                                                  sx={{
                                                    color: theme.secondary,
                                                    fontSize: "1rem",
                                                  }}
                                                />
                                              </Box>
                                            </StyledTableCell>
                                            <StyledTableCell colSpan={2} />
                                            <StyledTableCell
                                              sx={{
                                                width: 100,
                                                textAlign: "right",
                                              }}
                                            >
                                              {isEditMode && onEditSpell && (
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    onEditSpell(
                                                      classIdx,
                                                      spellIdx,
                                                      spell,
                                                    )
                                                  }
                                                >
                                                  <Edit fontSize="small" />
                                                </IconButton>
                                              )}
                                            </StyledTableCell>
                                          </TableRow>
                                          <TableRow>
                                            <StyledTableCell
                                              colSpan={5}
                                              sx={{ p: 0 }}
                                            >
                                              <Collapse
                                                in={openRows.classes[spellKey]}
                                                timeout="auto"
                                                unmountOnExit
                                              >
                                                <Box sx={{ p: 1.5, ml: 4 }}>
                                                  {renderSpellContent(
                                                    spell,
                                                    setPlayer,
                                                    searchQuery,
                                                    highlightMatch,
                                                  )}
                                                </Box>
                                              </Collapse>
                                            </StyledTableCell>
                                          </TableRow>
                                        </React.Fragment>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </StyledTableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Modals remain the same */}
      <CompendiumViewerModal
        open={heroicPickerClassIdx !== null}
        onClose={() => setHeroicPickerClassIdx(null)}
        onAddItem={handleAddHeroic}
        initialType="heroics"
        restrictToTypes={["heroics"]}
        context="player"
      />
    </>
  );
}
