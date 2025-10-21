import React from "react";
import {
  Typography,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { VisibilityOff, ExpandMore, Transform } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellMutant({ mutant, onEditTherioforms, isEditMode, onEdit }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    mutant.showInPlayerSheet || mutant.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ ...props }) => <p style={inlineStyles} {...props} />,
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Transform />
          </Icon>
          <Typography variant="h4">{t("mutant_details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("mutant_details_1")}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {isEditMode && (
        <Grid
          item
          xs
          style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          <Button
            onClick={onEdit}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("mutant_therioforms")}
          </Button>
          <Button
            onClick={onEditTherioforms}
            variant="outlined"
            sx={{ marginTop: 2, marginBottom: 2, marginRight: 2 }}
          >
            {t("mutant_settings_modal")}
          </Button>
          {!showInPlayerSheet && (
            <Tooltip title={t("mutant_therioforms_not_shown_tooltip")}>
              <Icon>
                <VisibilityOff style={{ color: "black" }} />
              </Icon>
            </Tooltip>
          )}
        </Grid>
      )}

      {/* THERIOFORMS */}
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
          marginTop: "20px",
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("mutant_therioform")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={6}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("mutant_genoclepsis_suggestions")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {mutant.therioforms && mutant.therioforms.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("No therioforms available")}
        </Typography>
      ) : (
        mutant.therioforms &&
        mutant.therioforms.map((therioform, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
                padding: "3px 17px",
                display: "flex",
                justifyContent: "space-between",
                borderTop: `1px solid ${theme.secondary}`,
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs={6}
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
                    {therioform.name === "mutant_therioform_custom_name"
                      ? therioform.customName
                      : t(therioform.name)}
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <ReactMarkdown components={components}>
                    {therioform.name === "mutant_therioform_custom_name"
                      ? therioform.genoclepsis
                      : t(therioform.genoclepsis)}
                  </ReactMarkdown>
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
                    minHeight: 34,
                  }}
                ></Grid>
              )}
            </div>
            <Grid
              container
              justifyContent="flex-start"
              sx={{
                background: "transparent",
                padding: "3px 17px",
                marginBottom: "6px",
                borderBottom: `1px solid ${theme.secondary}`,
              }}
            >
              <Grid container style={{ flexGrow: 1 }}>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "left",
                  }}
                >
                  <ReactMarkdown components={components}>
                    {therioform.name === "mutant_therioform_custom_name"
                      ? therioform.description
                      : t(therioform.description)}
                  </ReactMarkdown>
                </Grid>
              </Grid>
            </Grid>
          </React.Fragment>
        ))
      )}
    </>
  );
}

export default function SpellMutant(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellMutant {...props} />
    </ThemeProvider>
  );
}