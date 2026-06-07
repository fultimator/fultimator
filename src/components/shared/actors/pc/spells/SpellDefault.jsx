import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Icon,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Edit,
  VisibilityOff,
  SettingsSuggest,
  Casino,
  Message,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { OffensiveSpellIcon } from "/src/components/icons"; // Ensure this path is correct
import attributes from "/src/libs/attributes";
import { CloseBracket, OpenBracket } from "/src/components/Bracket";
import { useTranslate } from "/src/translation/translate";
import { useCustomTheme } from "/src/hooks/useCustomTheme";

const StyledMarkdown = styled(ReactMarkdown)({
  whiteSpace: "pre-line",
});

function ThemedSpellDefault({
  spellName,
  mp,
  perTarget,
  maxTargets,
  targetDescription,
  duration,
  description,
  onEdit,
  onRoll,
  onChat,
  isOffensive,
  attr1,
  attr2,
  showInPlayerSheet,
  isMagisphere,
  isEditMode,
  index,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? "#ffffff" : "#000000";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  return (
    <>
      {/* Row 1 */}
      {index === 0 && (
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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
              size="grow"
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Spell")}
              </Typography>
            </Grid>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={2}
            >
              <Typography variant="h3">{t("MP")}</Typography>
            </Grid>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={{
                xs: 3,
                sm: 4,
              }}
            >
              <Typography variant="h3">{t("Target")}</Typography>
            </Grid>
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={{
                xs: 4,
                sm: 3,
              }}
            >
              <Typography variant="h3">{t("Duration")}</Typography>
            </Grid>
          </Grid>
          {(isEditMode ||
            (isOffensive && onRoll) ||
            (!isOffensive && onChat)) && (
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                flexShrink: 0,
                ml: 1,
              }}
            />
          )}
        </div>
      )}
      {/* Row 2 */}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
            size="grow"
          >
            <Typography
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              {isMagisphere && (
                <Tooltip title={t("Magisphere")}>
                  <SettingsSuggest sx={{ fontSize: "1rem" }} />
                </Tooltip>
              )}{" "}
              {spellName} {isOffensive && <OffensiveSpellIcon />}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={2}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.7rem", sm: "1rem" },
              }}
            >
              {mp}
              {perTarget && maxTargets !== 1 ? ` × ${t("T")}` : ""}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 3,
              sm: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.7rem", sm: "1rem" },
              }}
            >
              {targetDescription}
            </Typography>
          </Grid>
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            size={{
              xs: 4,
              sm: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.7rem", sm: "1rem" },
              }}
            >
              {duration}
            </Typography>
          </Grid>
        </Grid>
        {(isEditMode ||
          (isOffensive && onRoll) ||
          (!isOffensive && onChat)) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexShrink: 0,
              ml: 1,
              gap: "2px",
            }}
          >
            {isEditMode && !showInPlayerSheet && (
              <Tooltip title={t("Spell not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            {!isOffensive && onChat && (
              <IconButton size="small" onClick={onChat} sx={{ p: "3px" }}>
                <Message sx={{ fontSize: "1.1rem", color: iconColor }} />
              </IconButton>
            )}
            {isOffensive && onRoll && (
              <IconButton size="small" onClick={onRoll} sx={{ p: "3px" }}>
                <Casino sx={{ fontSize: "1.1rem", color: iconColor }} />
              </IconButton>
            )}
            {isEditMode && (
              <IconButton size="small" onClick={onEdit} sx={{ p: "3px" }}>
                <Edit sx={{ fontSize: "1.1rem", color: iconColor }} />
              </IconButton>
            )}
          </Box>
        )}
      </div>
      {/* Row 3 */}
      <Grid
        container
        sx={{
          justifyContent: "flex-start",
          background: "transparent",
          padding: "3px 17px",
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid size={12}>
          <Typography component={"div"} sx={{ minHeight: "30px" }}>
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {description}
            </StyledMarkdown>
          </Typography>
        </Grid>
        {isOffensive && (
          <Grid size={12}>
            <Typography
              variant="body1"
              style={{
                marginTop: "1px",
                fontWeight: "bold",
              }}
            >
              {t("Magic Check") + ": "}
              <strong>
                <OpenBracket />
                {t(attributes[attr1].shortcaps)}
                {t(" + ")}
                {t(attributes[attr2].shortcaps)}
                <CloseBracket />
              </strong>
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default function SpellDefault(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellDefault {...props} />
    </ThemeProvider>
  );
}
