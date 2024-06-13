import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  useTheme,
  ThemeProvider,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import { OffensiveSpellIcon } from "../../icons"; // Ensure this path is correct
import attributes from "../../../libs/attributes";
import { CloseBracket, OpenBracket } from "../../Bracket";
import { useTranslate } from "../../../translation/translate";

const StyledMarkdown = styled(ReactMarkdown)({
  whiteSpace: "pre-line",
});

function ThemedSpellDefault({
  spellName,
  mp,
  maxTargets,
  targetDesc,
  duration,
  description,
  onEdit,
  isOffensive,
  attr1,
  attr2,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  return (
    <>
      {/* Row 2 */}
      <div
        style={{
          background: `linear-gradient(to right, ${ternary}, ${white})`,
          padding: "3px 17px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${secondary}`,
          borderBottom: `1px solid ${secondary}`,
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid item xs flexGrow style={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
            <Typography fontWeight="bold" style={{ flexGrow: 1, marginRight: "5px" }}>
              {spellName} {isOffensive && <OffensiveSpellIcon />}
            </Typography>
          </Grid>
          <Grid item xs={2} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography>{mp}{maxTargets !== 1 ? " x " + t("T") : ""}</Typography>
          </Grid>
          <Grid item xs={4} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography>{targetDesc}</Typography>
          </Grid>
          <Grid item xs={3} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography>{duration}</Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid item xs style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color: "black" }} />
            </IconButton>
          </Grid>
        )}
      </div>

      {/* Row 3 */}
      <Grid
        container
        justifyContent="flex-start"
        sx={{
          background: "transparent",
          padding: "3px 17px",
          marginBottom: "6px",
          borderBottom: `1px solid ${secondary}`,
        }}
      >
        <Grid item xs={12}>
          <Typography sx={{minHeight: "30px"}}>
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {description}
            </StyledMarkdown>
          </Typography>
        </Grid>
        {isOffensive && (
          <Grid item xs={12}>
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
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellDefault {...props} />
    </ThemeProvider>
  );
}