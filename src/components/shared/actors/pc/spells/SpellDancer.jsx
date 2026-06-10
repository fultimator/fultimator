import React from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { VisibilityOff, ExpandMore, Info, Edit } from "@mui/icons-material";
import { useTranslate } from "/src/translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

function ThemedSpellDancer({ dance, isEditMode, onEdit }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

  const showInPlayerSheet =
    dance.showInPlayerSheet || dance.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  const customDanceKeys = new Set(["dance_custom", "dance_custom_name"]);
  const getDanceName = (dan) => {
    const key = dan.key || dan.name;
    if (customDanceKeys.has(key)) return dan.customName || t("dance_custom_name");
    return dan.customName || t(key || dan.name || "");
  };
  const getDanceDuration = (dan) => {
    const key = dan.key || dan.name;
    return customDanceKeys.has(key) ? dan.duration : t(dan.duration || "");
  };
  const getDanceEffect = (dan) => {
    const key = dan.key || dan.name;
    return customDanceKeys.has(key) ? dan.effect : t(dan.effect || "");
  };

  return (
    <>
      <Accordion
        disableGutters
        elevation={0}
        square
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Info />
          </Icon>
          <Typography variant="h4">{t("Dance Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ _node, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t("dance_details_1")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {/* DANCES */}
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
          alignItems: "center",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size={4}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("dance_dance")}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
            size={8}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("Effect")}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {!showInPlayerSheet && (
              <Tooltip title={t("Dance not shown in player sheet")}>
                <VisibilityOff sx={{ fontSize: "1.1rem", opacity: 0.7 }} />
              </Tooltip>
            )}
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ color: "#fff", p: "3px" }}
            >
              <Edit sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </div>
        )}
      </div>
      {(dance.dances ?? []).length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("dance_empty_dances")}
        </Typography>
      ) : (
        (dance.dances ?? []).map((dan, i) => (
          <div
            key={i}
            style={{
              background:
                i % 2 === 0
                  ? `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`
                  : "transparent",
              padding: "6px 17px",
              display: "flex",
              justifyContent: "space-between",
              minHeight: 44,
              fontSize: "0.9rem",
              borderTop: `1px solid ${theme.secondary}`,
              borderBottom: `1px solid ${theme.secondary}`,
            }}
          >
            <Grid container spacing={1.5} style={{ flexGrow: 1 }}>
              <Grid
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
                size={4}
              >
                <div>
                  <Typography
                    sx={{
                      ...bodyTextSx,
                      fontWeight: "bold",
                    }}
                  >
                    {getDanceName(dan)}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", lineHeight: 1.3, opacity: 0.85 }}>
                    {getDanceDuration(dan)}
                  </Typography>
                </div>
              </Grid>
              <Grid
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
                size={8}
                sx={bodyTextSx}
              >
                <ReactMarkdown components={components}>
                  {getDanceEffect(dan)}
                </ReactMarkdown>
              </Grid>
            </Grid>
          </div>
        ))
      )}
    </>
  );
}

export default function SpellDancer(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellDancer {...props} />
    </ThemeProvider>
  );
}
