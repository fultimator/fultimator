import React from "react";
import {
  Box,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "@mui/material";
import { Casino } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";
import ReactMarkdown from "react-markdown";
import { StyledMarkdown } from "/src/components/shared/actors/pc/variants/compact/spells/StyledSpellComponents";
import { AlchemyRollDialog } from "/src/components/shared/actors/pc/spells/SpellTinkererAlchemy";
import { sendDisplayMessage } from "/src/hooks/useRollToChat";

const StyledTableCell = styled(TableCell)({
  padding: "4px 8px",
  fontSize: "0.85rem",
  lineHeight: 1.35,
  verticalAlign: "middle",
  borderBottom: "1px solid rgba(224, 224, 224, 1)",
});

export default function SpellGadget({ spell }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const ranks = [t("Basic"), t("Advanced"), t("Superior")];
  const [rollRank, setRollRank] = React.useState(null);
  const inlineMarkdownComponents = {
    p: ({ _node, ...props }) => <span {...props} />,
  };

  const handleMagitechOverride = (event) => {
    event.stopPropagation();
    sendDisplayMessage("spell", t("Magitech Override"), {
      speaker: "",
      description: t("MagitechOverride_desc"),
      cost: { resource: "mp", amount: 10 },
    });
  };

  const renderAlchemy = () => (
    <>
      <TableRow
        sx={{
          backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
        }}
      >
        <StyledTableCell colSpan={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", flex: 1, minWidth: 0 }}
            >
              {t("Mix")}: {ranks[spell.rank - 1]} ({t("IP Cost")}:{" "}
              {spell.rank + 2})
            </Typography>
            <Tooltip title={t("Roll Mix")} arrow>
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setRollRank(spell.rank || 1);
                }}
                sx={{ p: "2px" }}
              >
                <Casino sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </StyledTableCell>
      </TableRow>
      <TableRow sx={{ backgroundColor: theme.secondary }}>
        <StyledTableCell
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {t("Targets")}
        </StyledTableCell>
        <StyledTableCell
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {t("The potions affects...")}
        </StyledTableCell>
      </TableRow>
      {spell.targets?.map((target, i) => (
        <TableRow key={`target-${i}`}>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {target.rangeFrom}-{target.rangeTo}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
            <StyledMarkdown components={inlineMarkdownComponents}>
              {target.effect}
            </StyledMarkdown>
          </StyledTableCell>
        </TableRow>
      ))}
      <TableRow sx={{ backgroundColor: theme.secondary }}>
        <StyledTableCell
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {t("Die")}
        </StyledTableCell>
        <StyledTableCell
          sx={{
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {t("Effect")}
        </StyledTableCell>
      </TableRow>
      {spell.effects?.map((effect, i) => (
        <TableRow key={`effect-${i}`}>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {effect.dieValue === 0 ? t("Any") : effect.dieValue}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
            <StyledMarkdown components={inlineMarkdownComponents}>
              {effect.effect}
            </StyledMarkdown>
          </StyledTableCell>
        </TableRow>
      ))}
    </>
  );

  const renderInfusion = () => (
    <>
      <TableRow
        sx={{
          backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
        }}
      >
        <StyledTableCell colSpan={2}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            {t("Current Rank")}: {ranks[spell.rank - 1]}
          </Typography>
        </StyledTableCell>
      </TableRow>
      {spell.effects?.map((effect, i) => (
        <TableRow key={`infusion-${i}`}>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {effect.name}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
            <ReactMarkdown
              components={{ p: ({ _node, ...props }) => <span {...props} /> }}
            >
              {effect.effect}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      ))}
    </>
  );

  const renderMagitech = () => (
    <>
      <TableRow
        sx={{
          backgroundImage: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
        }}
      >
        <StyledTableCell colSpan={2}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            {t("Current Rank")}: {ranks[spell.rank - 1]}
          </Typography>
        </StyledTableCell>
      </TableRow>
      {spell.rank >= 1 && (
        <TableRow>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {t("Magitech Override")}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ReactMarkdown
                  components={{
                    p: ({ _node, ...props }) => <span {...props} />,
                  }}
                >
                  {t("MagitechOverride_desc")}
                </ReactMarkdown>
              </Box>
              <Tooltip title={t("Send to Chat")} arrow>
                <IconButton
                  size="small"
                  onClick={handleMagitechOverride}
                  sx={{ p: "2px", flexShrink: 0 }}
                >
                  <Casino sx={{ fontSize: "1.1rem" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </StyledTableCell>
        </TableRow>
      )}
      {spell.rank >= 2 && (
        <TableRow>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {t("Magicannon")}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
            <ReactMarkdown
              components={{ p: ({ _node, ...props }) => <span {...props} /> }}
            >
              {t("Magicannon_desc1")}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      )}
      {spell.rank >= 3 && (
        <TableRow>
          <StyledTableCell sx={{ fontWeight: "bold", width: "30%" }}>
            {t("Magispheres")}
          </StyledTableCell>
          <StyledTableCell sx={{ width: "70%", fontSize: "0.85rem" }}>
            <ReactMarkdown
              components={{ p: ({ _node, ...props }) => <span {...props} /> }}
            >
              {t("Magispheres_desc1")}
            </ReactMarkdown>
          </StyledTableCell>
        </TableRow>
      )}
    </>
  );

  const getTitle = () => {
    switch (spell.spellType) {
      case "tinkerer-alchemy":
        return t("Alchemy");
      case "tinkerer-infusion":
        return t("Infusion");
      case "tinkerer-magitech":
        return t("Magitech");
      default:
        return t("Gadget");
    }
  };

  return (
    <>
      <Table size="small" sx={{ border: `1px solid ${theme.primary}40` }}>
        <TableBody>
          {/* Header Row */}
          <TableRow sx={{ backgroundColor: theme.primary }}>
            <StyledTableCell
              colSpan={2}
              sx={{
                color: theme.white,
                fontWeight: "bold",
                fontSize: "0.85rem",
                "& *": { color: `${theme.white} !important` },
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: theme.white,
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  lineHeight: 1.35,
                }}
              >
                {getTitle()}
                {spell.className ? ` - ${t(spell.className)}` : ""}
              </Typography>
            </StyledTableCell>
          </TableRow>

          {spell.spellType === "tinkerer-alchemy" && renderAlchemy()}
          {spell.spellType === "tinkerer-infusion" && renderInfusion()}
          {spell.spellType === "tinkerer-magitech" && renderMagitech()}
        </TableBody>
      </Table>
      {spell.spellType === "tinkerer-alchemy" && rollRank !== null && (
        <AlchemyRollDialog
          open
          onClose={() => setRollRank(null)}
          rank={rollRank}
          alchemy={spell}
          speaker=""
          t={t}
        />
      )}
    </>
  );
}
