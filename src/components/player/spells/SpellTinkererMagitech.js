import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  useTheme,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Edit, VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellTinkererMagitech({ magitech, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? '#ffffff' : '#000000';
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

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
          marginBottom: "5px",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.secondary}`,
          borderTop: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs
            flexGrow
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <Typography
              fontWeight="bold"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Current Rank") + ": " + t(ranks[magitech.rank-1])}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            item
            xs
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {!showInPlayerSheet && (
              <Tooltip title={t("Magitech not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color:  iconColor }} />
            </IconButton>
          </Grid>
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
            justifyContent: "space-between",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Magitech Override")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
            </Grid>
          )}
        </div>
      )}
      {/* Row 2 Magitech Override */}
      {magitech.rank >= 1 && (
        <Accordion sx={{ marginY: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: theme.primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown>
              {t(
                "MagitechOverride_desc"
              )}
            </ReactMarkdown>
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
            justifyContent: "space-between",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Magicannon")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
            </Grid>
          )}
        </div>
      )}

      {/* Row 2 Magicannon */}
      {magitech.rank >= 2 && (
        <Accordion sx={{ marginY: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: theme.primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown>
              {t(
                "Magicannon_desc1"
              )}
            </ReactMarkdown>
            <ReactMarkdown>
              {t(
                "Magicannon_desc2"
              )}
            </ReactMarkdown>
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
            justifyContent: "space-between",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Magispheres")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
            </Grid>
          )}
        </div>
      )}

      {/* Row 2 Magispheres */}
      {magitech.rank >= 3 && (
        <Accordion sx={{ marginY: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: theme.primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown>
              {t(
                "Magispheres_desc1"
              )}
            </ReactMarkdown>
            <ReactMarkdown>
              {t(
                "Magispheres_desc2"
              )}
            </ReactMarkdown>
            <ReactMarkdown>
              {t(
                "Magispheres_desc3"
              )}
            </ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

export default function SpellTinkererMagitech(props) {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererMagitech {...props} />
    </ThemeProvider>
  );
}
