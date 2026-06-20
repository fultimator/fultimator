import React from "react";
import {
  Typography,
  Box,
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

function ThemedSpellSymbolist({ symbol, isEditMode, onEdit }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";
  const bodyTextSx = { fontSize: "0.9rem", lineHeight: 1.35 };

  const showInPlayerSheet =
    symbol.showInPlayerSheet || symbol.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ _node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  const getSymbolName = (sym) => {
    const key = sym.key || sym.name;
    if (key === "symbol_custom_name") return sym.customName || t("symbol_custom_name");
    return sym.customName || t(key || sym.name || "");
  };
  const getSymbolEffect = (sym) => {
    const key = sym.key || sym.name;
    return key === "symbol_custom_name" ? sym.effect : t(sym.effect || "");
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
          <Typography variant="h4">{t("Symbols Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ py: "6px", px: "12px" }}>
          <ReactMarkdown
            components={{
              p: ({ _node, ...props }) => (
                <p style={{ margin: 0 }} {...props} />
              ),
            }}
          >
            {t("symbol_details_1")}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {/* SYMBOLS */}
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
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <Box sx={{ flex: "0 0 25%", display: "flex", alignItems: "center", minHeight: "40px" }}>
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
            >
              {t("symbol_symbol")}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", minHeight: "40px" }}>
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
            >
              {t("Effect")}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ width: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          {isEditMode && (
            <>
              {!showInPlayerSheet && (
                <Tooltip title={t("Symbols not shown in player sheet")}>
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
            </>
          )}
        </Box>
      </div>
      {(symbol.symbols ?? []).length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("symbol_empty_symbols")}
        </Typography>
      ) : (
        (symbol.symbols ?? []).map((sym, i) => (
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
            <Box sx={{ display: "flex", flexGrow: 1 }}>
              <Box sx={{ flex: "0 0 25%", display: "flex", alignItems: "center" }}>
                <Typography
                  style={{ flexGrow: 1, marginRight: "5px" }}
                  sx={{ ...bodyTextSx, fontWeight: "bold" }}
                >
                  {getSymbolName(sym)}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", ...bodyTextSx }}>
                <ReactMarkdown components={components}>
                  {getSymbolEffect(sym)}
                </ReactMarkdown>
              </Box>
            </Box>
            <Box sx={{ width: 34, flexShrink: 0 }} />
          </div>
        ))
      )}
    </>
  );
}

export default function SpellSymbolist(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellSymbolist {...props} />
    </ThemeProvider>
  );
}
