import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Edit, VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

function ThemedSpellTinkererMagitech({ magitech, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    magitech.showInPlayerSheet || magitech.showInPlayerSheet === undefined;

  const ranks = ["Basic", "Advanced", "Superior"];

  return (
    <>
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "3px 17px",
          display: "flex",

          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.secondary}`,
          borderTop: `1px solid ${theme.secondary}`,
        }}
      >
        <Typography style={{ flexGrow: 1, marginRight: "5px" }} sx={{ fontWeight: "bold" }}>
          {(magitech.spellName || t("Magitech")) + " (" + t(ranks[magitech.rank - 1]) + ")"}
        </Typography>
        {isEditMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {!showInPlayerSheet && (
              <Tooltip title={t("Magitech not shown in player sheet")}>
                <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit} sx={{ p: "3px" }}>
              <Edit sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </div>
        )}
      </div>
      {/* Row 1 Magitech Override */}
      {magitech.rank >= 1 && (
        <div
          style={{
            backgroundColor: theme.primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: theme.white,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" style={{ flexGrow: 1, marginRight: "5px" }}>
            {t("Magitech Override")}
          </Typography>
        </div>
      )}
      {/* Row 2 Magitech Override */}
      {magitech.rank >= 1 && (
        <Accordion disableGutters elevation={0} square sx={{ borderBottom: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: theme.primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ py: "6px", px: "12px" }}>
            <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("MagitechOverride_desc")}</ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Row 1 Magicannon */}
      {magitech.rank >= 2 && (
        <div
          style={{
            backgroundColor: theme.primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: theme.white,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" style={{ flexGrow: 1, marginRight: "5px" }}>
            {t("Magicannon")}
          </Typography>
        </div>
      )}
      {/* Row 2 Magicannon */}
      {magitech.rank >= 2 && (
        <Accordion disableGutters elevation={0} square sx={{ borderBottom: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: theme.primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ py: "6px", px: "12px" }}>
            <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("Magicannon_desc1")}</ReactMarkdown>
            <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("Magicannon_desc2")}</ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Row 1 Magispheres */}
      {magitech.rank >= 3 && (
        <div
          style={{
            backgroundColor: theme.primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: theme.white,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="h3" style={{ flexGrow: 1, marginRight: "5px" }}>
            {t("Magispheres")}
          </Typography>
        </div>
      )}
      {/* Row 2 Magispheres */}
      {magitech.rank >= 3 && (
        <Accordion disableGutters elevation={0} square sx={{ borderBottom: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: theme.primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ py: "6px", px: "12px" }}>
            <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("Magispheres_desc1")}</ReactMarkdown>
            <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("Magispheres_desc2")}</ReactMarkdown>
            <ReactMarkdown components={{ p: ({ node: _n, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>{t("Magispheres_desc3")}</ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

export default function SpellTinkererMagitech(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererMagitech {...props} />
    </ThemeProvider>
  );
}
